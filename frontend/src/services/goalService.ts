import api from './api';

export interface Goal {
  id?: number;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

const goalService = {
  getAll: async (): Promise<Goal[]> => {
    const response = await api.get<Goal[]>('/goals');
    return response.data;
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
