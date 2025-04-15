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
      .filter(([, data]) => data.total > 0)
      .sort((a, b) => b[1].total - a[1].total);

    const labels = categoryEntries.map(([, data]) => data.name);
    const data = categoryEntries.map(([, data]) => data.total);
    const backgroundColor = generateColors(labels.length);

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
          hasData={categoryData.data.length > 0}
        >
          <Pie data={pieChartData} options={chartOptions} />
        </ChartCard>

        <ChartCard
          title="Monthly Evolution"
          hasData={monthlyData.labels.length > 0}
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
