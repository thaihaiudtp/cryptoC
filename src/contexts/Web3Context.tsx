
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  account: string | null;
  ensName: string | null;
  provider: ethers.BrowserProvider | null;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connectWallet = async () => {
    console.log('Attempting to connect wallet...');
    
    if (!window.ethereum) {
      console.error('MetaMask not found');
      alert('Please install MetaMask to connect your wallet!');
      return;
    }

    try {
      setConnecting(true);
      console.log('Creating provider...');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log('Provider created:', provider);
      
      console.log('Requesting accounts...');
      const accounts = await provider.send('eth_requestAccounts', []);
      console.log('Accounts received:', accounts);
      
      if (accounts.length > 0) {
        const address = accounts[0];
        console.log('Setting account:', address);
        setAccount(address);
        setProvider(provider);
        
        // Try to resolve ENS name
        try {
          console.log('Attempting ENS lookup for:', address);
          const name = await provider.lookupAddress(address);
          console.log('ENS name found:', name);
          setEnsName(name);
        } catch (error) {
          console.log('No ENS name found for address:', address);
          setEnsName(null);
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          console.log('User rejected the connection request');
        } else {
          alert('Failed to connect wallet. Please try again.');
        }
      }
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    console.log('Disconnecting wallet...');
    setAccount(null);
    setEnsName(null);
    setProvider(null);
  };

  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          console.log('Checking existing wallet connection...');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send('eth_accounts', []);
          
          if (accounts.length > 0) {
            console.log('Found existing connection:', accounts[0]);
            setAccount(accounts[0]);
            setProvider(provider);
            
            try {
              const name = await provider.lookupAddress(accounts[0]);
              setEnsName(name);
            } catch (error) {
              console.log('No ENS name found for existing connection');
            }
          } else {
            console.log('No existing wallet connection found');
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
        }
      } else {
        console.log('MetaMask not detected');
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          // Clear ENS name and refetch
          setEnsName(null);
          if (provider) {
            provider.lookupAddress(accounts[0]).then(setEnsName).catch(() => {});
          }
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [account, provider]);

  return (
    <Web3Context.Provider
      value={{
        account,
        ensName,
        provider,
        connecting,
        connectWallet,
        disconnectWallet,
        isConnected: !!account,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
