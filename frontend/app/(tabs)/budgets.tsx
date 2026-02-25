import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Card, CustomButton } from '@/components/ui';
import { formatCurrency, formatCurrencyShort } from '@/utils/formatCurrency';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBudgets, deleteBudget } from '@/store/slices/budget.slice';

export default function BudgetsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { list: budgets, loading } = useAppSelector((state) => state.budgets);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchBudgets());
    }, [dispatch])
  );

  const calculatePercentage = (spent: number, total: number) => {
    return Math.min((spent / total) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return Colors.error;
    if (percentage >= 70) return Colors.warning;
    return Colors.success;
  };

  const handleOpenActionModal = (budgetId: string) => {
    setSelectedBudgetId(budgetId);
    setShowActionModal(true);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
    setTimeout(() => setSelectedBudgetId(null), 300);
  };

  const handleEditBudget = () => {
    if (selectedBudgetId) {
      handleCloseActionModal();
      router.push(`/edit-budget?id=${selectedBudgetId}` as any);
    }
  };

  const handleDeleteBudget = () => {
    if (!selectedBudgetId) return;

    const budget = budgets.find(b => b.id === selectedBudgetId);
    handleCloseActionModal();

    Alert.alert(
      'Xóa ngân sách',
      `Bạn có chắc muốn xóa ngân sách "${budget?.name}"?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteBudget(selectedBudgetId)).unwrap();
              Alert.alert('Thành công', 'Đã xóa ngân sách');
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa ngân sách');
            }
          },
        },
      ]
    );
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
                onPress={() => router.push('/add-budget')}
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
                      <View style={[styles.budgetIcon, { backgroundColor: budget.category?.color || Colors.primary }]}>
                        <Ionicons name={(budget.category?.icon || 'wallet') as any} size={24} color={Colors.textLight} />
                      </View>
                      <View>
                        <Text style={styles.budgetName}>{budget.name}</Text>
                        <Text style={styles.budgetPeriod}>
                          {budget.period === 'WEEK' ? 'Hàng tuần' : budget.period === 'MONTH' ? 'Hàng tháng' : 'Hàng năm'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleOpenActionModal(budget.id)}>
                      <Ionicons name="ellipsis-horizontal" size={24} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.budgetProgress}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.spentText}>
                        {formatCurrencyShort(budget.spent)}
                      </Text>
                      <Text style={styles.totalText}>
                        / {formatCurrencyShort(budget.amount)}
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
                      <View style={styles.progressStats}>
                        <Text style={[styles.percentageText, { color: progressColor }]}>
                          {percentage.toFixed(0)}%
                        </Text>
                        <Text style={styles.remainingText}>
                          Còn lại: {formatCurrencyShort(budget.amount - budget.spent)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })}

            {/* Create New Budget Button */}
            <TouchableOpacity
              style={styles.createNewButton}
              onPress={() => router.push('/add-budget')}
            >
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
              <Text style={styles.createNewText}>Tạo ngân sách mới</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseActionModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleCloseActionModal}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tùy chọn</Text>
            </View>

            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleEditBudget}
            >
              <Ionicons name="create-outline" size={24} color={Colors.primary} />
              <Text style={styles.modalOptionText}>Chỉnh sửa ngân sách</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleDeleteBudget}
            >
              <Ionicons name="trash-outline" size={24} color={Colors.error} />
              <Text style={[styles.modalOptionText, { color: Colors.error }]}>Xóa ngân sách</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleCloseActionModal}
            >
              <Ionicons name="close-outline" size={24} color={Colors.textMuted} />
              <Text style={styles.modalOptionText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
  },
  spentText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    flexShrink: 0,
  },
  totalText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
    flexShrink: 1,
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
    marginTop: 2,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  percentageText: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '600',
    flexShrink: 0,
  },
  remainingText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textMuted,
    flexShrink: 0,
    textAlign: 'right',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    paddingBottom: Layout.spacing.xxl,
  },
  modalHeader: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.xl,
    gap: Layout.spacing.md,
  },
  modalOptionText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  modalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Layout.spacing.lg,
  },
});
