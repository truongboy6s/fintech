import { apiClient } from './api';

export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  period: 'WEEK' | 'MONTH' | 'YEAR';
  categoryId?: string;
  startDate: string;
  endDate: string;
  spent: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export interface CreateBudgetDto {
  name: string;
  amount: number;
  period: 'WEEK' | 'MONTH' | 'YEAR';
  categoryId: string;
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetDto {
  name?: string;
  amount?: number;
  categoryId?: string;
}

class BudgetService {
  async getAll(): Promise<Budget[]> {
    try {
      return await apiClient.get<Budget[]>('/budgets');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách ngân sách');
    }
  }

  async getById(id: string): Promise<Budget> {
    try {
      return await apiClient.get<Budget>(`/budgets/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không tìm thấy ngân sách');
    }
  }

  async create(data: CreateBudgetDto): Promise<Budget> {
    try {
      return await apiClient.post<Budget>('/budgets', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể tạo ngân sách');
    }
  }

  async update(id: string, data: UpdateBudgetDto): Promise<Budget> {
    try {
      return await apiClient.patch<Budget>(`/budgets/${id}`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể cập nhật ngân sách');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/budgets/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể xóa ngân sách');
    }
  }

  async getCurrentPeriodBudgets(): Promise<Budget[]> {
    try {
      return await apiClient.get<Budget[]>('/budgets/current');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy ngân sách hiện tại');
    }
  }
}

export const budgetService = new BudgetService();
export default budgetService;
