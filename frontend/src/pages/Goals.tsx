import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import goalService, { Goal } from '../services/goalService';

interface GoalFormData {
  id?: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

const Goals = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<GoalFormData>({
    name: '',
    description: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });
  const [isEditing, setIsEditing] = useState(false);

  // Buscar metas
  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalService.getAll
  });

  // Mutação para criar meta
  const createMutation = useMutation({
    mutationFn: goalService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      resetForm();
    }
  });

  // Mutação para atualizar meta
  const updateMutation = useMutation({
    mutationFn: (goal: Goal) => 
      goalService.update(goal.id!, goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      resetForm();
    }
  });

  // Mutação para excluir meta
  const deleteMutation = useMutation({
    mutationFn: goalService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });

  const handleOpenModal = (goal?: Goal) => {
    if (goal) {
      setCurrentGoal({
        id: goal.id,
        name: goal.name,
        description: goal.description || '',
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: new Date(goal.targetDate).toISOString().split('T')[0]
      });
      setIsEditing(true);
    } else {
      setCurrentGoal({
        name: '',
        description: '',
        targetAmount: 0,
        currentAmount: 0,
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setCurrentGoal({
      name: '',
      description: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
    });
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && currentGoal.id) {
      updateMutation.mutate(currentGoal as Goal);
    } else {
      createMutation.mutate(currentGoal as Goal);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentGoal(prev => ({
      ...prev,
      [name]: ['targetAmount', 'currentAmount'].includes(name) ? parseFloat(value) : value
    }));
  };

  // Calcular progresso da meta
  const calculateProgress = (current: number, target: number) => {
    if (target <= 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(progress, 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Metas Financeiras</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nova Meta
        </button>
      </div>

      {/* Lista de metas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {goals && goals.length > 0 ? (
          goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={goal.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{goal.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(goal)}
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => goal.id && handleDelete(goal.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {goal.description && (
                    <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
                  )}
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Progresso</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="mt-2 relative">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ width: `${progress}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-gray-500">Meta</span>
                      <span className="block font-medium text-gray-900">R$ {goal.targetAmount.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Atual</span>
                      <span className="block font-medium text-gray-900">R$ {goal.currentAmount.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Data Alvo</span>
                      <span className="block font-medium text-gray-900">{new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Dias Restantes</span>
                      <span className={`block font-medium ${daysLeft < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {daysLeft < 0 ? 'Atrasado' : daysLeft}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Nenhuma meta encontrada</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Criar sua primeira meta
            </button>
          </div>
        )}
      </div>

      {/* Modal de formulário */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? 'Editar Meta' : 'Nova Meta'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome da Meta
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={currentGoal.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descrição (opcional)
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  value={currentGoal.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
                  Valor Alvo
                </label>
                <input
                  type="number"
                  name="targetAmount"
                  id="targetAmount"
                  required
                  min="0.01"
                  step="0.01"
                  value={currentGoal.targetAmount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700">
                  Valor Atual
                </label>
                <input
                  type="number"
                  name="currentAmount"
                  id="currentAmount"
                  required
                  min="0"
                  step="0.01"
                  value={currentGoal.currentAmount}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">
                  Data Alvo
                </label>
                <input
                  type="date"
                  name="targetDate"
                  id="targetDate"
                  required
                  value={currentGoal.targetDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
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

export default Goals;
