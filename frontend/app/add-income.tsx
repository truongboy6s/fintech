import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton, CustomInput } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/category.slice';
import { createTransaction } from '@/store/slices/transaction.slice';
import { CategoryType } from '@/services/category.service';

export default function AddIncomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { incomeCategories, loading } = useAppSelector((state) => state.categories);
  
  console.log('📊 Income categories in state:', incomeCategories);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');

  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Fetching INCOME categories...');
      dispatch(fetchCategories(CategoryType.INCOME))
        .unwrap()
        .then((data) => console.log('✅ INCOME categories loaded:', data))
        .catch((err) => console.error('❌ Failed to fetch INCOME categories:', err));
    }, [dispatch])
  );

  const handleAmountChange = (text: string) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    setAmount(cleaned);
  };

  const formatDisplayAmount = (value: string) => {
    if (!value) return '0';
    return parseInt(value).toLocaleString('vi-VN');
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

    try {
      await dispatch(createTransaction({
        amount: parseInt(amount),
        type: 'INCOME',
        categoryId: selectedCategory,
        description: note || undefined,
        date: date.toISOString(),
      })).unwrap();
      Alert.alert('Thành công', 'Đã thêm thu nhập', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể thêm thu nhập');
      console.error('Create transaction error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.income} />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.income, '#0D9488']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={28} color={Colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thêm thu nhập</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Số tiền</Text>
          <View style={styles.amountInputContainer}>
            <TextInput
              style={styles.amountInput}
              value={formatDisplayAmount(amount)}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.5)"
              maxLength={15}
            />
            <Text style={styles.currency}>đ</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục</Text>
            <TouchableOpacity onPress={() => router.push('/add-category')}>
              <Text style={styles.addCategoryText}>+ Thêm</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color={Colors.income} />
          ) : incomeCategories.length === 0 ? (
            <Text style={styles.emptyCategoryText}>Chưa có danh mục thu nhập</Text>
          ) : (
            <FlatList
              data={incomeCategories}
              keyExtractor={(item) => item.id}
              numColumns={4}
              scrollEnabled={false}
              columnWrapperStyle={styles.categoryRow}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    selectedCategory === item.id && styles.categoryItemActive,
                  ]}
                  onPress={() => setSelectedCategory(item.id)}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: selectedCategory === item.id ? Colors.income : (item.color || Colors.actionGreen) },
                    ]}
                  >
                    <Ionicons
                      name={(item.icon as any) || 'cash'}
                      size={24}
                      color={Colors.textLight}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === item.id && styles.categoryTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ngày giao dịch</Text>
          <TouchableOpacity style={styles.dateButton}>
            <Ionicons name="calendar-outline" size={20} color={Colors.text} />
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú (Tùy chọn)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Nhập ghi chú..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <CustomButton
          title="Lưu"
          onPress={handleSave}
          variant="success"
          size="lg"
          fullWidth
          disabled={!amount || !selectedCategory}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Layout.spacing.xxl + 10,
    paddingBottom: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  placeholder: {
    width: 40,
  },
  amountContainer: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: Layout.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Layout.spacing.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountInput: {
    fontSize: Layout.fontSize.xxxl + 8,
    fontWeight: 'bold',
    color: Colors.textLight,
    textAlign: 'right',
    minWidth: 100,
  },
  currency: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: Layout.spacing.sm,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    marginTop: -Layout.spacing.lg,
  },
  section: {
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  addCategoryText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.income,
    fontWeight: '600',
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.md,
  },
  categoryItem: {
    width: '23%',
    alignItems: 'center',
  },
  categoryItemActive: {
    opacity: 1,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  categoryText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.text,
    textAlign: 'center',
  },
  categoryTextActive: {
    fontWeight: '600',
    color: Colors.income,
  },
  emptyCategoryText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    padding: Layout.spacing.lg,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    gap: Layout.spacing.md,
  },
  dateText: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    color: Colors.text,
  },
  noteInput: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    minHeight: 80,
  },
  footer: {
    padding: Layout.spacing.lg,
    backgroundColor: Colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
