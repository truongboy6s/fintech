import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { formatCurrency } from '@/utils/formatCurrency';

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
}

const quickActions: QuickAction[] = [
  { id: '1', title: 'Thu nhập', icon: 'arrow-down-circle', color: Colors.actionGreen, route: '/add-income' },
  { id: '2', title: 'Chi tiêu', icon: 'arrow-up-circle', color: Colors.actionRed, route: '/add-expense' },
  { id: '3', title: 'Ngân sách', icon: 'pie-chart', color: Colors.actionPurple, route: '/(tabs)/budgets' },
  { id: '4', title: 'Giao dịch', icon: 'list', color: Colors.actionBlue, route: '/(tabs)/transactions' },
  { id: '5', title: 'Xuất file', icon: 'download', color: Colors.actionYellow, route: '/export' },
];

export default function HomeScreen() {
  const router = useRouter();

  // Mock data - sẽ được thay thế bằng dữ liệu thực từ API
  const balance = 25000000;
  const income = 30000000;
  const expense = 5000000;

  const handleQuickAction = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <LinearGradient
          colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Xin chào! 👋</Text>
              <Text style={styles.userName}>Người dùng</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={Colors.textLight} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Tổng số dư</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            
            <View style={styles.balanceDetails}>
              <View style={styles.balanceDetailItem}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.incomeLight }]}>
                  <Ionicons name="arrow-down" size={16} color={Colors.income} />
                </View>
                <View style={styles.balanceDetailText}>
                  <Text style={styles.balanceDetailLabel}>Thu nhập</Text>
                  <Text style={[styles.balanceDetailAmount, { color: Colors.income }]}>
                    {formatCurrency(income)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.balanceDetailItem}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.expenseLight }]}>
                  <Ionicons name="arrow-up" size={16} color={Colors.expense} />
                </View>
                <View style={styles.balanceDetailText}>
                  <Text style={styles.balanceDetailLabel}>Chi tiêu</Text>
                  <Text style={[styles.balanceDetailAmount, { color: Colors.expense }]}>
                    {formatCurrency(expense)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionItem}
                onPress={() => handleQuickAction(action.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={28} color={Colors.textLight} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          <Card style={styles.transactionCard}>
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyStateText}>Chưa có giao dịch nào</Text>
              <Text style={styles.emptyStateSubtext}>
                Thêm giao dịch đầu tiên của bạn
              </Text>
            </View>
          </Card>
        </View>

        {/* Budget Overview */}
        <View style={styles.budgetSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ngân sách tháng này</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/budgets')}>
              <Text style={styles.seeAllText}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
          
          <Card style={styles.budgetCard}>
            <View style={styles.emptyState}>
              <Ionicons name="pie-chart-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyStateText}>Chưa có ngân sách</Text>
              <Text style={styles.emptyStateSubtext}>
                Tạo ngân sách để quản lý chi tiêu
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Layout.spacing.xxl,
  },
  header: {
    paddingTop: Layout.spacing.xxl + 20,
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xxl,
    borderBottomLeftRadius: Layout.borderRadius.xl,
    borderBottomRightRadius: Layout.borderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  greeting: {
    fontSize: Layout.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  userName: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginTop: Layout.spacing.xs,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.expense,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    backdropFilter: 'blur(10px)',
  },
  balanceLabel: {
    fontSize: Layout.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Layout.spacing.xs,
  },
  balanceAmount: {
    fontSize: Layout.fontSize.xxxl,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: Layout.spacing.lg,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  balanceDetailText: {
    flex: 1,
  },
  balanceDetailLabel: {
    fontSize: Layout.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceDetailAmount: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.textLight,
  },
  quickActionsContainer: {
    paddingHorizontal: Layout.spacing.lg,
    marginTop: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Layout.spacing.md,
  },
  quickActionItem: {
    width: '18%',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  recentSection: {
    paddingHorizontal: Layout.spacing.lg,
    marginTop: Layout.spacing.xl,
  },
  budgetSection: {
    paddingHorizontal: Layout.spacing.lg,
    marginTop: Layout.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  seeAllText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  transactionCard: {
    minHeight: 150,
  },
  budgetCard: {
    minHeight: 150,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  emptyStateText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Layout.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
    marginTop: Layout.spacing.xs,
  },
});
