import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Card, CustomButton } from '@/components/ui';
import { formatCurrency } from '@/utils/formatCurrency';

interface Budget {
  id: string;
  name: string;
  period: 'week' | 'month' | 'year';
  amount: number;
  spent: number;
  category: string;
  icon: string;
  color: string;
}

// Mock data
const mockBudgets: Budget[] = [
  {
    id: '1',
    name: 'Ăn uống',
    period: 'month',
    amount: 5000000,
    spent: 300000,
    category: 'food',
    icon: 'restaurant',
    color: Colors.actionRed,
  },
  {
    id: '2',
    name: 'Di chuyển',
    period: 'month',
    amount: 2000000,
    spent: 500000,
    category: 'transport',
    icon: 'car',
    color: Colors.actionBlue,
  },
];

export default function BudgetsScreen() {
  const router = useRouter();
  const [budgets] = useState<Budget[]>(mockBudgets);

  const calculatePercentage = (spent: number, total: number) => {
    return Math.min((spent / total) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return Colors.error;
    if (percentage >= 70) return Colors.warning;
    return Colors.success;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ngân sách</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {budgets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Ionicons name="pie-chart-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Chưa có ngân sách</Text>
              <Text style={styles.emptyText}>
                Tạo ngân sách để quản lý chi tiêu hiệu quả hơn
              </Text>
              <CustomButton
                title="Tạo ngân sách"
                onPress={() => router.push('/create-budget')}
                variant="primary"
                size="md"
                icon="add-circle"
                style={styles.createButton}
              />
            </View>
          </Card>
        ) : (
          <>
            {/* Budget List */}
            {budgets.map((budget) => {
              const percentage = calculatePercentage(budget.spent, budget.amount);
              const progressColor = getProgressColor(percentage);

              return (
                <Card key={budget.id} style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <View style={styles.budgetInfo}>
                      <View style={[styles.budgetIcon, { backgroundColor: budget.color }]}>
                        <Ionicons name={budget.icon as any} size={24} color={Colors.textLight} />
                      </View>
                      <View>
                        <Text style={styles.budgetName}>{budget.name}</Text>
                        <Text style={styles.budgetPeriod}>
                          {budget.period === 'week' ? 'Tuần' : budget.period === 'month' ? 'Tháng' : 'Năm'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="ellipsis-horizontal" size={24} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.budgetProgress}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.spentText}>
                        {formatCurrency(budget.spent)}
                      </Text>
                      <Text style={styles.totalText}>
                        / {formatCurrency(budget.amount)}
                      </Text>
                    </View>
                    
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${percentage}%`, backgroundColor: progressColor },
                        ]}
                      />
                    </View>

                    <View style={styles.progressFooter}>
                      <Text style={[styles.percentageText, { color: progressColor }]}>
                        {percentage.toFixed(0)}%
                      </Text>
                      <Text style={styles.remainingText}>
                        Còn lại: {formatCurrency(budget.amount - budget.spent)}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}

            {/* Create New Budget Button */}
            <TouchableOpacity
              style={styles.createNewButton}
              onPress={() => router.push('/create-budget')}
            >
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
              <Text style={styles.createNewText}>Tạo ngân sách mới</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.xxl + 10,
    paddingBottom: Layout.spacing.md,
    backgroundColor: Colors.backgroundLight,
  },
  headerTitle: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  helpButton: {
    padding: Layout.spacing.sm,
  },
  scrollContent: {
    paddingBottom: Layout.spacing.xxl,
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
  },
  emptyCard: {
    minHeight: 300,
    marginTop: Layout.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Layout.spacing.lg,
  },
  emptyText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textMuted,
    marginTop: Layout.spacing.sm,
    marginBottom: Layout.spacing.xl,
    textAlign: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  createButton: {
    minWidth: 160,
  },
  budgetCard: {
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.lg,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  budgetName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  budgetPeriod: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  budgetProgress: {
    gap: Layout.spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spentText: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textMuted,
    marginLeft: Layout.spacing.xs,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: Layout.borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: Layout.borderRadius.full,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
  remainingText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.lg,
    backgroundColor: Colors.backgroundLight,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    marginTop: Layout.spacing.md,
  },
  createNewText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: Layout.spacing.sm,
  },
});
