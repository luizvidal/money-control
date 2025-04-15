import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import transactionService, { Transaction } from '../services/transactionService';
import categoryService, { Category } from '../services/categoryService';

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
  const [currentTransaction, setCurrentTransaction] = useState<TransactionFormData>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'EXPENSE',
    categoryId: 0
  });
  const [isEditing, setIsEditing] = useState(false);

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

  // Mutação para criar transação
  const createMutation = useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      resetForm();
    }
  });

  // Mutação para atualizar transação
  const updateMutation = useMutation({
    mutationFn: (transaction: Transaction) => 
      transactionService.update(transaction.id!, transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      resetForm();
    }
  });

  // Mutação para excluir transação
  const deleteMutation = useMutation({
    mutationFn: transactionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
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
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentTransaction(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Transações</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nova Transação
        </button>
      </div>

      {/* Lista de transações */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <li key={transaction.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-600 truncate">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Categoria: {categories?.find(c => c.id === transaction.categoryId)?.name || 'N/A'}
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
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => transaction.id && handleDelete(transaction.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
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

      {/* Modal de formulário */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? 'Editar Transação' : 'Nova Transação'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descrição
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
                  Valor
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
                  Data
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
                  Tipo
                </label>
                <select
                  name="type"
                  id="type"
                  required
                  value={currentTransaction.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="INCOME">Receita</option>
                  <option value="EXPENSE">Despesa</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <select
                  name="categoryId"
                  id="categoryId"
                  required
                  value={currentTransaction.categoryId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Selecione uma categoria</option>
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
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isEditing ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
