import { useRef } from 'react';
import Modal from '../common/Modal';
import LoadingSpinner from '../dashboard/LoadingSpinner';

interface GoalFormData {
  id?: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

interface GoalModalProps {
  isOpen: boolean;
  isEditing: boolean;
  goal: GoalFormData;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isLoading: boolean;
}

const GoalModal = ({
  isOpen,
  isEditing,
  goal,
  onClose,
  onSubmit,
  onChange,
  isLoading
}: GoalModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the name input when the modal is rendered
  const handleModalRendered = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  if (!isOpen) return null;

  // Call focus function when modal is rendered
  handleModalRendered();

  return (
    <Modal
      isOpen={isOpen}
      title={isEditing ? 'Edit Goal' : 'New Goal'}
      onClose={onClose}
    >

      <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Goal Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              ref={inputRef}
              value={goal.name}
              onChange={onChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter goal name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={goal.description}
              onChange={onChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter goal description"
            />
          </div>

          <div>
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
              Target Amount
            </label>
            <input
              type="number"
              name="targetAmount"
              id="targetAmount"
              required
              min="0.01"
              step="0.01"
              value={goal.targetAmount}
              onChange={onChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter target amount"
            />
          </div>

          <div>
            <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700">
              Current Amount
            </label>
            <input
              type="number"
              name="currentAmount"
              id="currentAmount"
              required
              min="0"
              step="0.01"
              value={goal.currentAmount}
              onChange={onChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter current amount"
            />
          </div>

          <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">
              Target Date
            </label>
            <input
              type="date"
              name="targetDate"
              id="targetDate"
              required
              value={goal.targetDate}
              onChange={onChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors duration-150 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">{isEditing ? 'Updating...' : 'Saving...'}</span>
                </>
              ) : (
                <>{isEditing ? 'Update' : 'Save'}</>
              )}
            </button>
          </div>
      </form>
    </Modal>
  );
};

export default GoalModal;
