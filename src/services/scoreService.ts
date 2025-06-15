import axios from 'axios';
// Fix the import for ethers v6
import { JsonRpcProvider } from 'ethers';

// Improved EOA detection function
async function isEOA(address: string): Promise<boolean> {
  try {
    // Use a more reliable provider with better RPC endpoint
    const provider = new JsonRpcProvider("https://eth-mainnet.public.blastapi.io");
    
    // Get code at the address
    const code = await provider.getCode(address);
    
    // Log for debugging
    console.log(`Address ${address} code length: ${code.length}`);
    
    // If code length is 2 (just '0x'), it's an EOA
    return code === '0x' || code === '0X';
  } catch (error) {
    console.error("Error checking if address is EOA:", error);
    
    // In case of error, we should NOT default to true
    // Try alternative verification method
    try {
      // Alternative provider
      const backupProvider = new JsonRpcProvider("https://rpc.ankr.com/eth");
      const code = await backupProvider.getCode(address);
      return code === '0x' || code === '0X';
    } catch (backupError) {
      console.error("Backup EOA check also failed:", backupError);
      
      // If both methods fail, default to true but log a warning
      console.warn(`⚠️ Could not verify if ${address} is EOA or contract. Proceeding with scoring.`);
      return true;
    }
  }
}
export interface ScoreData {
  score: number;
  breakdown: {
    paymentHistory: number;
    amountsOwed: number;
    creditHistory: number;
    creditMix: number;
    newCredit: number;
  };
  riskLevel: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
}

const COVALENT_API_KEY = 'cqt_rQ89vcM6F8mwMHJXvVCg9cgmDfxv';
const CHAIN_ID = 1;
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (e: any) {
      if (e.response?.status === 429 && i < retries - 1) {
        console.warn(`⏳ Retry after 429 (attempt ${i + 1})`);
        await sleep(1000 * (i + 1)); // Exponential backoff
      } else {
        console.error(`❌ Fetch error: ${e.response?.status} - ${e.response?.data?.error_message || e.message}`);
        throw e;
      }
    }
  }
  throw new Error('❌ Max retries exceeded');
}

function extractProtocolsFromTx(tx: any): string[] {
  const protocols = new Set<string>();

  if (Array.isArray(tx.log_events)) {
    for (const log of tx.log_events) {
      const addr = log.sender_address?.toLowerCase();
      if (addr && addr !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        protocols.add(addr);
      }
    }
  }

  return Array.from(protocols);
}




async function computeNewCredit(txs: any[]) {
  txs.sort((a, b) => new Date(b.block_signed_at).getTime() - new Date(a.block_signed_at).getTime())
  const now = Date.now();
  // Change from 30 days to 40 days for analysis period
  const fortyDaysAgo = now - 1000 * 86400 * 1000;

  // 1. Lọc giao dịch trong 40 ngày (thay vì 30 ngày)
  const recentTxs = txs.filter(tx =>
    new Date(tx.block_signed_at).getTime() > fortyDaysAgo
  );
  console.log("🔍 Số giao dịch trong 40 ngày:", recentTxs.length);

  // 2. Trích protocol từ log_events
  const allProtocols = new Set<string>();
  for (const tx of recentTxs) {
    for (const p of extractProtocolsFromTx(tx)) {
      allProtocols.add(p);
    }
  }

  const newProtocols = Array.from(allProtocols);
  const n = newProtocols.length;
  console.log("📊 Số protocol mới trong 40 ngày: %d", n);
  // Tính S_rate theo công thức trong ảnh
  const S_rate = 100 * Math.exp(-0.3 * n);
  
  // Simplified TVL calculation: Use the number of unique transactions as a proxy
  // Loại bỏ việc gọi API lấy holder counts
  const transactionVolume = recentTxs.length;
  const uniqueTxSenders = new Set(recentTxs.map(tx => tx.from_address)).size;
  console.log(`📈 Số lượng giao dịch: ${transactionVolume}, Số người dùng khác nhau: ${uniqueTxSenders}`);
  // Use transaction count as a proxy for TVL
  // TVL = số lượng giao dịch * số người dùng khác nhau
  const TVL = transactionVolume * Math.max(1, uniqueTxSenders / 10);
  
  // Tính S_quality theo công thức, but using our simplified TVL
  const S_quality = Math.min(100, 20 * Math.log10(TVL + 1));
  
  // Tính New Credit score
  const newCredit = parseFloat((0.7 * S_rate + 0.3 * S_quality).toFixed(2));

  console.log(`New Credit calculation: ${n} protocols, TVL proxy: ${TVL.toFixed(2)}, S_rate: ${S_rate.toFixed(2)}, S_quality: ${S_quality.toFixed(2)}`);

  return {
    n,
    S_rate: S_rate.toFixed(2),
    S_quality: S_quality.toFixed(2),
    newCredit,
  };
}



