import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScoreGauge from '@/components/ScoreGauge';
import ScoreBreakdownCard from '@/components/ScoreBreakdownCard';
import WalletAvatar from '@/components/WalletAvatar';
import { useModernWeb3 } from '@/contexts/ModernWeb3Context'; // Sửa import
import { fetchWalletScore, ScoreData } from '@/services/scoreService';
import { 
  Clock, 
  PieChart, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowLeft,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ScoreReport = () => {
  const { address } = useParams();
  const { account } = useModernWeb3(); // Sửa destructuring
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScoreData = async () => {
      if (!address) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Add ENS resolution if needed
        // const name = await resolveENS(address);
        // setEnsName(name);
        
        // Fetch score data
        const data = await fetchWalletScore(address);
        setScoreData(data);
      } catch (error) {
        console.error('Failed to load score data:', error);
        setError('Failed to load credit score data. Please check the wallet address and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadScoreData();
  }, [address]);

  console.log('Score data:', scoreData);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 740) return 'text-green-600';
    if (score >= 580) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Wallet</h2>
          <p className="text-gray-600">Calculating credit score from on-chain data...</p>
          <div className="mt-4 text-sm text-gray-500">
            This may take a few moments while we analyze transaction history
          </div>
        </div>
      </div>
    );
  }

  if (error || !scoreData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Score</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load wallet data'}</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Sửa lại breakdown items theo scoreService.ts (5 fields thay vì 6)
  const breakdownItems = [
    {
      title: 'Payment History',
      score: scoreData.breakdown.paymentHistory,
      summary: 'Track record of loan repayments, liquidations, and payment consistency in DeFi protocols.',
      tip: scoreData.breakdown.paymentHistory < 80 ? 'Maintain timely payments and avoid liquidations to improve this score.' : undefined,
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      weight: '35%'
    },
    {
      title: 'Amounts Owed',
      score: scoreData.breakdown.amountsOwed,
      summary: 'Current debt utilization ratio and outstanding loan balances across protocols.',
      tip: scoreData.breakdown.amountsOwed < 80 ? 'Reduce debt utilization ratio by paying down loans or increasing collateral.' : undefined,
      icon: <PieChart className="w-5 h-5 text-green-600" />,
      weight: '30%'
    },
    {
      title: 'Credit History',
      score: scoreData.breakdown.creditHistory,
      summary: 'Length of DeFi activity and consistency of protocol interactions over time.',
      tip: scoreData.breakdown.creditHistory < 80 ? 'Continue regular DeFi activity to build longer credit history.' : undefined,
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      weight: '15%'
    },
    {
      title: 'Credit Mix',
      score: scoreData.breakdown.creditMix,
      summary: 'Diversity of DeFi protocol usage including lending, DEX, NFT, and derivatives.',
      tip: scoreData.breakdown.creditMix < 80 ? 'Interact with different types of DeFi protocols to improve diversity.' : undefined,
      icon: <Shield className="w-5 h-5 text-red-600" />,
      weight: '10%'
    },
    {
      title: 'New Credit',
      score: scoreData.breakdown.newCredit,
      summary: 'Recent protocol interactions and new credit inquiries in the last 30 days.',
      tip: scoreData.breakdown.newCredit < 80 ? 'Avoid excessive new protocol interactions in short periods.' : undefined,
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
      weight: '10%'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-black">SCORE-FI</span>
            </Link>
          </div>
          
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Link>
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Wallet Info */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <WalletAvatar address={address || ''} size={48} />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {ensName || formatAddress(address || '')}
                </h1>
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="font-mono text-sm">{formatAddress(address || '')}</span>
                  <button onClick={copyAddress} className="p-1 hover:bg-gray-100 rounded">
                    <Copy className="w-4 h-4" />
                  </button>
                  <a href={`https://etherscan.io/address/${address}`} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="p-1 hover:bg-gray-100 rounded">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Display */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <ScoreGauge score={scoreData.score} />
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Credit Score Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Overall Score</span>
                  <span className={`font-semibold ${getScoreColor(scoreData.score)}`}>
                    {scoreData.score} / 100
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Risk Level</span>
                  <span className={`font-semibold px-2 py-1 rounded-full text-xs ${getRiskBadgeColor(scoreData.riskLevel)}`}>
                    {scoreData.riskLevel} Risk
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-600">
                    {new Date(scoreData.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className={`mt-6 p-4 rounded-lg ${
                scoreData.score >= 740 ? 'bg-green-50' : 
                scoreData.score >= 580 ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <p className={`font-medium ${getScoreColor(scoreData.score)}`}>
                  {scoreData.score >= 740 ? 'Excellent Credit Profile!' :
                   scoreData.score >= 580 ? 'Good Credit Profile' : 'Credit Needs Improvement'}
                </p>
                <p className={`text-sm mt-1 ${
                  scoreData.score >= 740 ? 'text-green-700' : 
                  scoreData.score >= 580 ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {scoreData.score >= 740 ? 
                    'Your score qualifies you for premium lending rates and exclusive DeFi opportunities.' :
                    scoreData.score >= 580 ?
                    'You qualify for most DeFi lending protocols with competitive rates.' :
                    'Focus on improving payment history and reducing debt utilization to access better rates.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Score Breakdown</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {breakdownItems.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <span className="text-xs text-gray-500">Weight: {item.weight}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                      {item.score}
                    </div>
                    <div className="text-xs text-gray-500">/ 100</div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full ${
                      item.score >= 80 ? 'bg-green-500' : 
                      item.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{item.summary}</p>
                {item.tip && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3">
                    <p className="text-sm text-blue-700">💡 {item.tip}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How Your Score is Calculated</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Based on FICO methodology adapted for DeFi:</h4>
              <ul className="space-y-1">
                <li>• Payment History (35%): Liquidation history and repayment consistency</li>
                <li>• Amounts Owed (30%): Current debt utilization across protocols</li>
                <li>• Credit History (15%): Length and consistency of DeFi activity</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Additional factors:</h4>
              <ul className="space-y-1">
                <li>• Credit Mix (10%): Diversity of protocol interactions</li>
                <li>• New Credit (10%): Recent protocol interactions and inquiries</li>
                <li>• Data sourced from Covalent API and on-chain analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreReport;