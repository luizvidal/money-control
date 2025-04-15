import { useQuery } from '@tanstack/react-query';
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import categoryService, { Category } from '../services/categoryService';
import transactionService, { Transaction } from '../services/transactionService';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const Dashboard = () => {
  const [monthlyData, setMonthlyData] = useState<{ labels: string[], incomes: number[], expenses: number[] }>({
    labels: [],
    incomes: [],
    expenses: []
  });

  const [categoryData, setCategoryData] = useState<{ labels: string[], data: number[], backgroundColor: string[] }>({
    labels: [],
    data: [],
    backgroundColor: []
  });

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionService.getAll
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll
  });

  // Process data for charts when queries are completed
  useEffect(() => {
    if (transactions && categories) {
      processMonthlyData(transactions);
      processCategoryData(transactions, categories);
    }
  }, [transactions, categories]);

  // Process data for line chart (monthly evolution)
  const processMonthlyData = (transactions: Transaction[]) => {
    const months: { [key: string]: { incomes: number, expenses: number } } = {};

    // Initialize the last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
      months[monthKey] = { incomes: 0, expenses: 0 };
    }

    // Group transactions by month
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (months[monthKey]) {
        if (transaction.type === 'INCOME') {
          months[monthKey].incomes += transaction.amount;
        } else {
          months[monthKey].expenses += transaction.amount;
        }
      }
    });

    // Format data for the chart
    const labels = Object.keys(months).map(key => {
      const [year, month] = key.split('-');
      return `${month}/${year}`;
    });

    const incomes = Object.values(months).map(data => data.incomes);
    const expenses = Object.values(months).map(data => data.expenses);

    setMonthlyData({ labels, incomes, expenses });
  };

  // Process data for pie chart (expenses by category)
  const processCategoryData = (transactions: Transaction[], categories: Category[]) => {
    const categoryMap = new Map<number, { total: number, name: string }>();

    // Initialize categories
    categories.forEach(category => {
      if (category.id) {
        categoryMap.set(category.id, { total: 0, name: category.name });
      }
    });

    // Sum expenses by category (only expenses)
    transactions
      .filter(transaction => transaction.type === 'EXPENSE')
      .forEach(transaction => {
        const categoryId = transaction.categoryId;
        const category = categoryMap.get(categoryId);

        if (category) {
          categoryMap.set(categoryId, {
            ...category,
            total: category.total + transaction.amount
          });
        }
      });

    // Generate random colors for categories
    const generateColors = (count: number) => {
      const colors = [];
      for (let i = 0; i < count; i++) {
        const hue = (i * 137) % 360; // More uniform color distribution
        colors.push(`hsl(${hue}, 70%, 60%)`);
      }
      return colors;
    };

    // Format data for the chart
    const categoryEntries = Array.from(categoryMap.entries())
      .filter(([_, data]) => data.total > 0)
      .sort((a, b) => b[1].total - a[1].total);

    const labels = categoryEntries.map(([_, data]) => data.name);
    const data = categoryEntries.map(([_, data]) => data.total);
    const backgroundColor = generateColors(labels.length);

    setCategoryData({ labels, data, backgroundColor });
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!transactions) return { income: 0, expense: 0, balance: 0 };

    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense
    };
  };

  const totals = calculateTotals();

  // Pie chart configuration
  const pieChartData = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.data,
        backgroundColor: categoryData.backgroundColor,
        borderWidth: 1,
      },
    ],
  };

  // Line chart configuration
  const lineChartData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Income',
        data: monthlyData.incomes,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Expenses',
        data: monthlyData.expenses,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
      },
    ],
  };

  if (transactionsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Monthly Income</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">R$ {totals.income.toFixed(2)}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Monthly Expenses</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">R$ {totals.expense.toFixed(2)}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Balance</dt>
            <dd className={`mt-1 text-3xl font-semibold ${totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {totals.balance.toFixed(2)}
            </dd>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Expenses by Category</h2>
          <div className="h-64">
            {categoryData.data.length > 0 ? (
              <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data to display
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Evolution</h2>
          <div className="h-64">
            {monthlyData.labels.length > 0 ? (
              <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data to display
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Latest transactions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Latest Transactions</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {transactions && transactions.length > 0 ? (
            transactions.slice(0, 5).map((transaction) => (
              <li key={transaction.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600 truncate">{transaction.description}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p className={`font-medium ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'INCOME' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
              No transactions found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
