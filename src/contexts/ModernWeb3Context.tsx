
import { createContext, useContext, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

interface ModernWeb3ContextType {
  account: string | undefined;
  ensName: string | null | undefined;
  connecting: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  isConnected: boolean;
}

const ModernWeb3Context = createContext<ModernWeb3ContextType | undefined>(undefined);

export const ModernWeb3Provider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const { data: ensName } = useEnsName({ address });
  const { isPending: connecting } = useConnect();

  const connectWallet = () => {
    console.log('Opening Web3Modal...');
    open();
  };

  const disconnectWallet = () => {
    console.log('Disconnecting wallet...');
    disconnect();
  };

  return (
    <ModernWeb3Context.Provider
      value={{
        account: address,
        ensName,
        connecting,
        connectWallet,
        disconnectWallet,
        isConnected,
      }}
    >
      {children}
    </ModernWeb3Context.Provider>
  );
};

export const useModernWeb3 = () => {
  const context = useContext(ModernWeb3Context);
  if (context === undefined) {
    throw new Error('useModernWeb3 must be used within a ModernWeb3Provider');
  }
  return context;
};
