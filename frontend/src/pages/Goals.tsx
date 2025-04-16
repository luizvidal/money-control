import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Pagination from '../components/common/Pagination';
import goalService, { Goal } from '../services/goalService';
import { PageResponse } from '../types/PageResponse';

interface GoalFormData {
  id?: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

const Goals = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<GoalFormData>({
    name: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });
  const [isEditing, setIsEditing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [paginatedGoals, setPaginatedGoals] = useState<Goal[]>([]);

  // Fetch goals with pagination
  const { data: goalsData, isLoading, isFetching } = useQuery({
    queryKey: ['goals', currentPage, pageSize],
    queryFn: () => goalService.getAll({ pageNo: currentPage, pageSize, sortBy: 'targetDate', sortDir: 'asc' })
  });

  // Update state when data changes
  useEffect(() => {
    if (goalsData) {
      if ('content' in goalsData) {
        const pageData = goalsData as PageResponse<Goal>;
        setPaginatedGoals(pageData.content);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
      } else {
        setPaginatedGoals(goalsData as Goal[]);
        setTotalPages(1);
        setTotalElements((goalsData as Goal[]).length);
      }
    }
  }, [goalsData]);

  // Mutation to create goal
  const createMutation = useMutation({
    mutationFn: goalService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      resetForm();
    }
  });

  // Mutation to update goal
  const updateMutation = useMutation({
    mutationFn: (goal: Goal) =>
      goalService.update(goal.id!, goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      resetForm();
    }
  });

  // Mutation to delete goal
  const deleteMutation = useMutation({
    mutationFn: goalService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });

  const handleOpenModal = (goal?: Goal) => {
    if (goal) {
      setCurrentGoal({
        id: goal.id,
        name: goal.name,
        description: goal.description || '',
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: new Date(goal.targetDate).toISOString().split('T')[0]
      });
      setIsEditing(true);
    } else {
      setCurrentGoal({
        name: '',
        description: '',
        targetAmount: 0,
        currentAmount: 0,
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setCurrentGoal({
      name: '',
      description: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
    });
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && currentGoal.id) {
      updateMutation.mutate(currentGoal as Goal);
    } else {
      createMutation.mutate(currentGoal as Goal);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentGoal(prev => ({
      ...prev,
      [name]: ['targetAmount', 'currentAmount'].includes(name) ? parseFloat(value) : value
    }));
  };

  // Calculate goal progress
  const calculateProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(progress, 100);
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Financial Goals</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Goal
        </button>
      </div>

      {/* Goals list */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedGoals && paginatedGoals.length > 0 ? (
          paginatedGoals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div key={goal.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{goal.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(goal)}
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => goal.id && handleDelete(goal.id)}
                        className="text-gray-400 hover:text-red-500"
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
          })
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No goals found</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create your first goal
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
            <span>Showing {paginatedGoals.length} of {totalElements} goals</span>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Form modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? 'Edit Goal' : 'New Goal'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Goal Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={currentGoal.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  value={currentGoal.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  value={currentGoal.targetAmount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  value={currentGoal.currentAmount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  value={currentGoal.targetDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isEditing ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
