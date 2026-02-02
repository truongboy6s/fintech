import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// API Base URL - có thể thay đổi IP này theo máy của bạn
// Để lấy IP máy: chạy ipconfig (Windows) hoặc ifconfig (Mac/Linux)

// Uncomment dòng này nếu dùng thiết bị thật (physical device)
// const DEV_API_URL = 'http://10.50.136.239:3000/api';

// Dùng cho emulator/simulator
const DEV_API_URL = Platform.select({
  // Android Emulator: 10.0.2.2 maps to host's localhost
  android: 'http://10.0.2.2:3000/api',
  // iOS Simulator: localhost works
  ios: 'http://localhost:3000/api',
  // Web: localhost
  default: 'http://localhost:3000/api',
});

const API_BASE_URL = __DEV__ ? DEV_API_URL : 'https://your-production-api.com/api';

console.log('🌐 API_BASE_URL:', API_BASE_URL);

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - thêm token vào header
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync('authToken');
          console.log('🔑 Token from SecureStore:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Authorization header added');
          } else {
            console.log('⚠️ No token found in SecureStore');
          }
        } catch (error) {
          console.error('❌ Error getting token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - xử lý lỗi chung
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Log chi tiết lỗi để debug
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        if (error.response?.status === 401) {
          // Token expired hoặc invalid
          await SecureStore.deleteItemAsync('authToken');
          // Có thể dispatch logout action ở đây
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
