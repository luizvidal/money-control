import { PageResponse } from '../types/PageResponse';
import api from './api';

export interface Goal {
  id?: number;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface GoalParams {
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
}

const goalService = {
  getAll: async (params?: GoalParams): Promise<PageResponse<Goal> | Goal[]> => {
    if (params && params.pageSize && params.pageSize > 0) {
      const { pageNo = 0, pageSize = 10, sortBy = 'targetDate', sortDir = 'asc' } = params;
      const response = await api.get<PageResponse<Goal>>(
        `/goals?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
      );
      return response.data;
    } else {
      const response = await api.get<Goal[]>('/goals?pageSize=0');
      return response.data;
    }
  },

  getById: async (id: number): Promise<Goal> => {
    const response = await api.get<Goal>(`/goals/${id}`);
    return response.data;
  },

  create: async (goal: Goal): Promise<Goal> => {
    const response = await api.post<Goal>('/goals', goal);
    return response.data;
  },

  update: async (id: number, goal: Goal): Promise<Goal> => {
    const response = await api.put<Goal>(`/goals/${id}`, goal);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/goals/${id}`);
  }
};

export default goalService;
