
import { ethers } from 'ethers';
import { getPublicClient } from 'wagmi/actions';
import { config } from '@/config/web3Config';

export interface ScoreData {
  score: number;
  breakdown: {
    paymentHistory: number;
    portfolioDiversity: number;
    transactionVolume: number;
    securityScore: number;
    defiExperience: number;
    liquidityManagement: number;
  };
  riskLevel: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
}

export const fetchWalletScore = async (
  address: string
): Promise<ScoreData> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock score calculation based on address
  const addressHash = parseInt(address.slice(-4), 16);
  const baseScore = 300 + ((addressHash % 550));
  
  // Calculate breakdown scores
  const paymentHistory = Math.min(100, 60 + ((addressHash % 40)));
  const portfolioDiversity = Math.min(100, 50 + ((addressHash % 50)));
  const transactionVolume = Math.min(100, 55 + ((addressHash % 45)));
  const securityScore = Math.min(100, 70 + ((addressHash % 30)));
  const defiExperience = Math.min(100, 45 + ((addressHash % 55)));
  const liquidityManagement = Math.min(100, 50 + ((addressHash % 50)));
  
  const mockData: ScoreData = {
    score: baseScore,
    breakdown: {
      paymentHistory,
      portfolioDiversity,
      transactionVolume,
      securityScore,
      defiExperience,
      liquidityManagement,
    },
    riskLevel: baseScore >= 740 ? 'Low' : baseScore >= 580 ? 'Medium' : 'High',
    lastUpdated: new Date().toISOString(),
  };

  console.log(`Fetched score for ${address}:`, mockData);
  return mockData;
};

export const resolveAddressOrENS = async (
  input: string
): Promise<string> => {
  try {
    // Check if it's an ENS name
    if (input.includes('.eth')) {
      const publicClient = getPublicClient(config);
      const resolved = await publicClient?.getEnsAddress({ name: input });
      if (!resolved) {
        throw new Error('ENS name not found');
      }
      return resolved;
    }
    
    // Validate if it's a valid Ethereum address
    if (ethers.isAddress(input)) {
      return input;
    }
    
    throw new Error('Invalid address or ENS name');
  } catch (error) {
    console.error('Error resolving address:', error);
    throw error;
  }
};
