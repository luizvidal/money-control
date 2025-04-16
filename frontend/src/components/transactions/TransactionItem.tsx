import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Transaction } from '../../services/transactionService';

interface TransactionItemProps {
  transaction: Transaction;
  categoryName?: string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

const TransactionItem = ({ transaction, categoryName, onEdit, onDelete }: TransactionItemProps) => {
  const formattedDate = new Date(transaction.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const isIncome = transaction.type === 'INCOME';
  const amountColor = isIncome ? 'text-green-600' : 'text-red-600';
  const amountBg = isIncome ? 'bg-green-100' : 'bg-red-100';
  const amountSign = isIncome ? '+' : '-';

  return (
    <li className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150 group">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center">
            <div className={`${isIncome ? 'bg-green-100' : 'bg-red-100'} p-2 rounded-full mr-3`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 ${isIncome ? 'text-green-600' : 'text-red-600'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isIncome ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                )}
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600 truncate group-hover:text-blue-700 transition-colors duration-150">
                {transaction.description}
              </p>
              <div className="flex flex-wrap mt-1">
                <span className="text-xs text-gray-500 mr-3">
                  {formattedDate}
                </span>
                {categoryName && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {categoryName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${amountBg} ${amountColor}`}>
            {amountSign} R$ {transaction.amount.toFixed(2)}
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(transaction)}
              className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-blue-50 transition-colors duration-150"
              aria-label="Edit transaction"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => transaction.id && onDelete(transaction.id)}
              className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors duration-150"
              aria-label="Delete transaction"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

export default TransactionItem;
