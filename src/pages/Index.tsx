import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Shield, BarChart3, Zap, Twitter, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useModernWeb3 } from '@/contexts/ModernWeb3Context';
import { toast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

const Index = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [searching, setSearching] = useState(false);
  const { account, ensName, connectWallet, disconnectWallet, isConnected, connecting } = useModernWeb3();
  const navigate = useNavigate();

  const handleCheckScore = async () => {
    const inputAddress = walletAddress.trim();
    
    if (!inputAddress) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid wallet address or ENS name",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);
    try {
      // Simple validation for address format
      if (ethers.isAddress(inputAddress) || inputAddress.endsWith('.eth')) {
        navigate(`/score/${inputAddress}`);
      } else {
        throw new Error('Invalid address format');
      }
    } catch (error) {
      console.error('Address validation error:', error);
      toast({
        title: "Error",
        description: "Invalid wallet address or ENS name",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const handleMyScore = () => {
    if (account) {
      navigate(`/score/${account}`);
    }
  };

  const handleWalletAction = () => {
    console.log('Wallet button clicked, isConnected:', isConnected);
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-black">SCORE-FI</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/how-it-works" className="text-gray-600 hover:text-black transition-colors">
              How It Works
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isConnected && (
              <Button 
                variant="outline"
                onClick={handleMyScore}
                className="hidden sm:flex"
              >
                My Score
              </Button>
            )}
            <Button 
              onClick={handleWalletAction}
              disabled={connecting}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6"
            >
              {connecting ? 'Connecting...' : isConnected ? 
                (ensName || `${account?.slice(0, 6)}...${account?.slice(-4)}`) : 
                'Connect Wallet'
              }
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Unchained • Unbreakable • Unstoppable
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Web3 credit scoring for DeFi users and protocols. Build trust through transparent on-chain analysis.
          </p>
          
          {/* Wallet Search */}
          <div className="bg-gray-50 rounded-2xl p-8 max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl font-semibold text-black mb-6">Check Credit Score</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter wallet address or ENS name (e.g., vitalik.eth)"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCheckScore()}
                  className="h-12 text-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <Button 
                onClick={handleCheckScore}
                disabled={searching}
                className="bg-red-600 hover:bg-red-700 text-white h-12 px-8 text-lg font-semibold"
              >
                <Search className="w-5 h-5 mr-2" />
                {searching ? 'Checking...' : 'Check Score'}
              </Button>
            </div>
            
            {/* Test Examples */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Test Examples:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <button 
                  onClick={() => setWalletAddress('vitalik.eth')}
                  className="text-left text-blue-600 hover:text-blue-800 font-mono"
                >
                  vitalik.eth
                </button>
                <button 
                  onClick={() => setWalletAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')}
                  className="text-left text-blue-600 hover:text-blue-800 font-mono text-xs"
                >
                  0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
                </button>
              </div>
            </div>
            
            {isConnected && (
              <div className="mt-4">
                <Button 
                  variant="outline"
                  onClick={handleMyScore}
                  className="w-full sm:w-auto"
                >
                  Check My Connected Wallet Score
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Transparent & Fair</h3>
              <p className="text-gray-600">
                Open-source algorithms and clear scoring criteria. No hidden metrics or biased assessments.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Comprehensive Analysis</h3>
              <p className="text-gray-600">
                Multi-chain analysis covering payment history, portfolio diversity, and DeFi activity.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Bridging DeFi & CeFi</h3>
              <p className="text-gray-600">
                Connect your on-chain reputation to traditional finance and unlock new opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold">SCORE-FI</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2024 SCORE-FI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
