import { Category } from '../../services/categoryService';
import { Transaction } from '../../services/transactionService';
import Pagination from '../common/Pagination';
import TransactionItem from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
  categories?: Category[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

const TransactionList = ({
  transactions,
  categories,
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  onEdit,
  onDelete
}: TransactionListProps) => {
  const getCategoryName = (transaction: Transaction) => {
    // First, check if the transaction has a category object
    if (transaction.category && transaction.category.name) {
      return transaction.category.name;
    }

    // Fallback to the old categoryId approach if category object is not present
    if (transaction.categoryId) {
      // Convert categoryId to number to ensure proper comparison
      const categoryIdNumber = Number(transaction.categoryId);

      // Find the category with matching ID
      const category = categories?.find(c => {
        // Convert category ID to number for comparison
        const cId = Number(c.id);
        return !isNaN(cId) && cId === categoryIdNumber;
      });

      return category?.name || 'Uncategorized';
    }

    return 'Uncategorized';
  };

  return (
    <div className="space-y-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {transactions.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                categoryName={getCategoryName(transaction)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new transaction.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
            <span>Showing {transactions.length} of {totalElements} transactions</span>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TransactionList;
