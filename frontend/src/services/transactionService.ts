import { PageResponse } from '../types/PageResponse';
import api from './api';

export interface Transaction {
  id?: number;
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId: number;
}

export interface TransactionParams {
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
}

const transactionService = {
  getAll: async (params?: TransactionParams): Promise<PageResponse<Transaction> | Transaction[]> => {
    if (params && params.pageSize && params.pageSize > 0) {
      const { pageNo = 0, pageSize = 10, sortBy = 'date', sortDir = 'desc' } = params;
      const response = await api.get<PageResponse<Transaction>>(
        `/transactions?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
      );
      return response.data;
    } else {
      const response = await api.get<Transaction[]>('/transactions?pageSize=0');
      return response.data;
    }
  },

  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  create: async (transaction: Transaction): Promise<Transaction> => {
    // Format date to include time for LocalDateTime compatibility
    const formattedTransaction = {
      ...transaction,
      date: transaction.date ? `${transaction.date}T00:00:00` : null
    };
    const response = await api.post<Transaction>('/transactions', formattedTransaction);
    return response.data;
  },

  update: async (id: number, transaction: Transaction): Promise<Transaction> => {
    // Format date to include time for LocalDateTime compatibility
    const formattedTransaction = {
      ...transaction,
      date: transaction.date ? `${transaction.date}T00:00:00` : null
    };
    const response = await api.put<Transaction>(`/transactions/${id}`, formattedTransaction);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },

  getByDateRange: async (start: string, end: string, params?: TransactionParams): Promise<PageResponse<Transaction> | Transaction[]> => {
    // Format dates to include time for LocalDateTime compatibility
    const formattedStart = start.includes('T') ? start : `${start}T00:00:00`;
    const formattedEnd = end.includes('T') ? end : `${end}T23:59:59`;

    if (params && params.pageSize && params.pageSize > 0) {
      const { pageNo = 0, pageSize = 10, sortBy = 'date', sortDir = 'desc' } = params;
      const response = await api.get<PageResponse<Transaction>>(
        `/transactions/date-range?start=${formattedStart}&end=${formattedEnd}&pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
      );
      return response.data;
    } else {
      const response = await api.get<Transaction[]>(`/transactions/date-range?start=${formattedStart}&end=${formattedEnd}&pageSize=0`);
      return response.data;
    }
  },

  getByType: async (type: 'INCOME' | 'EXPENSE', params?: TransactionParams): Promise<PageResponse<Transaction> | Transaction[]> => {
    if (params && params.pageSize && params.pageSize > 0) {
      const { pageNo = 0, pageSize = 10, sortBy = 'date', sortDir = 'desc' } = params;
      const response = await api.get<PageResponse<Transaction>>(
        `/transactions/type/${type}?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
      );
      return response.data;
    } else {
      const response = await api.get<Transaction[]>(`/transactions/type/${type}?pageSize=0`);
      return response.data;
    }
  },

  getByCategory: async (categoryId: number, params?: TransactionParams): Promise<PageResponse<Transaction> | Transaction[]> => {
    if (params && params.pageSize && params.pageSize > 0) {
      const { pageNo = 0, pageSize = 10, sortBy = 'date', sortDir = 'desc' } = params;
      const response = await api.get<PageResponse<Transaction>>(
        `/transactions/category/${categoryId}?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
      );
      return response.data;
    } else {
      const response = await api.get<Transaction[]>(`/transactions/category/${categoryId}?pageSize=0`);
      return response.data;
    }
  }
};

export default transactionService;
