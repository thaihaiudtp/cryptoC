
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  PieChart, 
  TrendingUp, 
  Shield, 
  Zap, 
  DollarSign,
  ArrowLeft 
} from 'lucide-react';

const HowItWorks = () => {
  const scoringFactors = [
    {
      title: 'Payment History',
      description: 'Track record of loan repayments, liquidations, and payment consistency across DeFi protocols.',
      icon: Clock,
      weight: '35%',
      color: 'bg-blue-500'
    },
    {
      title: 'Portfolio Diversity',
      description: 'Diversification across different assets, protocols, and strategies to assess risk management.',
      icon: PieChart,
      weight: '20%',
      color: 'bg-green-500'
    },
    {
      title: 'Transaction Volume',
      description: 'Frequency and volume of DeFi interactions showing active participation and experience.',
      icon: TrendingUp,
      weight: '15%',
      color: 'bg-purple-500'
    },
    {
      title: 'Security Practices',
      description: 'Smart contract interactions, security incidents, and overall wallet security hygiene.',
      icon: Shield,
      weight: '15%',
      color: 'bg-red-500'
    },
    {
      title: 'DeFi Experience',
      description: 'Length of time in DeFi, protocol familiarity, and complexity of strategies used.',
      icon: Zap,
      weight: '10%',
      color: 'bg-yellow-500'
    },
    {
      title: 'Liquidity Management',
      description: 'Ability to maintain adequate liquidity and avoid forced liquidations or distressed sales.',
      icon: DollarSign,
      weight: '5%',
      color: 'bg-indigo-500'
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
            Our transparent algorithm analyzes six key factors to calculate your Web3 credit score.
          </p>
        </div>
      </section>

      {/* Scoring Factors */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Credit Scoring Factors</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each factor is weighted based on its importance in determining creditworthiness and financial reliability.
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Score Calculation</h2>
            <p className="text-gray-600">
              Your final score ranges from 300 to 850, similar to traditional credit scores.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-red-50 rounded-2xl">
              <div className="text-3xl font-bold text-red-600 mb-2">300-579</div>
              <div className="font-semibold text-red-700 mb-2">Poor</div>
              <p className="text-sm text-red-600">High risk, limited lending options</p>
            </div>
            
            <div className="text-center p-6 bg-yellow-50 rounded-2xl">
              <div className="text-3xl font-bold text-yellow-600 mb-2">580-739</div>
              <div className="font-semibold text-yellow-700 mb-2">Fair - Good</div>
              <p className="text-sm text-yellow-600">Moderate risk, standard rates</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-2xl">
              <div className="text-3xl font-bold text-green-600 mb-2">740-850</div>
              <div className="font-semibold text-green-700 mb-2">Very Good - Excellent</div>
              <p className="text-sm text-green-600">Low risk, premium rates</p>
            </div>
          </div>
          
          <div className="text-center">
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg">
              <Link to="/">Check Your Score Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
