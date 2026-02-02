import { apiClient } from './api';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';

export interface ReportData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: any[];
  categories: any[];
  period: string;
}

export interface ExportOptions {
  format: 'pdf' | 'excel';
  startDate?: string;
  endDate?: string;
  includeCharts?: boolean;
}

class ReportService {
  async getReport(startDate: string, endDate: string): Promise<ReportData> {
    try {
      return await apiClient.get<ReportData>('/reports', {
        params: { startDate, endDate },
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy báo cáo');
    }
  }

  async exportPDF(options: ExportOptions): Promise<void> {
    try {
      const response = await apiClient.post('/reports/export/pdf', options, {
        responseType: 'blob',
      });
      
      // Save file và share (implementation tùy platform)
      await this.saveAndShareFile(response, 'report.pdf', 'application/pdf');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể xuất PDF');
    }
  }

  async exportExcel(options: ExportOptions): Promise<void> {
    try {
      const response = await apiClient.post('/reports/export/excel', options, {
        responseType: 'blob',
      });
      
      // Save file và share
      await this.saveAndShareFile(response, 'report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể xuất Excel');
    }
  }

  private async saveAndShareFile(data: any, filename: string, mimeType: string): Promise<void> {
    try {
      // TODO: Implement file save and share functionality
      // Sẽ implement sau khi có expo-file-system setup đúng
      console.log('File will be saved as:', filename);
      console.log('MIME type:', mimeType);
      
      // Example implementation:
      // const FileSystem = require('expo-file-system');
      // const Sharing = require('expo-sharing');
      // const fileUri = FileSystem.documentDirectory + filename;
      // await FileSystem.writeAsStringAsync(fileUri, data, {
      //   encoding: FileSystem.EncodingType.Base64,
      // });
      // if (await Sharing.isAvailableAsync()) {
      //   await Sharing.shareAsync(fileUri);
      // }
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
