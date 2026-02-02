import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { loginSuccess, logout as logoutAction } from '@/store/slices/auth.slice';
import { authService, LoginRequest, RegisterRequest } from '@/services/auth.service';
import { useState } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login({ email, password });
      
      dispatch(loginSuccess({
        user: response.user,
        token: response.token,
      }));
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register({ name, email, password });
      
      dispatch(loginSuccess({
        user: response.user,
        token: response.token,
      }));
      
      return response;
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      dispatch(logoutAction());
    } catch (err: any) {
      setError(err.message || 'Đăng xuất thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.getProfile();
      return userData;
    } catch (err: any) {
      setError(err.message || 'Không thể lấy thông tin người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    getProfile,
  };
};
