import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
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
import { useEffect, useMemo, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import Pagination from '../components/common/Pagination';
import ChartCard from '../components/dashboard/ChartCard';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import LoadingSpinner from '../components/dashboard/LoadingSpinner';
import SummaryCard from '../components/dashboard/SummaryCard';
import TransactionItem from '../components/dashboard/TransactionItem';
import PageLayout from '../components/Layout/PageLayout';
import categoryService, { Category } from '../services/categoryService';
import transactionService, { Transaction } from '../services/transactionService';
import '../styles/animations.css';
import { PageResponse } from '../types/PageResponse';

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

  // Pagination state for latest transactions
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([]);

  // Fetch transactions with pagination for latest transactions section
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', 'latest', currentPage, pageSize],
    queryFn: () => transactionService.getAll({ pageNo: currentPage, pageSize, sortBy: 'date', sortDir: 'desc' })
  });

  // Fetch all transactions for charts
  const { data: allTransactionsData, isLoading: allTransactionsLoading } = useQuery({
    queryKey: ['transactions', 'all'],
    queryFn: () => transactionService.getAll()
  });

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll()
  });

  // Convert data to appropriate types using useMemo to avoid unnecessary re-renders
  const allTransactions = useMemo<Transaction[]>(() => {
    if (!allTransactionsData) return [];
    return Array.isArray(allTransactionsData)
      ? allTransactionsData
      : allTransactionsData.content || [];
  }, [allTransactionsData]);

  const categories = useMemo<Category[]>(() => {
    if (!categoriesData) return [];
    return Array.isArray(categoriesData)
      ? categoriesData
      : categoriesData.content || [];
  }, [categoriesData]);

  // Update state when latest transactions data changes
  useEffect(() => {
    if (transactionsData) {
      if ('content' in transactionsData) {
        const pageData = transactionsData as PageResponse<Transaction>;
        setLatestTransactions(pageData.content);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
      } else {
        setLatestTransactions((transactionsData as Transaction[]).slice(0, pageSize));
        setTotalPages(1);
        setTotalElements((transactionsData as Transaction[]).length);
      }
    }
  }, [transactionsData, pageSize]);

  // Process data for charts when queries are completed
  useEffect(() => {
    if (allTransactionsData && categoriesData) {
      processMonthlyData(allTransactions);
      processCategoryData(allTransactions, categories);
    }
  }, [allTransactionsData, categoriesData, allTransactions, categories]);

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
    console.log('Processing category data with:', {
      transactionsCount: transactions.length,
      categoriesCount: categories.length
    });

    // Log all categories and transactions for debugging
    console.log('All categories:', JSON.stringify(categories, null, 2));
    console.log('All transactions:', JSON.stringify(transactions.slice(0, 5), null, 2)); // Log first 5 transactions

    // Get expense transactions for debugging
    const debugExpenseTransactions = transactions.filter(t => t.type === 'EXPENSE');
    console.log('Expense transactions:', JSON.stringify(debugExpenseTransactions.slice(0, 5), null, 2)); // Log first 5 expense transactions

    // Log category IDs from transactions
    const categoryIds = debugExpenseTransactions.map(t => t.categoryId);
    console.log('Category IDs from expense transactions:', categoryIds);

    // Log category IDs from categories
    const availableCategoryIds = categories.map(c => c.id);
    console.log('Available category IDs:', availableCategoryIds);

    // If there are no transactions or categories, return empty data
    if (transactions.length === 0 || categories.length === 0) {
      console.log('No transactions or categories available');
      setCategoryData({ labels: [], data: [], backgroundColor: [] });
      return;
    }

    const categoryMap = new Map<number, { total: number, name: string }>();

    // Initialize categories
    categories.forEach(category => {
      if (category.id !== undefined && category.id !== null) {
        // Ensure category ID is a number
        const categoryId = Number(category.id);
        if (!isNaN(categoryId)) {
          categoryMap.set(categoryId, { total: 0, name: category.name });
          console.log(`Initialized category: ${category.name} with ID ${categoryId}`);
        }
      }
    });

    // Add an 'Unknown' category for transactions without a valid category
    const unknownCategoryId = -1;
    categoryMap.set(unknownCategoryId, { total: 0, name: 'Unknown' });

    console.log('Initialized category map:', Array.from(categoryMap.entries()));

    // Sum expenses by category (only expenses)
    const expenseTransactions = transactions.filter(transaction => transaction.type === 'EXPENSE');
    console.log('Expense transactions count:', expenseTransactions.length);

    // If there are no expense transactions, return empty data
    if (expenseTransactions.length === 0) {
      console.log('No expense transactions found');
      setCategoryData({ labels: [], data: [], backgroundColor: [] });
      return;
    }

    // Create a map of category IDs to names for quick lookup
    const categoryIdToName = new Map<number, string>();
    categories.forEach(category => {
      if (category.id !== undefined && category.id !== null) {
        categoryIdToName.set(category.id, category.name);
        console.log(`Added category ID ${category.id} to lookup map`);
      }
    });

    // Log the category ID to name map
    console.log('Category ID to name map:', Object.fromEntries(categoryIdToName));

    expenseTransactions.forEach(transaction => {
      // Get category ID from either the category object or the categoryId field
      let categoryId = transaction.categoryId;
      let categoryName = '';

      // Check if transaction has a category object
      if (transaction.category && transaction.category.id) {
        categoryId = transaction.category.id;
        categoryName = transaction.category.name;
        console.log(`Transaction has category object with ID ${categoryId} and name ${categoryName}`);
      }

      console.log(`Processing transaction with category ID: ${categoryId}`);

      // Check if this category ID exists in our categories
      // Convert to number to ensure proper comparison
      const categoryIdNumber = Number(categoryId);

      if (!isNaN(categoryIdNumber) && (categoryIdToName.has(categoryIdNumber) || categoryName)) {
        // If we have a category name from the transaction object, use that
        if (!categoryName && categoryIdToName.has(categoryIdNumber)) {
          categoryName = categoryIdToName.get(categoryIdNumber) || '';
        }

        console.log(`Found matching category for ID ${categoryIdNumber}: ${categoryName}`);
        const category = categoryMap.get(categoryIdNumber);

        if (category) {
          categoryMap.set(categoryIdNumber, {
            ...category,
            total: category.total + transaction.amount
          });
          console.log(`Added ${transaction.amount} to category ${category.name}, new total: ${category.total + transaction.amount}`);
        } else if (categoryName) {
          // If we have a category name but no entry in the map, create one
          categoryMap.set(categoryIdNumber, {
            name: categoryName,
            total: transaction.amount
          });
          console.log(`Created new category entry for ${categoryName} with amount ${transaction.amount}`);
        }
      } else {
        console.log(`Category not found for transaction with ID ${categoryId}:`, transaction);
        // Add to the 'Unknown' category
        const unknownCategory = categoryMap.get(unknownCategoryId)!;
        categoryMap.set(unknownCategoryId, {
          ...unknownCategory,
          total: unknownCategory.total + transaction.amount
        });
        console.log(`Added ${transaction.amount} to Unknown category, new total: ${unknownCategory.total + transaction.amount}`);
      }
    });

    console.log('Category map after summing expenses:', Array.from(categoryMap.entries()));

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
      .filter(([, data]) => data.total > 0)
      .sort((a, b) => b[1].total - a[1].total);

    console.log('Filtered category entries with expenses:', categoryEntries);

    // If there are no categories with expenses, return empty data
    if (categoryEntries.length === 0) {
      console.log('No categories with expenses found');
      setCategoryData({ labels: [], data: [], backgroundColor: [] });
      return;
    }

    // Check if we only have the 'Unknown' category
    if (categoryEntries.length === 1 && categoryEntries[0][0] === unknownCategoryId) {
      console.log('Only Unknown category found. Checking if we have categories available...');

      // If we have categories but all transactions are 'Unknown', show a message
      if (categories.length > 0) {
        console.log('Categories exist but no transactions are using them');
        // We'll still show the Unknown category in this case
      }
    }

    const labels = categoryEntries.map(([, data]) => data.name);
    const data = categoryEntries.map(([, data]) => data.total);
    const backgroundColor = generateColors(labels.length);

    console.log('Final chart data:', { labels, data, backgroundColor });

    setCategoryData({ labels, data, backgroundColor });
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!allTransactions) return { income: 0, expense: 0, balance: 0 };

    const income = allTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = allTransactions
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

  if (transactionsLoading || allTransactionsLoading || categoriesLoading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  // Chart options
  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    }
  };

  // Page header component
  const header = (
    <div className="p-6 pb-0">
      <DashboardHeader
        title="Financial Dashboard"
        subtitle="Overview of your financial activity"
      />
    </div>
  );

  // Page content component
  const content = (
    <div className="p-6 pt-4 space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Monthly Income"
          value={`R$ ${totals.income.toFixed(2)}`}
          valueColor="text-green-600"
          icon={<BanknotesIcon className="h-6 w-6 text-green-600" />}
        />

        <SummaryCard
          title="Monthly Expenses"
          value={`R$ ${totals.expense.toFixed(2)}`}
          valueColor="text-red-600"
          icon={<ChartPieIcon className="h-6 w-6 text-red-600" />}
        />

        <SummaryCard
          title="Balance"
          value={`R$ ${totals.balance.toFixed(2)}`}
          valueColor={totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'}
          icon={<ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Expenses by Category"
          hasData={categoryData.data.length > 0 && !(categoryData.labels.length === 1 && categoryData.labels[0] === 'Unknown')}
          emptyMessage={
            categoryData.labels.length === 1 && categoryData.labels[0] === 'Unknown' ?
            "Your transactions aren't assigned to specific categories. Please update your transactions with valid categories." :
            "No expense transactions found. Add some expenses to see the chart."
          }
        >
          <Pie data={pieChartData} options={chartOptions} />
        </ChartCard>

        <ChartCard
          title="Monthly Evolution"
          hasData={monthlyData.labels.length > 0}
          emptyMessage="No transactions found. Add some transactions to see the chart."
        >
          <Line data={lineChartData} options={chartOptions} />
        </ChartCard>
      </div>

      {/* Latest transactions (without pagination) */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Latest Transactions</h2>
        </div>

        <ul className="divide-y divide-gray-200">
          {latestTransactions && latestTransactions.length > 0 ? (
            latestTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
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
        <span>Showing {latestTransactions.length} of {totalElements} transactions</span>
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
    </div>
  );
};

export default Dashboard;
