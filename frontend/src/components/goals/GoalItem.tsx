import { ArrowTrendingUpIcon, BanknotesIcon, CalendarIcon, ClockIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Goal } from '../../services/goalService';

interface GoalItemProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: number) => void;
}

const GoalItem = ({ goal, onEdit, onDelete }: GoalItemProps) => {
  // Calculate goal progress
  const calculateProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(progress, 100);
  };

  const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
  const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // Determine the progress color and status
  const getProgressColor = () => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Determine the days left status
  const getDaysLeftStatus = () => {
    if (daysLeft < 0) return { text: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (daysLeft <= 7) return { text: `${daysLeft}d`, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (daysLeft <= 30) return { text: `${daysLeft}d`, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { text: `${daysLeft}d`, color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const daysLeftStatus = getDaysLeftStatus();
  const progressColor = getProgressColor();
  const progressPercentage = progress.toFixed(0);

  return (
    <div className="bg-white overflow-hidden shadow-md hover:shadow-lg rounded-lg transition-all duration-300 border border-gray-100">
      {/* Goal header with gradient background based on progress */}
      <div className={`px-3 py-2 border-b border-gray-100 flex justify-between items-center ${progressColor} bg-opacity-10`}>
        <h3 className="text-base font-semibold text-gray-900 truncate">{goal.name}</h3>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(goal)}
            className="text-gray-500 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
            aria-label="Edit goal"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => goal.id && onDelete(goal.id)}
            className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors duration-150 cursor-pointer"
            aria-label="Delete goal"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="px-3 py-2">
        {/* Description - only show if present */}
        {goal.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-1">{goal.description}</p>
        )}

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-gray-700 flex items-center">
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1 text-gray-500" />
              Progress
            </span>
            <span className={`font-bold ${progressColor.replace('bg-', 'text-')}`}>{progressPercentage}%</span>
          </div>
          <div className="relative">
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
              <div
                style={{ width: `${progress}%` }}
                className={`shadow-sm flex flex-col text-center whitespace-nowrap text-white justify-center rounded-full transition-all duration-500 ${progressColor}`}
              ></div>
            </div>
          </div>
        </div>

        {/* Goal details - more compact grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          <div className="flex items-center space-x-1.5">
            <BanknotesIcon className="h-3 w-3 text-gray-500" />
            <div>
              <span className="inline text-gray-500">Target: </span>
              <span className="inline font-semibold text-gray-900">R$ {goal.targetAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <BanknotesIcon className="h-3 w-3 text-gray-500" />
            <div>
              <span className="inline text-gray-500">Current: </span>
              <span className="inline font-semibold text-gray-900">R$ {goal.currentAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <CalendarIcon className="h-3 w-3 text-gray-500" />
            <div>
              <span className="inline text-gray-500">Date: </span>
              <span className="inline font-semibold text-gray-900">{new Date(goal.targetDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <ClockIcon className="h-3 w-3 text-gray-500" />
            <div>
              <span className="inline text-gray-500">Left: </span>
              <span className={`inline font-semibold ${daysLeftStatus.color}`}>
                {daysLeftStatus.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status badge - more compact */}
      <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${daysLeftStatus.bgColor} ${daysLeftStatus.color}`}>
            {progress >= 100 ? 'Completed' : `${progressPercentage}% Complete`}
          </div>
          <div className="text-xs text-gray-500">
            {progress < 100 && `R$ ${(goal.targetAmount - goal.currentAmount).toFixed(2)} to go`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalItem;
