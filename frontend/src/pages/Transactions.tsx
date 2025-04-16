import { PlusIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Notification from '../components/common/Notification';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/dashboard/LoadingSpinner';
import PageLayout from '../components/Layout/PageLayout';
import TransactionFilter, { TransactionFilterValues } from '../components/transactions/TransactionFilter';
import TransactionList from '../components/transactions/TransactionList';
import TransactionModal from '../components/transactions/TransactionModal';
import categoryService from '../services/categoryService';
import transactionService, { Transaction, TransactionParams } from '../services/transactionService';
import '../styles/animations.css';
import { PageResponse } from '../types/PageResponse';
import { getUrlParams } from '../utils/urlParams';

interface TransactionFormData {
  id?: number;
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId: number;
}

const Transactions = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<TransactionFormData>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'EXPENSE',
    categoryId: 0
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
  const [paginatedTransactions, setPaginatedTransactions] = useState<Transaction[]>([]);

  const location = useLocation();

  // Initialize filters from URL params
  const initializeFiltersFromUrl = (): TransactionFilterValues => {
    const params = getUrlParams();
    const urlFilters: TransactionFilterValues = {};

    if (params.startDate) urlFilters.startDate = params.startDate;
    if (params.endDate) urlFilters.endDate = params.endDate;
    if (params.type && ['ALL', 'INCOME', 'EXPENSE'].includes(params.type)) {
      urlFilters.type = params.type as 'ALL' | 'INCOME' | 'EXPENSE';
    }
    if (params.categoryId && !isNaN(Number(params.categoryId))) {
      urlFilters.categoryId = Number(params.categoryId);
    }

    return urlFilters;
  };

  // Filter state
  const [filters, setFilters] = useState<TransactionFilterValues>(initializeFiltersFromUrl);

  // Fetch transactions with pagination and filters
  const { data: transactionsData, isLoading: transactionsLoading, isFetching: transactionsFetching } = useQuery({
    queryKey: ['transactions', currentPage, pageSize, filters],
    queryFn: () => {
      const params: TransactionParams = {
        pageNo: currentPage,
        pageSize,
        sortBy: 'date',
        sortDir: 'desc'
      };

      // Add filters to params if they exist
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.type && filters.type !== 'ALL') params.type = filters.type;
      if (filters.categoryId) params.categoryId = filters.categoryId;

      return transactionService.getAll(params);
    }
  });

  // Update state when data changes
  useEffect(() => {
    if (transactionsData) {
      if ('content' in transactionsData) {
        const pageData = transactionsData as PageResponse<Transaction>;
        setPaginatedTransactions(pageData.content);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
      } else {
        setPaginatedTransactions(transactionsData as Transaction[]);
        setTotalPages(1);
        setTotalElements((transactionsData as Transaction[]).length);
      }
    }
  }, [transactionsData]);

  // Listen for URL changes and update filters
  useEffect(() => {
    const urlFilters = initializeFiltersFromUrl();
    setFilters(urlFilters);
  }, [location.search]);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll({ pageSize: 0 })
  });

  // Extract categories array from the response
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.content || [];

  // Mutation to create transaction
  const createMutation = useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      resetForm();
      showNotification('success', 'Transaction created successfully');
    },
    onError: (error) => {
      showNotification('error', `Failed to create transaction: ${error.message}`);
    }
  });

  // Mutation to update transaction
  const updateMutation = useMutation({
    mutationFn: (transaction: Transaction) =>
      transactionService.update(transaction.id!, transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      resetForm();
      showNotification('success', 'Transaction updated successfully');
    },
    onError: (error) => {
      showNotification('error', `Failed to update transaction: ${error.message}`);
    }
  });

  // Mutation to delete transaction
  const deleteMutation = useMutation({
    mutationFn: transactionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      showNotification('success', 'Transaction deleted successfully');
    },
    onError: (error) => {
      showNotification('error', `Failed to delete transaction: ${error.message}`);
    }
  });

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setCurrentTransaction({
        id: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        date: new Date(transaction.date).toISOString().split('T')[0],
        type: transaction.type,
        categoryId: transaction.categoryId
      });
      setIsEditing(true);
    } else {
      setCurrentTransaction({
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        type: 'EXPENSE',
        categoryId: categories.length > 0 ? (categories[0]?.id || 0) : 0
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setCurrentTransaction({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
      categoryId: 0
    });
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && currentTransaction.id) {
      updateMutation.mutate(currentTransaction as Transaction);
    } else {
      createMutation.mutate(currentTransaction as Transaction);
    }
  };

  const handleDelete = (id: number) => {
    setTransactionToDelete(id);
    setIsConfirmDialogOpen(true);
  };

  const handleFilter = (newFilters: TransactionFilterValues) => {
    // Update filters state
    setFilters(newFilters);

    // Reset to first page when filters change
    setCurrentPage(0);

    // Invalidate the transactions query to trigger a refetch with the new filters
    // We need to invalidate all possible transaction query keys
    queryClient.invalidateQueries({ queryKey: ['transactions'] });

    // Log the applied filters
    console.log('Transactions page - Applied filters:', newFilters);
  };

  const confirmDelete = () => {
    if (transactionToDelete !== null) {
      deleteMutation.mutate(transactionToDelete);
      setIsConfirmDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsConfirmDialogOpen(false);
    setTransactionToDelete(null);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentTransaction(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  if (transactionsLoading || transactionsFetching || categoriesLoading) {
    return <LoadingSpinner message="Loading transactions..." />;
  }

  // Create new transaction button
  const newTransactionButton = (
    <button
      onClick={() => handleOpenModal()}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
    >
      <PlusIcon className="h-5 w-5 mr-2" />
      New Transaction
    </button>
  );

  // Page header component
  const header = (
    <div className="p-6 pb-0">
      <PageHeader
        title="Transactions"
        subtitle="Manage your income and expenses"
        action={newTransactionButton}
      />
    </div>
  );

  // Page content component
  const content = (
    <div className="p-6 pt-4">
      {/* Transaction filters */}
      <TransactionFilter
        categories={categories}
        onFilter={handleFilter}
        initialFilters={filters}
      />

      {/* Transaction list */}
      <TransactionList
        transactions={paginatedTransactions}
        categories={categories}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setCurrentPage}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />
    </div>
  );

  // Page footer (empty since pagination is now in the TransactionList component)
  const footer = null;

  return (
    <div className="h-full animate-fadeIn">

      <PageLayout
        header={header}
        content={content}
        footer={footer}
      />

      {/* Transaction modal */}
      <TransactionModal
        isOpen={isModalOpen}
        isEditing={isEditing}
        transaction={currentTransaction}
        categories={categories}
        onClose={resetForm}
        onSubmit={handleSubmit}
        onChange={handleInputChange}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
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

export default Transactions;
