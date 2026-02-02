import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Card } from '@/components/ui';
import { formatCurrency } from '@/utils/formatCurrency';

const screenWidth = Dimensions.get('window').width;

type FilterType = 'week' | 'month' | 'year';
type TransactionType = 'all' | 'income' | 'expense' | 'difference';

const filterOptions = [
  { label: 'Tuần', value: 'week' as FilterType },
  { label: 'Tháng', value: 'month' as FilterType },
  { label: 'Năm', value: 'year' as FilterType },
];

const transactionTypes = [
  { label: 'Tất cả', value: 'all' as TransactionType },
  { label: 'Thu nhập', value: 'income' as TransactionType, color: Colors.income },
  { label: 'Chi tiêu', value: 'expense' as TransactionType, color: Colors.expense },
  { label: 'Chênh lệch', value: 'difference' as TransactionType, color: Colors.primary },
];

// Mock data
const mockData = {
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  datasets: [{
    data: [500000, 800000, 600000, 1200000, 900000, 1500000, 700000],
  }],
};

const mockCategories = [
  { id: '1', name: 'Ăn uống', amount: 2500000, icon: 'restaurant', color: Colors.actionRed },
  { id: '2', name: 'Di chuyển', amount: 1200000, icon: 'car', color: Colors.actionBlue },
  { id: '3', name: 'Mua sắm', amount: 3500000, icon: 'cart', color: Colors.actionPurple },
  { id: '4', name: 'Giải trí', amount: 800000, icon: 'game-controller', color: Colors.actionYellow },
];

export default function TransactionsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('week');
  const [selectedType, setSelectedType] = useState<TransactionType>('all');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Biến động</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Time Filter */}
        <View style={styles.filterContainer}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterPill,
                selectedFilter === option.value && styles.filterPillActive,
              ]}
              onPress={() => setSelectedFilter(option.value)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedFilter === option.value && styles.filterPillTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction Type Filter */}
        <View style={styles.typeFilterContainer}>
          {transactionTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typePill,
                selectedType === type.value && {
                  backgroundColor: type.color || Colors.primary,
                },
              ]}
              onPress={() => setSelectedType(type.value)}
            >
              <Text
                style={[
                  styles.typePillText,
                  selectedType === type.value && styles.typePillTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Biểu đồ chi tiêu</Text>
          <BarChart
            data={mockData}
            width={screenWidth - Layout.spacing.lg * 4}
            height={220}
            yAxisLabel=""
            yAxisSuffix="k"
            chartConfig={{
              backgroundColor: Colors.backgroundLight,
              backgroundGradientFrom: Colors.backgroundLight,
              backgroundGradientTo: Colors.backgroundLight,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(165, 0, 100, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: Layout.borderRadius.md,
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: Colors.border,
                strokeWidth: 1,
              },
              propsForLabels: {
                fontSize: 12,
              },
            }}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
          />
        </Card>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Danh mục chi tiêu</Text>
          {mockCategories.map((category) => (
            <Card key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon as any} size={24} color={Colors.textLight} />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                </View>
              </View>
            </Card>
          ))}
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
  },
  headerTitle: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  filterButton: {
    padding: Layout.spacing.sm,
  },
  scrollContent: {
    paddingBottom: Layout.spacing.xxl,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.full,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.text,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: Colors.textLight,
  },
  typeFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
    gap: Layout.spacing.sm,
    flexWrap: 'wrap',
  },
  typePill: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.full,
    backgroundColor: Colors.borderLight,
  },
  typePillText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.text,
    fontWeight: '500',
  },
  typePillTextActive: {
    color: Colors.textLight,
  },
  chartCard: {
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
  },
  chartTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  chart: {
    marginVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  categoriesSection: {
    paddingHorizontal: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  categoryCard: {
    marginBottom: Layout.spacing.sm,
    padding: Layout.spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  categoryName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  categoryAmount: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
});
