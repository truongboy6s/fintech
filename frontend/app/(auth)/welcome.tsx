import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Background with gradient */}
      <LinearGradient
        colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
        style={styles.gradient}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          {/* Logo F with money bag icon */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>F</Text>
            </View>
            <View style={styles.moneyBagIcon}>
              <Ionicons name="wallet" size={40} color="#FFD700" />
            </View>
          </View>
          
          {/* Brand Name */}
          <Text style={styles.brandName}>FinTech</Text>
          <Text style={styles.slogan}>Quản lý tài chính thông minh</Text>
        </View>

        {/* Illustration or decorative element */}
        <View style={styles.illustrationContainer}>
          <View style={styles.decorativeCircle}>
            <Ionicons name="trending-up" size={60} color="rgba(255,255,255,0.3)" />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <CustomButton
            title="Đăng nhập"
            onPress={() => router.push('/(auth)/login')}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.loginButton}
            textStyle={styles.loginButtonText}
          />
          
          <CustomButton
            title="Tạo tài khoản"
            onPress={() => router.push('/(auth)/register')}
            variant="outline"
            size="lg"
            fullWidth
            style={styles.registerButton}
            textStyle={styles.registerButtonText}
          />
          
          <Text style={styles.termsText}>
            Bằng việc tiếp tục, bạn đồng ý với{'\n'}
            <Text style={styles.termsLink}>Điều khoản dịch vụ</Text>
            {' & '}
            <Text style={styles.termsLink}>Chính sách bảo mật</Text>
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: Layout.spacing.xl,
  },
  logoContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Layout.spacing.xxl,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: Layout.spacing.lg,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  moneyBagIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    padding: Layout.spacing.sm,
    borderWidth: 3,
    borderColor: Colors.textLight,
  },
  brandName: {
    fontSize: Layout.fontSize.xxxl,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: Layout.spacing.sm,
    letterSpacing: 1,
  },
  slogan: {
    fontSize: Layout.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Layout.spacing.xxl,
  },
  loginButton: {
    backgroundColor: Colors.textLight,
    marginBottom: Layout.spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.textLight,
    borderWidth: 2,
    marginBottom: Layout.spacing.lg,
  },
  registerButtonText: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: Layout.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
