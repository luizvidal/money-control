import { useQuery } from '@tanstack/react-query';
import categoryService from '../../services/categoryService';
import { Transaction } from '../../services/transactionService';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const isIncome = transaction.type === 'INCOME';
  const formattedDate = new Date(transaction.date).toLocaleDateString();
  const formattedAmount = `${isIncome ? '+' : '-'} R$ ${transaction.amount.toFixed(2)}`;

  // Fetch category data
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll()
  });

  // Find the category for this transaction
  const category = categories ?
    (Array.isArray(categories) ?
      categories.find(c => c.id === transaction.categoryId) :
      categories.content?.find(c => c.id === transaction.categoryId)) :
    null;

  return (
    <li className="hover:bg-gray-50 transition-colors duration-150">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-blue-600 truncate">{transaction.description}</p>
          <div className="ml-2 flex-shrink-0 flex">
            <p className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isIncome ? 'Income' : 'Expense'}
            </p>
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              {formattedDate}
            </p>
            {category && (
              <p className="ml-4 flex items-center text-sm text-gray-500">
                <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                {category.name}
              </p>
            )}
          </div>
          <div className="mt-2 flex items-center text-sm sm:mt-0">
            <p className={`font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
              {formattedAmount}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default TransactionItem;