export const fetchWalletScore = async (address: string): Promise<ScoreData> => {
  try {
        // ⚠️ Bỏ qua nếu không phải là ví người dùng
    const isEoa = await isEOA(address);
    if (!isEoa) {
      throw new Error(`⛔ Địa chỉ ${address} là smart contract, không tính điểm.`);
    }
    const [balanceRes, txRes] = await Promise.all([
      axios.get(`https://api.covalenthq.com/v1/${CHAIN_ID}/address/${address}/balances_v2/`, {
        params: { key: COVALENT_API_KEY },
      }),
      axios.get(`https://api.covalenthq.com/v1/${CHAIN_ID}/address/${address}/transactions_v2/`, {
        params: { key: COVALENT_API_KEY },
      })
    ]);

    const tokens = balanceRes.data.data.items || [];
    const txs = txRes.data.data.items || [];

    const totalValueUsd = tokens.reduce((acc: number, token: any) => acc + (token.quote || 0), 0);
    const uniqueProtocols = new Set(tokens.map((t: any) => t.contract_ticker_symbol)).size;

    // === CREDIT HISTORY ===
    let firstTxDate = new Date();
    if (txs.length > 0 && txs[txs.length - 1]?.block_signed_at) {
      firstTxDate = new Date(txs[txs.length - 1].block_signed_at);
    }
    
    const daysSinceFirstTx = Math.max(1, Math.floor((Date.now() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24)));
    const activeDaysSet = new Set(txs.map((tx: any) => tx.block_signed_at.split('T')[0]));
    const activeDays = activeDaysSet.size;

    const S_age = Math.min(100, (daysSinceFirstTx / (365 * 3)) * 100);
    const S_activity = (activeDays / daysSinceFirstTx) * 100;
    const creditHistory = parseFloat((0.9 * S_age + 0.1 * S_activity).toFixed(2));
      
    // === PAYMENT HISTORY ===
    const n_liq = 0;
    const SC = (1 / (1 + n_liq)) * 100;

    const V_repaid = txs.filter((tx: any) => /repay/i.test(tx.tx_summary || '')).length * 1000;
    const SV = Math.min(100, (Math.log10(1 + V_repaid) / Math.log10(1 + 500000)) * 100);

    const lastRepayTx = txs.find((tx: any) => /repay/i.test(tx.tx_summary || ''));
    const d_last_repay = lastRepayTx
      ? Math.floor((Date.now() - new Date(lastRepayTx.block_signed_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const SR = Math.exp(-0.03 * d_last_repay) * 100;

    const paymentHistory = parseFloat((0.8 * SC + 0.15 * SV + 0.05 * SR).toFixed(2));

    // === AMOUNTS OWED ===
    const debt = 0;
    const U = debt / (totalValueUsd + 1e-6);
    const amountsOwed = parseFloat((Math.max(0, 100 * Math.exp(-1 * U))).toFixed(2));

    // === CREDIT MIX ===
    const keywords = {
      lending: ['aave', 'compound', 'cream'],
      dex: ['uniswap', 'sushiswap', 'curve'],
      nft: ['opensea', 'blur', 'rarible'],
      derivatives: ['perp', 'dydx', 'gmx'],
    };
    const tokenNames = tokens.map((t: any) => t.contract_name?.toLowerCase() || '');
    const countByCategory = (list: string[]) =>
      tokenNames.filter(name => list.some(keyword => name.includes(keyword))).length;

    const P_lending = countByCategory(keywords.lending);
    const P_dex = countByCategory(keywords.dex);
    const P_nft = countByCategory(keywords.nft);
    const P_derivatives = countByCategory(keywords.derivatives);
    const P_other = Math.max(0, uniqueProtocols - (P_lending + P_dex + P_nft + P_derivatives));

    const creditMix = parseFloat(Math.min(
      100,
      Math.min(25, 10 * P_lending) +
        Math.min(20, 10 * P_dex) +
        Math.min(15, 5 * P_nft) +
        Math.min(25, 15 * P_derivatives) +
        Math.min(10, 5 * P_other)
    ).toFixed(2));

// === NEW CREDIT ===
const {
    n,
    S_rate,
    S_quality,
    newCredit,
} = await computeNewCredit(txs); 

console.log(`New Credit: ${newCredit}, Protocols: ${n}, S_rate: ${S_rate}, S_quality: ${S_quality}`);
    // === SCORE-FI Tổng thể ===
    const totalScore = parseFloat((
      0.35 * paymentHistory +
      0.30 * amountsOwed +
      0.15 * creditHistory +
      0.10 * creditMix +
      0.10 * newCredit
    ).toFixed(2));

    const riskLevel = totalScore >= 740 ? 'Low' : totalScore >= 580 ? 'Medium' : 'High';

    return {
      score: totalScore,
      breakdown: {
        paymentHistory,
        amountsOwed,
        creditHistory,
        creditMix,
        newCredit,
      },
      riskLevel,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Failed to compute SCORE-FI:', error);
    throw error;
  }
};


