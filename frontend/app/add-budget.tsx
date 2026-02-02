import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/category.slice';
import { createBudget } from '@/store/slices/budget.slice';
import { CategoryType } from '@/services/category.service';
import { formatCurrency } from '@/utils/formatCurrency';

type BudgetPeriod = 'WEEK' | 'MONTH' | 'YEAR';

export default function AddBudgetScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { expenseCategories, loading } = useAppSelector((state) => state.categories);
  
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('MONTH');
  const [name, setName] = useState('');

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchCategories(CategoryType.EXPENSE));
    }, [dispatch])
  );

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setAmount(cleaned);
  };

  const formatDisplayAmount = (value: string) => {
    if (!value) return '0';
    return parseInt(value).toLocaleString('vi-VN');
  };

  const calculateDates = (period: BudgetPeriod) => {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();

    if (period === 'WEEK') {
      // Start of current week (Monday)
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      endDate.setDate(diff + 6);
    } else if (period === 'MONTH') {
      // Start and end of current month
      startDate.setDate(1);
      endDate.setMonth(now.getMonth() + 1, 0);
    } else if (period === 'YEAR') {
      // Start and end of current year
      startDate.setMonth(0, 1);
      endDate.setMonth(11, 31);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const handleSave = async () => {
    if (!amount || parseInt(amount) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên ngân sách');
      return;
    }

    try {
      const { startDate, endDate } = calculateDates(period);
      await dispatch(createBudget({
        name: name.trim(),
        amount: parseInt(amount),
        categoryId: selectedCategory,
        period,
        startDate,
        endDate,
      })).unwrap();
      Alert.alert('Thành công', 'Đã tạo ngân sách', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo ngân sách');
      console.error('Create budget error:', error);
    }
  };

  const selectedCat = expenseCategories.find(c => c.id === selectedCategory);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo ngân sách</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Budget Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tên ngân sách</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Ngân sách ăn uống tháng 2"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số tiền giới hạn</Text>
          <View style={styles.amountContainer}>
            <TextInput
              style={styles.amountInput}
              value={formatDisplayAmount(amount)}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.currency}>đ</Text>
          </View>
        </View>

        {/* Period */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chu kỳ</Text>
          <View style={styles.periodContainer}>
            <TouchableOpacity
              style={[styles.periodButton, period === 'WEEK' && styles.periodButtonActive]}
              onPress={() => setPeriod('WEEK')}
            >
              <Text style={[styles.periodText, period === 'WEEK' && styles.periodTextActive]}>
                Tuần
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, period === 'MONTH' && styles.periodButtonActive]}
              onPress={() => setPeriod('MONTH')}
            >
              <Text style={[styles.periodText, period === 'MONTH' && styles.periodTextActive]}>
                Tháng
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, period === 'YEAR' && styles.periodButtonActive]}
              onPress={() => setPeriod('YEAR')}
            >
              <Text style={[styles.periodText, period === 'YEAR' && styles.periodTextActive]}>
                Năm
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn danh mục chi tiêu</Text>
          {loading ? (
            <Text style={styles.loadingText}>Đang tải...</Text>
          ) : expenseCategories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Chưa có danh mục chi tiêu</Text>
              <TouchableOpacity onPress={() => router.push('/add-category')}>
                <Text style={styles.linkText}>Tạo danh mục mới</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
              {expenseCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category.id && styles.categoryItemActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon as any} size={24} color={Colors.textLight} />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Summary */}
        {selectedCat && amount && name && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Tóm tắt</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tên:</Text>
              <Text style={styles.summaryValue}>{name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Danh mục:</Text>
              <Text style={styles.summaryValue}>{selectedCat.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Chu kỳ:</Text>
              <Text style={styles.summaryValue}>
                {period === 'WEEK' ? 'Hàng tuần' : period === 'MONTH' ? 'Hàng tháng' : 'Hàng năm'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giới hạn:</Text>
              <Text style={[styles.summaryValue, styles.summaryAmount]}>
                {formatCurrency(parseInt(amount))}
              </Text>
            </View>
          </View>
        )}

        {/* Save Button */}
        <View style={styles.footer}>
          <CustomButton
            title="Tạo ngân sách"
            onPress={handleSave}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!amount || !selectedCategory || !name.trim()}
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.xxl + 10,
    paddingBottom: Layout.spacing.md,
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: Layout.spacing.lg,
    backgroundColor: Colors.backgroundLight,
    marginTop: Layout.spacing.sm,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountInput: {
    flex: 1,
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    paddingVertical: Layout.spacing.md,
  },
  currency: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  periodContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  periodText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.primary,
  },
  categoryList: {
    flexDirection: 'row',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: Layout.spacing.md,
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  categoryItemActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  categoryName: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    paddingVertical: Layout.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },
  emptyText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.sm,
  },
  linkText: {
    fontSize: Layout.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: Colors.backgroundLight,
    marginHorizontal: Layout.spacing.lg,
    marginTop: Layout.spacing.lg,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  summaryTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  summaryLabel: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  summaryAmount: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  footer: {
    padding: Layout.spacing.lg,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
});
