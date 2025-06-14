
import { Progress } from '@/components/ui/progress';

interface ScoreBreakdownCardProps {
  title: string;
  score: number;
  maxScore?: number;
  summary: string;
  tip?: string;
  icon?: React.ReactNode;
}

const ScoreBreakdownCard = ({ 
  title, 
  score, 
  maxScore = 100, 
  summary, 
  tip,
  icon 
}: ScoreBreakdownCardProps) => {
  const percentage = (score / maxScore) * 100;
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          )}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <span className={`text-lg font-bold ${getScoreColor(percentage)}`}>
          {score.toFixed(1)} / {maxScore}
        </span>
      </div>
      
      <div className="mb-4">
        <Progress 
          value={percentage} 
          className="h-2 bg-gray-200"
        />
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{summary}</p>
      
      {tip && (
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Tip:</span> {tip}
          </p>
        </div>
      )}
    </div>
  );
};

export default ScoreBreakdownCard;
