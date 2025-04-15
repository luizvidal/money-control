import api from './api';

export interface Transaction {
  id?: number;
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId: number;
}

const transactionService = {
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/transactions');
    return response.data;
  },

  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  create: async (transaction: Transaction): Promise<Transaction> => {
    const response = await api.post<Transaction>('/transactions', transaction);
    return response.data;
  },

  update: async (id: number, transaction: Transaction): Promise<Transaction> => {
    const response = await api.put<Transaction>(`/transactions/${id}`, transaction);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },

  getByDateRange: async (start: string, end: string): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>(`/transactions/date-range?start=${start}&end=${end}`);
    return response.data;
  },

  getByType: async (type: 'INCOME' | 'EXPENSE'): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>(`/transactions/type/${type}`);
    return response.data;
  },

  getByCategory: async (categoryId: number): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>(`/transactions/category/${categoryId}`);
    return response.data;
  }
};

export default transactionService;
