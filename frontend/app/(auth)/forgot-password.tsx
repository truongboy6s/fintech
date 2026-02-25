import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton, CustomInput } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { authService } from '@/services/auth.service';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const validateEmail = () => {
    if (!email) {
      setError('Vui lòng nhập email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }
    return true;
  };

  const handleForgotPassword = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    setError('');
    try {
      const response = await authService.forgotPassword({ email });
      
      // Lưu token để test (trong production, token sẽ được gửi qua email)
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
      
      Alert.alert(
        'Thành công',
        'Đã gửi yêu cầu reset mật khẩu. Trong môi trường thực tế, bạn sẽ nhận được email chứa link reset mật khẩu.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Trong production: chỉ quay về màn hình login
              // Ở đây để test, ta chuyển đến màn hình reset với token
              if (response.resetToken) {
                router.push(`/(auth)/reset-password?token=${response.resetToken}` as any);
              } else {
                router.back();
              }
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Không thể gửi yêu cầu reset mật khẩu');
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
          <Text style={styles.headerTitle}>Quên mật khẩu</Text>
          <Text style={styles.headerSubtitle}>Đừng lo lắng, chúng tôi sẽ giúp bạn!</Text>
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
                <Ionicons name="mail-outline" size={48} color={Colors.primary} />
              </View>
            </View>

            <Text style={styles.description}>
              Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn link để reset mật khẩu.
            </Text>

            <CustomInput
              label="Email"
              placeholder="Nhập email của bạn"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              error={error}
            />

            <CustomButton
              title="Gửi yêu cầu"
              onPress={handleForgotPassword}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              style={styles.submitButton}
            />

            <TouchableOpacity 
              style={styles.backToLogin}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={16} color={Colors.primary} />
              <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
            </TouchableOpacity>
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
  submitButton: {
    marginTop: Layout.spacing.md,
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Layout.spacing.xl,
    gap: Layout.spacing.xs,
  },
  backToLoginText: {
    fontSize: Layout.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});
