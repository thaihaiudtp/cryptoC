
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { mainnet, sepolia } from 'wagmi/chains';


export const projectId = 'f68c7a3bec2e838b6b2b833823d82cac'; // You'll need to get this from https://cloud.walletconnect.com

const metadata = {
  name: 'cryptoC',
  description: 'Web3 Credit Scoring Platform',
  url: 'https://cryptoC.thaihadtp.id.vn', // your domain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Create wagmiConfig
const chains = [mainnet, sepolia] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
})
