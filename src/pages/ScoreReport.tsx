import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ScoreGauge from '@/components/ScoreGauge';
import ScoreBreakdownCard from '@/components/ScoreBreakdownCard';
import WalletAvatar from '@/components/WalletAvatar';
import { useModernWeb3 } from '@/contexts/ModernWeb3Context';
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
  const { account } = useModernWeb3();
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

  // Cập nhật logic đánh giá theo thang điểm mới
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';      // Xuất sắc
    if (score >= 80) return 'text-blue-600';       // Tốt  
    if (score >= 65) return 'text-yellow-600';     // Trung bình khá
    if (score >= 50) return 'text-orange-600';     // Trung bình
    if (score >= 30) return 'text-red-600';        // Yếu
    return 'text-red-800';                         // Rất yếu
  };

  const getScoreCategory = (score: number) => {
    if (score >= 90) return 'Xuất sắc';
    if (score >= 80) return 'Tốt';
    if (score >= 65) return 'Trung bình khá';
    if (score >= 50) return 'Trung bình';
    if (score >= 30) return 'Yếu';
    return 'Rất yếu';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 90) return 'Rất an toàn';
    if (score >= 80) return 'An toàn';
    if (score >= 65) return 'Trung bình thấp';
    if (score >= 50) return 'Rủi ro nhẹ';
    if (score >= 30) return 'Rủi ro cao';
    return 'Rất rủi ro';
  };

  const getRiskBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 65) return 'bg-yellow-100 text-yellow-800';
    if (score >= 50) return 'bg-orange-100 text-orange-800';
    if (score >= 30) return 'bg-red-100 text-red-800';
    return 'bg-red-200 text-red-900';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) {
      return {
        title: 'Hồ sơ tín dụng xuất sắc!',
        description: 'Lịch sử trả nợ hoàn hảo, không bị thanh lý, nợ thấp, sử dụng đa dạng sản phẩm tài chính với hoạt động ổn định.',
        recommendation: 'Bạn đủ điều kiện cho các sản phẩm DeFi cao cấp với lãi suất ưu đãi nhất.'
      };
    }
    if (score >= 80) {
      return {
        title: 'Hồ sơ tín dụng tốt',
        description: 'Có thể từng vay lớn nhưng trả đúng hạn, có 1-2 hành vi trễ nhỏ, vẫn sử dụng DeFi chủ động và cẩn trọng.',
        recommendation: 'Bạn có thể tiếp cận hầu hết các protocol DeFi với lãi suất cạnh tranh.'
      };
    }
    if (score >= 65) {
      return {
        title: 'Hồ sơ tín dụng trung bình khá',
        description: 'Từng bị thanh lý 1-2 lần nhưng tổng thể ổn, vay tương đối nhiều nhưng còn tài sản, credit mix hạn chế.',
        recommendation: 'Cần cải thiện quản lý rủi ro và đa dạng hóa hoạt động DeFi.'
      };
    }
    if (score >= 50) {
      return {
        title: 'Hồ sơ tín dụng trung bình',
        description: 'Bắt đầu có dấu hiệu sử dụng vốn thiếu kiểm soát, có ít nhất 1 hành vi rủi ro rõ rệt.',
        recommendation: 'Nên giảm tỷ lệ nợ và cải thiện thói quen quản lý tài chính.'
      };
    }
    if (score >= 30) {
      return {
        title: 'Hồ sơ tín dụng yếu',
        description: 'Thường xuyên bị thanh lý, vay vượt quá tài sản trung bình, tương tác bất thường hoặc ngắt quãng.',
        recommendation: 'Cần xây dựng lại lịch sử tín dụng và cải thiện đáng kể thói quen tài chính.'
      };
    }
    return {
      title: 'Hồ sơ tín dụng rất yếu',
      description: 'Vừa thiếu lịch sử, vừa đang mang nợ nặng, bỏ nợ/bị thanh lý hàng loạt, có dấu hiệu hoạt động bất thường.',
      recommendation: 'Cần thời gian dài để xây dựng lại uy tín tài chính trước khi tiếp cận các sản phẩm vay mượn.'
    };
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

  const scoreInfo = getScoreDescription(scoreData.score);

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
                  <span className="text-gray-600">Nhóm đánh giá</span>
                  <span className={`font-semibold ${getScoreColor(scoreData.score)}`}>
                    {getScoreCategory(scoreData.score)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Mức độ rủi ro</span>
                  <span className={`font-semibold px-2 py-1 rounded-full text-xs ${getRiskBadgeColor(scoreData.score)}`}>
                    {getRiskLevel(scoreData.score)}
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
                scoreData.score >= 90 ? 'bg-green-50' : 
                scoreData.score >= 80 ? 'bg-blue-50' :
                scoreData.score >= 65 ? 'bg-yellow-50' : 
                scoreData.score >= 50 ? 'bg-orange-50' :
                scoreData.score >= 30 ? 'bg-red-50' : 'bg-red-100'
              }`}>
                <p className={`font-medium ${getScoreColor(scoreData.score)}`}>
                  {scoreInfo.title}
                </p>
                <p className={`text-sm mt-2 ${
                  scoreData.score >= 90 ? 'text-green-700' : 
                  scoreData.score >= 80 ? 'text-blue-700' :
                  scoreData.score >= 65 ? 'text-yellow-700' : 
                  scoreData.score >= 50 ? 'text-orange-700' :
                  scoreData.score >= 30 ? 'text-red-700' : 'text-red-800'
                }`}>
                  {scoreInfo.description}
                </p>
                <p className={`text-sm mt-2 font-medium ${
                  scoreData.score >= 90 ? 'text-green-800' : 
                  scoreData.score >= 80 ? 'text-blue-800' :
                  scoreData.score >= 65 ? 'text-yellow-800' : 
                  scoreData.score >= 50 ? 'text-orange-800' :
                  scoreData.score >= 30 ? 'text-red-800' : 'text-red-900'
                }`}>
                  💡 {scoreInfo.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Cards - giữ nguyên phần này */}
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
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full ${
                      item.score >= 90 ? 'bg-green-500' : 
                      item.score >= 80 ? 'bg-blue-500' :
                      item.score >= 65 ? 'bg-yellow-500' :
                      item.score >= 50 ? 'bg-orange-500' :
                      item.score >= 30 ? 'bg-red-500' : 'bg-red-600'
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân loại điểm tín dụng</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded bg-green-50">
                <span className="font-medium">90-100: Xuất sắc</span>
                <span className="text-green-600 font-bold">Rất an toàn</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-blue-50">
                <span className="font-medium">80-89: Tốt</span>
                <span className="text-blue-600 font-bold">An toàn</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded bg-yellow-50">
                <span className="font-medium">65-79: Trung bình khá</span>
                <span className="text-yellow-600 font-bold">TB thấp</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-orange-50">
                <span className="font-medium">50-64: Trung bình</span>
                <span className="text-orange-600 font-bold">Rủi ro nhẹ</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded bg-red-50">
                <span className="font-medium">30-49: Yếu</span>
                <span className="text-red-600 font-bold">Rủi ro cao</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-red-100">
                <span className="font-medium">0-29: Rất yếu</span>
                <span className="text-red-800 font-bold">Rất rủi ro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreReport;