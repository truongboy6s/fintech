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

export default function ChangePasswordScreen() {
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { currentPassword: '', newPassword: '', confirmPassword: '' };

    if (!currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
      valid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      valid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      valid = false;
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
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

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
      });
      
      Alert.alert(
        'Thành công',
        'Mật khẩu đã được thay đổi thành công.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      console.error('Change password error:', error);
      
      // Xử lý các loại lỗi cụ thể
      if (error.message.includes('Current password is incorrect') || 
          error.message.includes('Mật khẩu hiện tại không đúng')) {
        setErrors({ ...errors, currentPassword: 'Mật khẩu hiện tại không đúng' });
      } else {
        Alert.alert('Lỗi', error.message || 'Không thể đổi mật khẩu');
      }
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
          <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
          <Text style={styles.headerSubtitle}>Cập nhật mật khẩu của bạn</Text>
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
                <Ionicons name="key" size={48} color={Colors.primary} />
              </View>
            </View>

            <Text style={styles.description}>
              Để bảo mật tài khoản, vui lòng nhập mật khẩu hiện tại và mật khẩu mới.
            </Text>

            <CustomInput
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                setErrors({ ...errors, currentPassword: '' });
              }}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.currentPassword}
            />

            <CustomInput
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setErrors({ ...errors, newPassword: '' });
              }}
              secureTextEntry
              icon="lock-open-outline"
              error={errors.newPassword}
            />

            <CustomInput
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors({ ...errors, confirmPassword: '' });
              }}
              secureTextEntry
              icon="lock-open-outline"
              error={errors.confirmPassword}
            />

            <View style={styles.passwordHints}>
              <Text style={styles.hintTitle}>Yêu cầu mật khẩu mới:</Text>
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
                  name={newPassword !== currentPassword && newPassword.length > 0 ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={newPassword !== currentPassword && newPassword.length > 0 ? Colors.success : Colors.textMuted} 
                />
                <Text style={styles.hintText}>Khác với mật khẩu hiện tại</Text>
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
              title="Đổi mật khẩu"
              onPress={handleChangePassword}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              style={styles.submitButton}
            />

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>
                Sau khi đổi mật khẩu, bạn vẫn sẽ tiếp tục đăng nhập trên thiết bị này.
              </Text>
            </View>
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.sm,
    backgroundColor: Colors.primaryLight,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
});
