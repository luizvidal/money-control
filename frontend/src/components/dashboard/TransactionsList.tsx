import { Transaction } from '../../services/transactionService';
import Pagination from '../common/Pagination';
import TransactionItem from './TransactionItem';

interface TransactionsListProps {
  transactions: Transaction[];
  title: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TransactionsList = ({ 
  transactions, 
  title, 
  currentPage, 
  totalPages, 
  onPageChange 
}: TransactionsListProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {transactions && transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <li className="px-4 py-8 text-center text-gray-500">
            No transactions found
          </li>
        )}
      </ul>
      
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200">
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

export default TransactionsList;
