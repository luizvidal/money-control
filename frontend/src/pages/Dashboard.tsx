import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import transactionService from '../services/transactionService';
import categoryService from '../services/categoryService';
import { Transaction } from '../services/transactionService';
import { Category } from '../services/categoryService';

// Registrar componentes do Chart.js
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

  // Buscar transações
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionService.getAll
  });

  // Buscar categorias
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll
  });

  // Processar dados para os gráficos quando as consultas forem concluídas
  useEffect(() => {
    if (transactions && categories) {
      processMonthlyData(transactions);
      processCategoryData(transactions, categories);
    }
  }, [transactions, categories]);

  // Processar dados para o gráfico de linha (evolução mensal)
  const processMonthlyData = (transactions: Transaction[]) => {
    const months: { [key: string]: { incomes: number, expenses: number } } = {};
    
    // Inicializar os últimos 6 meses
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
      months[monthKey] = { incomes: 0, expenses: 0 };
    }
    
    // Agrupar transações por mês
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
    
    // Formatar dados para o gráfico
    const labels = Object.keys(months).map(key => {
      const [year, month] = key.split('-');
      return `${month}/${year}`;
    });
    
    const incomes = Object.values(months).map(data => data.incomes);
    const expenses = Object.values(months).map(data => data.expenses);
    
    setMonthlyData({ labels, incomes, expenses });
  };

  // Processar dados para o gráfico de pizza (gastos por categoria)
  const processCategoryData = (transactions: Transaction[], categories: Category[]) => {
    const categoryMap = new Map<number, { total: number, name: string }>();
    
    // Inicializar categorias
    categories.forEach(category => {
      if (category.id) {
        categoryMap.set(category.id, { total: 0, name: category.name });
      }
    });
    
    // Somar gastos por categoria (apenas despesas)
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
    
    // Gerar cores aleatórias para as categorias
    const generateColors = (count: number) => {
      const colors = [];
      for (let i = 0; i < count; i++) {
        const hue = (i * 137) % 360; // Distribuição de cores mais uniforme
        colors.push(`hsl(${hue}, 70%, 60%)`);
      }
      return colors;
    };
    
    // Formatar dados para o gráfico
    const categoryEntries = Array.from(categoryMap.entries())
      .filter(([_, data]) => data.total > 0)
      .sort((a, b) => b[1].total - a[1].total);
    
    const labels = categoryEntries.map(([_, data]) => data.name);
    const data = categoryEntries.map(([_, data]) => data.total);
    const backgroundColor = generateColors(labels.length);
    
    setCategoryData({ labels, data, backgroundColor });
  };

  // Calcular totais
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

  // Configuração do gráfico de pizza
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

  // Configuração do gráfico de linha
  const lineChartData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Receitas',
        data: monthlyData.incomes,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Despesas',
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
      
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Receitas do Mês</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">R$ {totals.income.toFixed(2)}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Despesas do Mês</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">R$ {totals.expense.toFixed(2)}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Saldo</dt>
            <dd className={`mt-1 text-3xl font-semibold ${totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {totals.balance.toFixed(2)}
            </dd>
          </div>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Gastos por Categoria</h2>
          <div className="h-64">
            {categoryData.data.length > 0 ? (
              <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sem dados para exibir
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Evolução Mensal</h2>
          <div className="h-64">
            {monthlyData.labels.length > 0 ? (
              <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sem dados para exibir
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Últimas transações */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Últimas Transações</h2>
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
                        {transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
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
              Nenhuma transação encontrada
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
