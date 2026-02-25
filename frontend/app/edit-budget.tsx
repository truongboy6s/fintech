import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/category.slice';
import { updateBudget, fetchBudgetById } from '@/store/slices/budget.slice';
import { CategoryType } from '@/services/category.service';
import { formatCurrency } from '@/utils/formatCurrency';

export default function EditBudgetScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ id: string }>();
  const budgetId = params.id;
  
  const { expenseCategories, loading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { list: budgets, loading: budgetsLoading } = useAppSelector((state) => state.budgets);
  const budget = budgets.find(b => b.id === budgetId);
  
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [name, setName] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load budget data
  useEffect(() => {
    if (budgetId && !budget) {
      dispatch(fetchBudgetById(budgetId));
    }
  }, [budgetId, budget, dispatch]);

  // Initialize form with budget data
  useEffect(() => {
    if (budget && !isInitialized) {
      setName(budget.name);
      setAmount(budget.amount.toString());
      setSelectedCategory(budget.categoryId || '');
      setIsInitialized(true);
    }
  }, [budget, isInitialized]);

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

  const handleSave = async () => {
    if (!budgetId) {
      Alert.alert('Lỗi', 'Không tìm thấy ngân sách');
      return;
    }

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
      await dispatch(updateBudget({
        id: budgetId,
        data: {
          name: name.trim(),
          amount: parseInt(amount),
          categoryId: selectedCategory,
        }
      })).unwrap();
      Alert.alert('Thành công', 'Đã cập nhật ngân sách', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật ngân sách');
      console.error('Update budget error:', error);
    }
  };

  if (!budget || budgetsLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  const selectedCat = expenseCategories.find(c => c.id === selectedCategory);
  const periodText = budget.period === 'WEEK' ? 'Hàng tuần' : budget.period === 'MONTH' ? 'Hàng tháng' : 'Hàng năm';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa ngân sách</Text>
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

        {/* Period - Read only */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chu kỳ</Text>
          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>{periodText}</Text>
            <Text style={styles.readOnlyHint}>Không thể thay đổi chu kỳ</Text>
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn danh mục chi tiêu</Text>
          {categoriesLoading ? (
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
              <Text style={styles.summaryValue}>{periodText}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giới hạn:</Text>
              <Text style={[styles.summaryValue, styles.summaryAmount]}>
                {formatCurrency(parseInt(amount))}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Đã chi:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(budget.spent || 0)}
              </Text>
            </View>
          </View>
        )}

        {/* Save Button */}
        <View style={styles.footer}>
          <CustomButton
            title="Lưu thay đổi"
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
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
  readOnlyBox: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  readOnlyText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  readOnlyHint: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textMuted,
    marginTop: Layout.spacing.xs,
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
