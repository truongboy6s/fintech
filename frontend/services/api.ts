import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * ================================
 * DEV API URL CONFIG
 * ================================
 * Android Emulator  -> 10.0.2.2
 * iOS Simulator     -> localhost
 * Physical Device   -> IP máy tính (192.168.1.103)
 */

const getApiUrl = () => {
  // 1️⃣ Nếu có ENV (ưu tiên cao nhất)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 🔥 Force dùng Render cho dev + production
  return 'https://fintech-ueb5.onrender.com/api';

  // 2️⃣ Production build (APK / Store)
  // if (!__DEV__) {
  //   return 'https://fintech-ueb5.onrender.com/api';
  // }

  // 3️⃣ Development mode với backend local
  // if (Platform.OS === 'ios') {
  //   return 'http://localhost:3000/api';
  // }

  // Android dev dùng IP máy tính
  // return 'http://192.168.1.103:3000/api';
};

const API_BASE_URL = getApiUrl();

console.log('🌐 API_BASE_URL:', API_BASE_URL);

// Export for use in other services
export const getApiBaseUrl = () => API_BASE_URL;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    /**
     * ================================
     * REQUEST INTERCEPTOR
     * ================================
     */
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await SecureStore.getItemAsync('authToken');

          console.log(
            '🔑 Token:',
            token ? `${token.substring(0, 20)}...` : 'NO TOKEN'
          );

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('❌ Error getting token:', error);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    /**
     * ================================
     * RESPONSE INTERCEPTOR
     * ================================
     */
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.error('🚨 API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        // Nếu token hết hạn
        if (error.response?.status === 401) {
          await SecureStore.deleteItemAsync('authToken');
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * ================================
   * GENERIC METHODS
   * ================================
   */

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(
      url,
      data,
      config
    );
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config
    );
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;