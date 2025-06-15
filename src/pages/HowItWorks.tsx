import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  PieChart, 
  TrendingUp, 
  Shield, 
  Zap, 
  ArrowLeft 
} from 'lucide-react';

const HowItWorks = () => {
  const scoringFactors = [
    {
      title: 'Payment History',
      description: 'Track record of loan repayments, liquidations, and payment consistency in DeFi protocols.',
      icon: Clock,
      weight: '35%',
      color: 'bg-blue-500'
    },
    {
      title: 'Amounts Owed',
      description: 'Current debt utilization ratio and outstanding loan balances across protocols.',
      icon: PieChart,
      weight: '30%',
      color: 'bg-green-500'
    },
    {
      title: 'Credit History',
      description: 'Length of DeFi activity and consistency of protocol interactions over time.',
      icon: TrendingUp,
      weight: '15%',
      color: 'bg-purple-500'
    },
    {
      title: 'Credit Mix',
      description: 'Diversity of DeFi protocol usage including lending, DEX, NFT, and derivatives.',
      icon: Shield,
      weight: '10%',
      color: 'bg-red-500'
    },
    {
      title: 'New Credit',
      description: 'Recent protocol interactions and new credit inquiries in the last 30 days.',
      icon: Zap,
      weight: '10%',
      color: 'bg-yellow-500'
    }
  ];

  const scoreRanges = [
    {
      range: '90-100',
      category: 'Xuất sắc (Excellent)',
      riskLevel: 'Rất an toàn (Very safe)',
      color: 'bg-green-50',
      textColor: 'text-green-600',
      categoryColor: 'text-green-700'
    },
    {
      range: '80-89',
      category: 'Tốt (Good)',
      riskLevel: 'An toàn (Safe)',
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
      categoryColor: 'text-blue-700'
    },
    {
      range: '65-79',
      category: 'Trung bình khá (Fair-Good)',
      riskLevel: 'Trung bình thấp (Low-medium risk)',
      color: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      categoryColor: 'text-yellow-700'
    },
    {
      range: '50-64',
      category: 'Trung bình (Fair)',
      riskLevel: 'Rủi ro nhẹ (Light risk)',
      color: 'bg-orange-50',
      textColor: 'text-orange-600',
      categoryColor: 'text-orange-700'
    },
    {
      range: '30-49',
      category: 'Yếu (Poor)',
      riskLevel: 'Rủi ro cao (High risk)',
      color: 'bg-red-50',
      textColor: 'text-red-600',
      categoryColor: 'text-red-700'
    },
    {
      range: '0-29',
      category: 'Rất yếu (Very poor)',
      riskLevel: 'Rất rủi ro (Very risky)',
      color: 'bg-red-100',
      textColor: 'text-red-800',
      categoryColor: 'text-red-900'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-black">SCORE-FI</span>
          </Link>
          
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            How SCORE-FI Works
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Our transparent algorithm analyzes five key factors to calculate your Web3 credit score.
          </p>
        </div>
      </section>

      {/* Scoring Factors */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Credit Scoring Factors</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each factor is weighted based on its importance in determining creditworthiness and financial reliability in DeFi.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scoringFactors.map((factor, index) => {
              const IconComponent = factor.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 ${factor.color} rounded-xl flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {factor.weight}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-black mb-4">{factor.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{factor.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How Score is Calculated */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Score Classification</h2>
            <p className="text-gray-600">
              Your final score ranges from 0 to 100, with higher scores indicating better creditworthiness.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-4 mb-12">
            {scoreRanges.map((range, index) => (
              <div key={index} className={`text-center p-6 ${range.color} rounded-2xl`}>
                <div className={`text-3xl font-bold ${range.textColor} mb-2`}>{range.range}</div>
                <div className={`font-semibold ${range.categoryColor} mb-2`}>{range.category}</div>
                <p className={`text-sm ${range.textColor}`}>{range.riskLevel}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg">
              <Link to="/">Check Your Score Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Additional information */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Improving Your Score</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Here are some tips to improve your DeFi credit score over time:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Make Consistent Repayments</h3>
              <p className="text-gray-600">Repay your DeFi loans on time and avoid liquidations to improve your payment history score.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Maintain Low Debt Utilization</h3>
              <p className="text-gray-600">Keep your borrowing well below your collateral value to improve your amounts owed score.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Build DeFi History</h3>
              <p className="text-gray-600">Engage regularly with DeFi protocols to build a longer and more consistent credit history.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Diversify Protocol Usage</h3>
              <p className="text-gray-600">Use a mix of different DeFi protocols, including lending, DEX, NFT, and derivatives platforms.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
