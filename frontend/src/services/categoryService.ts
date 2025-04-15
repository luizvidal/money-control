import { PageResponse } from '../types/PageResponse';
import api from './api';

export interface Category {
  id?: number;
  name: string;
  description?: string;
}

export interface CategoryParams {
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
}

const categoryService = {
  getAll: async (params?: CategoryParams): Promise<PageResponse<Category> | Category[]> => {
    if (params && params.pageSize && params.pageSize > 0) {
      const { pageNo = 0, pageSize = 10, sortBy = 'name', sortDir = 'asc' } = params;
      const response = await api.get<PageResponse<Category>>(
        `/categories?pageNo=${pageNo}&pageSize=${pageSize}&sortBy=${sortBy}&sortDir=${sortDir}`
      );
      return response.data;
    } else {
      const response = await api.get<Category[]>('/categories?pageSize=0');
      return response.data;
    }
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (category: Category): Promise<Category> => {
    const response = await api.post<Category>('/categories', category);
    return response.data;
  },

  update: async (id: number, category: Category): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, category);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};

export default categoryService;
