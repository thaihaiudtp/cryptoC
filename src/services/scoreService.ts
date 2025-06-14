import axios from 'axios';
import { cpSync } from 'fs';

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

export const fetchWalletScore = async (address: string): Promise<ScoreData> => {
  try {
    // --- 1. Lấy dữ liệu balances ---
    const balanceRes = await axios.get(
      `https://api.covalenthq.com/v1/${CHAIN_ID}/address/${address}/balances_v2/`,
      { params: { key: COVALENT_API_KEY } }
    );

    const tokens = balanceRes.data.data.items || [];
    const totalValueUsd = tokens.reduce((acc: number, token: any) => acc + (token.quote || 0), 0);
    const uniqueProtocols = new Set(tokens.map((t: any) => t.contract_ticker_symbol)).size;

    // --- 2. Lấy dữ liệu giao dịch ---
    const txRes = await axios.get(
      `https://api.covalenthq.com/v1/${CHAIN_ID}/address/${address}/transactions_v2/`,
      { params: { key: COVALENT_API_KEY } }
    );

    const txs = txRes.data.data.items || [];

    // --- Tính thời gian kể từ giao dịch đầu tiên ---
    let firstTxDate = new Date();
    if (txs.length > 0 && txs[txs.length - 1]?.block_signed_at) {
      firstTxDate = new Date(txs[txs.length - 1].block_signed_at);
    }
    const isValidFirstTx = !isNaN(firstTxDate.getTime());
    const daysSinceFirstTx = isValidFirstTx
      ? Math.max(1, Math.floor((Date.now() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 1;

    const activeDaysSet = new Set(txs.map((tx: any) => tx.block_signed_at.split('T')[0]));
    const activeDays = activeDaysSet.size;

    // --- I. PAYMENT HISTORY ---
    const n_liq = 0; // Giả định không bị thanh lý
    const SC = (1 / (1 + n_liq)) * 100;

    const V_repaid = txs.filter((tx: any) => /repay/i.test(tx.tx_summary || '')).length * 1000;
    const SV = Math.min(100, (Math.log10(1 + V_repaid) / Math.log10(1 + 500000)) * 100);

    const lastRepayTx = txs.find((tx: any) => /repay/i.test(tx.tx_summary || ''));
    const d_last_repay = lastRepayTx
      ? Math.floor((Date.now() - new Date(lastRepayTx.block_signed_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const SR = Math.exp(-0.03 * d_last_repay) * 100;

    const paymentHistory = parseFloat((0.80 * SC + 0.15 * SV + 0.05 * SR).toFixed(2));

    // --- II. AMOUNTS OWED ---
    const debt = 0; // chưa có borrow logs → mặc định 0
    const U = debt / (totalValueUsd + 1e-6);
    const amountsOwed = U <= 1 ? Math.round(100 * (1 - U)) : 0;

    // --- III. CREDIT HISTORY ---
    const S_age = Math.min(100, (daysSinceFirstTx / (365 * 3)) * 100);
    const S_activity = daysSinceFirstTx > 0 ? (activeDays / daysSinceFirstTx) * 100 : 0;
    const creditHistory = Math.round(0.9 * S_age + 0.1 * S_activity);
    console.log('Credit History:', creditHistory);
    console.log('S_age:', S_age, 'S_activity:', S_activity);
    // --- IV. CREDIT MIX ---
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

    const creditMix = Math.min(
      100,
      Math.min(25, 10 * P_lending) +
        Math.min(20, 10 * P_dex) +
        Math.min(15, 5 * P_nft) +
        Math.min(25, 15 * P_derivatives) +
        Math.min(10, 5 * P_other)
    );

    // --- V. NEW CREDIT ---
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400 * 1000);
    const protocolsLast30Days = new Set(
      txs.filter((tx: any) => new Date(tx.block_signed_at) > thirtyDaysAgo).map((tx: any) => tx.to_address)
    );
    const n = protocolsLast30Days.size;
    const S_rate = 100 * Math.exp(-0.5 * n);
    const S_quality = 70; // giả định trung bình
    const newCredit = Math.round(0.7 * S_rate + 0.3 * S_quality);

    // --- Tổng hợp điểm SCORE-FI ---
    const totalScore = Math.round(
      0.35 * paymentHistory +
        0.3 * amountsOwed +
        0.15 * creditHistory +
        0.1 * creditMix +
        0.1 * newCredit
    );

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
