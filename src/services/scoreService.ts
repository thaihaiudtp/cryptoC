// === Updated scoring formula according to SCORE-FI ===
// Reference: SCORE-FI_Cong_thuc_chi_tiet

import axios from 'axios';
import { JsonRpcProvider } from 'ethers';

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
        await sleep(1000 * (i + 1));
      } else {
        throw e;
      }
    }
  }
  throw new Error('❌ Max retries exceeded');
}

async function isEOA(address: string): Promise<boolean> {
  try {
    const provider = new JsonRpcProvider("https://eth-mainnet.public.blastapi.io");
    const code = await provider.getCode(address);
    return code === '0x' || code === '0X';
  } catch {
    try {
      const backup = new JsonRpcProvider("https://rpc.ankr.com/eth");
      const code = await backup.getCode(address);
      return code === '0x' || code === '0X';
    } catch {
      return true;
    }
  }
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
  const now = Date.now();
  const tenDaysAgo = now - 2000 * 86400 * 1000;
  const recentTxs = txs.filter(tx => new Date(tx.block_signed_at).getTime() > tenDaysAgo);
  const allProtocols = new Set<string>();
  for (const tx of recentTxs) {
    for (const p of extractProtocolsFromTx(tx)) allProtocols.add(p);
  }
  const n = allProtocols.size;
  const S_rate = 100 * Math.exp(-0.3 * n);
  const txVolume = recentTxs.length;
  const uniqueUsers = new Set(recentTxs.map(tx => tx.from_address)).size;
  const TVL = txVolume * Math.max(1, uniqueUsers / 10);
  const S_quality = Math.min(100, 20 * Math.log10(TVL + 1));
  const newCredit = parseFloat((0.7 * S_rate + 0.3 * S_quality).toFixed(2));
  return { newCredit, n, S_rate, S_quality };
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

export const fetchWalletScore = async (address: string): Promise<ScoreData> => {
  const isEoa = await isEOA(address);
  if (!isEoa) throw new Error(`⛔ Smart contract address`);

  const [balanceRes, txRes] = await Promise.all([
    axios.get(`https://api.covalenthq.com/v1/${CHAIN_ID}/address/${address}/balances_v2/`, { params: { key: COVALENT_API_KEY } }),
    axios.get(`https://api.covalenthq.com/v1/${CHAIN_ID}/address/${address}/transactions_v2/`, { params: { key: COVALENT_API_KEY } })
  ]);

  const tokens = balanceRes.data.data.items || [];
  const txs = txRes.data.data.items || [];

  const totalValueUsd = tokens.reduce((sum: number, t: any) => sum + (t.quote || 0), 0);
  const uniqueProtocols = new Set(tokens.map((t: any) => t.contract_ticker_symbol)).size;

  // I. Payment History
  const n_liq = 0;
  const SC = (1 / (1 + n_liq)) * 100;
  const V_repaid = txs.filter((tx: any) => /repay/i.test(tx.tx_summary || '')).length * 1000;
  const SV = Math.min(100, (Math.log10(1 + V_repaid) / Math.log10(1 + 500000)) * 100);
  const lastRepay = txs.find((tx: any) => /repay/i.test(tx.tx_summary || ''));
  const d_last = lastRepay ? Math.floor((Date.now() - new Date(lastRepay.block_signed_at).getTime()) / (86400 * 1000)) : 999;
  const SR = Math.exp(-0.03 * d_last) * 100;
  const paymentHistory = parseFloat((0.8 * SC + 0.15 * SV + 0.05 * SR).toFixed(2));

  console.log('Payment History:', { n_liq, SC, V_repaid, SV, d_last, SR, paymentHistory });

  // II. Amounts Owed
  const debt = 0;
  const U = debt / (totalValueUsd + 1e-6);
  const amountsOwed = parseFloat((Math.max(0, 100 * Math.exp(-1 * U))).toFixed(2));

  console.log('Amounts Owed:', { debt, totalValueUsd, U, amountsOwed });

  // III. Credit History
  const firstTx = txs[txs.length - 1];
  const daysSinceFirst = firstTx ? Math.floor((Date.now() - new Date(firstTx.block_signed_at).getTime()) / (86400 * 1000)) : 0;
  const activeDays = new Set(txs.map((tx: any) => tx.block_signed_at.split('T')[0])).size;
  const S_age = Math.min(100, (daysSinceFirst / (365 * 3)) * 100);
  const S_activity = (activeDays / Math.max(1, daysSinceFirst)) * 100;
  const creditHistory = parseFloat((0.9 * S_age + 0.1 * S_activity).toFixed(2));

  console.log('Credit History:', { daysSinceFirst, activeDays, S_age, S_activity, creditHistory });

  // IV. Credit Mix
  const categories = {
    lending: ['aave', 'compound', 'cream'],
    dex: ['uniswap', 'sushiswap', 'curve'],
    nft: ['opensea', 'blur', 'rarible'],
    derivatives: ['perp', 'dydx', 'gmx']
  };
  const names = tokens.map((t: any) => t.contract_name?.toLowerCase() || '');
  const count = (keywords: string[]) => names.filter(n => keywords.some(k => n.includes(k))).length;
  const P_lending = count(categories.lending);
  const P_dex = count(categories.dex);
  const P_nft = count(categories.nft);
  const P_deriv = count(categories.derivatives);
  const P_other = Math.max(0, uniqueProtocols - (P_lending + P_dex + P_nft + P_deriv));
  const creditMix = parseFloat(Math.min(100, Math.min(25, 10 * P_lending) + Math.min(20, 10 * P_dex) + Math.min(15, 5 * P_nft) + Math.min(25, 15 * P_deriv) + Math.min(10, 5 * P_other)).toFixed(2));

  console.log('Credit Mix:', { P_lending, P_dex, P_nft, P_deriv, P_other, uniqueProtocols, creditMix });

  // V. New Credit
  const { newCredit } = await computeNewCredit(txs);
  console.log('New Credit:', { newCredit });

  const score = parseFloat((0.35 * paymentHistory + 0.30 * amountsOwed + 0.15 * creditHistory + 0.10 * creditMix + 0.10 * newCredit).toFixed(2));
  const riskLevel = score >= 90 ? 'Low' : score >= 80 ? 'Medium' : 'High';

  console.log('Final Score:', { score, riskLevel });

  return {
    score,
    breakdown: { paymentHistory, amountsOwed, creditHistory, creditMix, newCredit },
    riskLevel,
    lastUpdated: new Date().toISOString()
  };
};
