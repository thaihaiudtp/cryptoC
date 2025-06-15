import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
}

const ScoreGauge = ({ score, maxScore = 100 }: ScoreGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  // Cập nhật logic màu sắc theo thang điểm mới
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#16a34a';      // Xuất sắc - Green 600
    if (score >= 80) return '#2563eb';      // Tốt - Blue 600
    if (score >= 65) return '#ca8a04';      // Trung bình khá - Yellow 600  
    if (score >= 50) return '#ea580c';      // Trung bình - Orange 600
    if (score >= 30) return '#dc2626';      // Yếu - Red 600
    return '#991b1b';                       // Rất yếu - Red 800
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Xuất sắc';
    if (score >= 80) return 'Tốt';
    if (score >= 65) return 'Trung bình khá';
    if (score >= 50) return 'Trung bình';
    if (score >= 30) return 'Yếu';
    return 'Rất yếu';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 90) return 'Rất an toàn';
    if (score >= 80) return 'An toàn';
    if (score >= 65) return 'Trung bình thấp';
    if (score >= 50) return 'Rủi ro nhẹ';
    if (score >= 30) return 'Rủi ro cao';
    return 'Rất rủi ro';
  };

  const percentage = (animatedScore / maxScore) * 100;
  const strokeDasharray = 2 * Math.PI * 45;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  const scoreColor = getScoreColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Score display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-4xl font-bold"
            style={{ color: scoreColor }}
          >
            {animatedScore.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 mt-1">/ {maxScore}</span>
        </div>
      </div>
      
      <div className="text-center">
        <h3 
          className="text-xl font-semibold mb-1"
          style={{ color: scoreColor }}
        >
          {getScoreLabel(score)}
        </h3>
        <p className="text-gray-600 text-sm mb-1">Credit Score</p>
        <div 
          className="inline-block px-3 py-1 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: scoreColor + '20', 
            color: scoreColor 
          }}
        >
          {getRiskLabel(score)}
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;