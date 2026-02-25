import { apiClient } from './api';
import * as SecureStore from 'expo-secure-store';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Đang đăng nhập...');
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      // Lưu token vào secure storage
      if (response.accessToken) {
        await SecureStore.setItemAsync('authToken', response.accessToken);
      }
      
      console.log('✅ Đăng nhập thành công');
      return response;
    } catch (error: any) {
      console.error('❌ Lỗi đăng nhập:', error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout - Server mất quá lâu để phản hồi. Vui lòng thử lại.');
      }
      if (error.message === 'Network Error') {
        throw new Error('Lỗi kết nối mạng. Kiểm tra Internet và thử lại.');
      }
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('📝 Đang đăng ký...');
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      // Lưu token vào secure storage
      if (response.accessToken) {
        await SecureStore.setItemAsync('authToken', response.accessToken);
      }
      
      console.log('✅ Đăng ký thành công');
      return response;
    } catch (error: any) {
      console.error('❌ Lỗi đăng ký:', error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout - Server mất quá lâu để phản hồi. Vui lòng thử lại.');
      }
      if (error.message === 'Network Error') {
        throw new Error('Lỗi kết nối mạng. Kiểm tra Internet và thử lại.');
      }
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  }

  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string; resetToken?: string }> {
    try {
      console.log('📧 Đang gửi yêu cầu reset mật khẩu...');
      const response = await apiClient.post<{ message: string; resetToken?: string }>('/auth/forgot-password', data);
      console.log('✅ Đã gửi email reset mật khẩu');
      return response as { message: string; resetToken?: string };
    } catch (error: any) {
      console.error('❌ Lỗi forgot password:', error);
      throw new Error(error.response?.data?.message || 'Không thể gửi yêu cầu reset mật khẩu');
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      console.log('🔑 Đang reset mật khẩu...');
      const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
      console.log('✅ Reset mật khẩu thành công');
      return response as { message: string };
    } catch (error: any) {
      console.error('❌ Lỗi reset password:', error);
      throw new Error(error.response?.data?.message || 'Không thể reset mật khẩu');
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    try {
      console.log('🔐 Đang đổi mật khẩu...');
      const response = await apiClient.post<{ message: string }>('/auth/change-password', data);
      console.log('✅ Đổi mật khẩu thành công');
      return response as { message: string };
    } catch (error: any) {
      console.error('❌ Lỗi change password:', error);
      throw new Error(error.response?.data?.message || 'Không thể đổi mật khẩu');
    }
  }
}

export const authService = new AuthService();
export default authService;
