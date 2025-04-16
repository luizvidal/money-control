import { PlusIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Notification from '../components/common/Notification';
import PageHeader from '../components/common/PageHeader';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/dashboard/LoadingSpinner';
import GoalItem from '../components/goals/GoalItem';
import GoalModal from '../components/goals/GoalModal';
import PageLayout from '../components/Layout/PageLayout';
import goalService, { Goal } from '../services/goalService';
import '../styles/animations.css';
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
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);
  const [currentGoal, setCurrentGoal] = useState<GoalFormData>({
    name: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({
    type: 'success' as 'success' | 'error',
    message: '',
    isVisible: false
  });

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
      showNotification('success', 'Goal created successfully');
    },
    onError: (error) => {
      showNotification('error', `Failed to create goal: ${error.message}`);
    }
  });

  // Mutation to update goal
  const updateMutation = useMutation({
    mutationFn: (goal: Goal) =>
      goalService.update(goal.id!, goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      resetForm();
      showNotification('success', 'Goal updated successfully');
    },
    onError: (error) => {
      showNotification('error', `Failed to update goal: ${error.message}`);
    }
  });

  // Mutation to delete goal
  const deleteMutation = useMutation({
    mutationFn: goalService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      showNotification('success', 'Goal deleted successfully');
    },
    onError: (error) => {
      showNotification('error', `Failed to delete goal: ${error.message}`);
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
    // Set the goal ID to delete first, then open the dialog in the next render cycle
    setGoalToDelete(id);
    // Use setTimeout to ensure the state is updated before opening the dialog
    setTimeout(() => {
      setIsConfirmDialogOpen(true);
    }, 0);
  };

  const confirmDelete = () => {
    if (goalToDelete !== null) {
      deleteMutation.mutate(goalToDelete);
      setIsConfirmDialogOpen(false);
      setGoalToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsConfirmDialogOpen(false);
    setGoalToDelete(null);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({
      type,
      message,
      isVisible: true
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentGoal(prev => ({
      ...prev,
      [name]: ['targetAmount', 'currentAmount'].includes(name) ? parseFloat(value) : value
    }));
  };

  // Loading state
  if (isLoading || isFetching) {
    return <LoadingSpinner message="Loading goals..." />;
  }

  // Create new goal button
  const newGoalButton = (
    <button
      onClick={() => handleOpenModal()}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 cursor-pointer"
    >
      <PlusIcon className="h-5 w-5 mr-2" />
      New Goal
    </button>
  );

  // Page header component
  const header = (
    <div className="p-6 pb-0">
      <PageHeader
        title="Financial Goals"
        subtitle="Track your savings progress towards your financial goals"
        action={newGoalButton}
      />
    </div>
  );

  // Page content component
  const content = (
    <div className="p-6 pt-4">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedGoals && paginatedGoals.length > 0 ? (
          paginatedGoals.map((goal) => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No goals found</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 cursor-pointer"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create your first goal
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Page footer with pagination
  const footer = totalPages > 1 ? (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
        <span>Showing {paginatedGoals.length} of {totalElements} goals</span>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page: number) => setCurrentPage(page)}
      />
    </div>
  ) : null;

  return (
    <div className="h-full animate-fadeIn">
      <PageLayout
        header={header}
        content={content}
        footer={footer}
      />

      {/* Goal modal */}
      <GoalModal
        isOpen={isModalOpen}
        isEditing={isEditing}
        goal={currentGoal}
        onClose={resetForm}
        onSubmit={handleSubmit}
        onChange={handleInputChange}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
};

export default Goals;
