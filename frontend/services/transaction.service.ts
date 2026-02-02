import { apiClient } from './api';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export interface CreateTransactionDto {
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description?: string;
  date: string;
}

export interface UpdateTransactionDto {
  amount?: number;
  categoryId?: string;
  description?: string;
  date?: string;
}

class TransactionService {
  async getAll(): Promise<Transaction[]> {
    try {
      return await apiClient.get<Transaction[]>('/transactions');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách giao dịch');
    }
  }

  async getById(id: string): Promise<Transaction> {
    try {
      return await apiClient.get<Transaction>(`/transactions/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không tìm thấy giao dịch');
    }
  }

  async create(data: CreateTransactionDto): Promise<Transaction> {
    try {
      return await apiClient.post<Transaction>('/transactions', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể tạo giao dịch');
    }
  }

  async update(id: string, data: UpdateTransactionDto): Promise<Transaction> {
    try {
      return await apiClient.patch<Transaction>(`/transactions/${id}`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể cập nhật giao dịch');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/transactions/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể xóa giao dịch');
    }
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      return await apiClient.get<Transaction[]>('/transactions', {
        params: { startDate, endDate },
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy giao dịch theo thời gian');
    }
  }
}

export const transactionService = new TransactionService();
export default transactionService;
