import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton, CustomInput } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { authService } from '@/services/auth.service';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!params.token) {
      Alert.alert('Lỗi', 'Token reset mật khẩu không hợp lệ', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [params.token]);

  const validateForm = () => {
    let valid = true;
    const newErrors = { newPassword: '', confirmPassword: '' };

    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      valid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      valid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      valid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleResetPassword = async () => {
    if (!validateForm() || !params.token) return;

    setLoading(true);
    try {
      await authService.resetPassword({
        token: params.token,
        newPassword,
      });
      
      Alert.alert(
        'Thành công',
        'Mật khẩu đã được reset thành công. Vui lòng đăng nhập với mật khẩu mới.',
        [
          {
            text: 'Đăng nhập',
            onPress: () => router.replace('/(auth)/login')
          }
        ]
      );
    } catch (error: any) {
      console.error('Reset password error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể reset mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <LinearGradient
        colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textLight} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Reset mật khẩu</Text>
          <Text style={styles.headerSubtitle}>Tạo mật khẩu mới cho tài khoản</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed" size={48} color={Colors.primary} />
              </View>
            </View>

            <Text style={styles.description}>
              Tạo mật khẩu mới cho tài khoản của bạn. Mật khẩu phải có ít nhất 6 ký tự.
            </Text>

            <CustomInput
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setErrors({ ...errors, newPassword: '' });
              }}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.newPassword}
            />

            <CustomInput
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors({ ...errors, confirmPassword: '' });
              }}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.confirmPassword}
            />

            <View style={styles.passwordHints}>
              <Text style={styles.hintTitle}>Mật khẩu nên:</Text>
              <View style={styles.hintItem}>
                <Ionicons 
                  name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={newPassword.length >= 6 ? Colors.success : Colors.textMuted} 
                />
                <Text style={styles.hintText}>Có ít nhất 6 ký tự</Text>
              </View>
              <View style={styles.hintItem}>
                <Ionicons 
                  name={newPassword === confirmPassword && newPassword.length > 0 ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={newPassword === confirmPassword && newPassword.length > 0 ? Colors.success : Colors.textMuted} 
                />
                <Text style={styles.hintText}>Trùng khớp với xác nhận mật khẩu</Text>
              </View>
            </View>

            <CustomButton
              title="Reset mật khẩu"
              onPress={handleResetPassword}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Layout.spacing.xxl + 20,
    paddingBottom: Layout.spacing.xxl,
    paddingHorizontal: Layout.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: Layout.spacing.xs,
  },
  headerSubtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.textLight,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Layout.spacing.lg,
  },
  formContainer: {
    flex: 1,
    paddingTop: Layout.spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: 22,
    paddingHorizontal: Layout.spacing.md,
  },
  passwordHints: {
    backgroundColor: Colors.backgroundLight,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.md,
  },
  hintTitle: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.xs,
  },
  hintText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  submitButton: {
    marginTop: Layout.spacing.xl,
  },
});
