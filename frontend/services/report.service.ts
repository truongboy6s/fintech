import { apiClient, getApiBaseUrl } from './api';

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';

export interface MonthlyReport {
  period: {
    year: number;
    month: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  };
  categoryBreakdown: CategoryBreakdown[];
  transactions: any[];
}

export interface CategoryBreakdown {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: string;
  };
  income: number;
  expense: number;
  transactionCount: number;
}

export interface CategoryReport {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: string;
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    transactionCount: number;
  };
  transactions: any[];
}

export interface TrendReport {
  year: number;
  month: number;
  income: number;
  expense: number;
  balance: number;
}

export interface WeeklyTrendReport {
  weekNumber: number;
  startDate: string;
  endDate: string;
  income: number;
  expense: number;
  balance: number;
}

export interface YearlyTrendReport {
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export interface ExportOptions {
  format: 'pdf' | 'excel';
  startDate?: string;
  endDate?: string;
  includeCharts?: boolean;
}

class ReportService {
  async getMonthlyReport(year?: number, month?: number): Promise<MonthlyReport> {
    try {
      const params: any = {};
      if (year) params.year = year;
      if (month) params.month = month;
      
      return await apiClient.get<MonthlyReport>('/reports/monthly', { params });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy báo cáo tháng');
    }
  }

  async getCategoryReport(categoryId: string, startDate?: string, endDate?: string): Promise<CategoryReport> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      return await apiClient.get<CategoryReport>(`/reports/category/${categoryId}`, { params });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy báo cáo danh mục');
    }
  }

  async getTrendReport(months?: number): Promise<TrendReport[]> {
    try {
      const params: any = {};
      if (months) params.months = months;
      
      return await apiClient.get<TrendReport[]>('/reports/trend', { params });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy báo cáo xu hướng');
    }
  }

  async getWeeklyTrendReport(weeks?: number): Promise<WeeklyTrendReport[]> {
    try {
      const params: any = {};
      if (weeks) params.weeks = weeks;
      
      return await apiClient.get<WeeklyTrendReport[]>('/reports/trend/weekly', { params });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy báo cáo xu hướng tuần');
    }
  }

  async getYearlyTrendReport(years?: number): Promise<YearlyTrendReport[]> {
    try {
      const params: any = {};
      if (years) params.years = years;
      
      return await apiClient.get<YearlyTrendReport[]>('/reports/trend/yearly', { params });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy báo cáo xu hướng năm');
    }
  }

  async getReport(startDate: string, endDate: string): Promise<any> {
    try {
      return await apiClient.get<any>('/reports', {
        params: { startDate, endDate },
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy báo cáo');
    }
  }

  async exportPDF(options: ExportOptions): Promise<string> {
    try {
      // Get auth token
      const token = await SecureStore.getItemAsync('authToken');
      const API_URL = getApiBaseUrl();
      
      const response = await fetch(`${API_URL}/reports/export/pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Không thể xuất PDF');
      }

      // Get response as arrayBuffer
      const arrayBuffer = await response.arrayBuffer();
      
      // Convert arrayBuffer to base64
      const base64 = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      const fileUri = `${FileSystem.documentDirectory}report-${Date.now()}.pdf`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: 'base64' as FileSystem.EncodingType,
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
      
      return fileUri;
    } catch (error: any) {
      throw new Error(error.message || 'Không thể xuất PDF');
    }
  }

  async exportExcel(options: ExportOptions): Promise<string> {
    try {
      // Get auth token
      const token = await SecureStore.getItemAsync('authToken');
      const API_URL = getApiBaseUrl();
      
      const response = await fetch(`${API_URL}/reports/export/excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Không thể xuất Excel');
      }

      // Get response as arrayBuffer
      const arrayBuffer = await response.arrayBuffer();
      
      // Convert arrayBuffer to base64
      const base64 = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      const fileUri = `${FileSystem.documentDirectory}report-${Date.now()}.xlsx`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: 'base64' as FileSystem.EncodingType,
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
      
      return fileUri;
    } catch (error: any) {
      throw new Error(error.message || 'Không thể xuất Excel');
    }
  }

  private async saveAndShareFile(data: any, filename: string, mimeType: string): Promise<string> {
    try {
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(data);
      });
      
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: 'base64' as FileSystem.EncodingType,
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
      
      return fileUri;
    } catch (error) {
      console.error('Error saving/sharing file:', error);
      throw error;
    }
  }

  async getCategorySummary(startDate: string, endDate: string): Promise<any> {
    try {
      return await apiClient.get('/reports/categories', {
        params: { startDate, endDate },
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thống kê danh mục');
    }
  }
}

export const reportService = new ReportService();
export default reportService;
