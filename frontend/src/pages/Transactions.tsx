import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Notification from '../components/common/Notification';
import PageHeader from '../components/common/PageHeader';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/dashboard/LoadingSpinner';
import PageLayout from '../components/Layout/PageLayout';
import categoryService from '../services/categoryService';
import transactionService, { Transaction } from '../services/transactionService';
import '../styles/animations.css';
import { PageResponse } from '../types/PageResponse';

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

  // Fetch transactions with pagination
  const { data: transactionsData, isLoading: transactionsLoading, isFetching: transactionsFetching } = useQuery({
    queryKey: ['transactions', currentPage, pageSize],
    queryFn: () => transactionService.getAll({ pageNo: currentPage, pageSize, sortBy: 'date', sortDir: 'desc' })
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

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll
  });

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
        categoryId: categories && categories.length > 0 ? categories[0].id! : 0
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
      <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <ul className="divide-y divide-gray-200">
          {paginatedTransactions && paginatedTransactions.length > 0 ? (
            paginatedTransactions.map((transaction) => (
              <li key={transaction.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150 group">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-600 truncate group-hover:text-blue-700 transition-colors duration-150">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Category: {categories?.find(c => c.id === transaction.categoryId)?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                      transaction.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleOpenModal(transaction)}
                      className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 transition-colors duration-150"
                      aria-label="Edit transaction"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => transaction.id && handleDelete(transaction.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors duration-150"
                      aria-label="Delete transaction"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-gray-500">
              No transactions found
            </li>
          )}
        </ul>
      </div>
    </div>
  );

  // Page footer with pagination
  const footer = totalPages > 1 ? (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
        <span>Showing {paginatedTransactions.length} of {totalElements} transactions</span>
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

      {/* Form modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? 'Edit Transaction' : 'New Transaction'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  id="description"
                  required
                  value={currentTransaction.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  required
                  min="0.01"
                  step="0.01"
                  value={currentTransaction.amount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  required
                  value={currentTransaction.date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  name="type"
                  id="type"
                  required
                  value={currentTransaction.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="categoryId"
                  id="categoryId"
                  required
                  value={currentTransaction.categoryId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select a category</option>
                  {categories?.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
