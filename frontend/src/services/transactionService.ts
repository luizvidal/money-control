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
  startDate?: string;
  endDate?: string;
  type?: string;
  categoryId?: number;
}

const transactionService = {
  getAll: async (params?: TransactionParams): Promise<PageResponse<Transaction> | Transaction[]> => {
    // Build base pagination and sorting params
    const queryParams = new URLSearchParams();

    if (params) {
      // Add pagination and sorting params
      if (params.pageNo !== undefined) queryParams.append('pageNo', params.pageNo.toString());
      if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDir) queryParams.append('sortDir', params.sortDir);

      // Determine which endpoint to use based on filters
      let endpoint = '/transactions';

      // Check if we need to use a specific filter endpoint
      if (params.startDate && params.endDate) {
        // Date range filter
        const formattedStart = params.startDate.includes('T') ? params.startDate : `${params.startDate}T00:00:00`;
        const formattedEnd = params.endDate.includes('T') ? params.endDate : `${params.endDate}T23:59:59`;

        queryParams.append('start', formattedStart);
        queryParams.append('end', formattedEnd);

        endpoint = '/transactions/date-range';
      } else if (params.type && params.type !== 'ALL') {
        // Type filter
        endpoint = `/transactions/type/${params.type}`;
      } else if (params.categoryId !== undefined && params.categoryId > 0) {
        // Category filter
        endpoint = `/transactions/category/${params.categoryId}`;
      }

      // Make the API call with the query string
      const queryString = queryParams.toString();
      const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;

      // Log the API request URL for debugging
      console.log('API Request URL:', url);
      console.log('Filter Params:', params);

      try {
        const response = await api.get<PageResponse<Transaction>>(url);
        console.log('API Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } else {
      // No filters, use the default endpoint
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
