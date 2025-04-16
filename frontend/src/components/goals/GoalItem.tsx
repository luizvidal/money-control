import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
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

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium text-gray-900">{goal.name}</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(goal)}
              className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
              aria-label="Edit goal"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => goal.id && onDelete(goal.id)}
              className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors duration-150 cursor-pointer"
              aria-label="Delete goal"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {goal.description && (
          <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
        )}

        <div className="mt-4">
          <div className="flex justify-between text-sm font-medium">
            <span>Progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="mt-2 relative">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${progress}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-gray-500">Target</span>
            <span className="block font-medium text-gray-900">R$ {goal.targetAmount.toFixed(2)}</span>
          </div>
          <div>
            <span className="block text-gray-500">Current</span>
            <span className="block font-medium text-gray-900">R$ {goal.currentAmount.toFixed(2)}</span>
          </div>
          <div>
            <span className="block text-gray-500">Target Date</span>
            <span className="block font-medium text-gray-900">{new Date(goal.targetDate).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="block text-gray-500">Days Left</span>
            <span className={`block font-medium ${daysLeft < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {daysLeft < 0 ? 'Overdue' : daysLeft}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalItem;
