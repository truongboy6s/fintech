import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMonthlyReport, fetchTrendReport, fetchWeeklyTrendReport, fetchYearlyTrendReport } from '@/store/slices/report.slice';
import { formatCurrency } from '@/utils/formatCurrency';

const screenWidth = Dimensions.get('window').width;

type PeriodType = 'week' | 'month' | 'year';
type ViewType = 'income' | 'expense' | 'balance';

export default function AnalyticsScreen() {
  const dispatch = useAppDispatch();
  const { monthlyReport, trendReport, weeklyTrendReport, yearlyTrendReport, loading } = useAppSelector((state) => state.report);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [selectedView, setSelectedView] = useState<ViewType>('balance');
  const [showComparison, setShowComparison] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const currentDate = new Date();
      dispatch(fetchMonthlyReport({ 
        year: currentDate.getFullYear(), 
        month: currentDate.getMonth() + 1 
      }));
      dispatch(fetchTrendReport(6));
      dispatch(fetchWeeklyTrendReport());
      dispatch(fetchYearlyTrendReport(5));
    }, [dispatch])
  );

  if (loading && !monthlyReport) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Prepare chart data - show trend based on selected period and view
  const getChartData = () => {
    let labels: string[] = [];
    let data: number[] = [];

    if (selectedPeriod === 'week' && weeklyTrendReport.length > 0) {
      // Hiển thị 7 ngày trong tuần (T2 - CN) với dữ liệu thực tế
      // dayOfWeek từ backend: 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7, 7=CN
      const dayLabels: { [key: number]: string } = {
        1: 'T2',
        2: 'T3',
        3: 'T4',
        4: 'T5',
        5: 'T6',
        6: 'T7',
        7: 'CN'
      };
      
      // Sắp xếp theo dayOfWeek để đảm bảo thứ tự T2->CN
      const sortedTrends = [...weeklyTrendReport].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      
      // Debug: Log để kiểm tra dữ liệu
      console.log('Weekly trends:', sortedTrends.map(t => ({ day: t.dayOfWeek, date: t.date })));
      
      labels = sortedTrends.map(trend => {
        const dayNum = Number(trend.dayOfWeek); // Đảm bảo là number
        return dayLabels[dayNum] || `Day${dayNum}`;
      });
      
      data = sortedTrends.map(trend => {
        switch (selectedView) {
          case 'income':
            return trend.income;
          case 'expense':
            return trend.expense;
          case 'balance':
            return Math.abs(trend.balance);
          default:
            return 0;
        }
      });
    } else if (selectedPeriod === 'year' && yearlyTrendReport.length > 0) {
      // Hiển thị 5 năm gần nhất
      labels = yearlyTrendReport.map(trend => `${trend.year}`);
      data = yearlyTrendReport.map(trend => {
        switch (selectedView) {
          case 'income':
            return trend.income;
          case 'expense':
            return trend.expense;
          case 'balance':
            return Math.abs(trend.balance);
          default:
            return 0;
        }
      });
    } else if (selectedPeriod === 'month' && trendReport.length > 0) {
      // Hiển thị 6 tháng gần nhất
      labels = trendReport.map(trend => `T${trend.month}`);
      data = trendReport.map(trend => {
        switch (selectedView) {
          case 'income':
            return trend.income;
          case 'expense':
            return trend.expense;
          case 'balance':
            return Math.abs(trend.balance);
          default:
            return 0;
        }
      });
    } else {
      // Default empty data
      labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
      data = [0, 0, 0, 0, 0, 0];
    }

    return {
      labels,
      datasets: [{ data }],
    };
  };

  const chartData = getChartData();

  // Calculate total based on selected view
  const getTotalAmount = () => {
    if (!monthlyReport) return 0;
    switch (selectedView) {
      case 'income':
        return monthlyReport.summary.totalIncome;
      case 'expense':
        return monthlyReport.summary.totalExpense;
      case 'balance':
        return monthlyReport.summary.balance;
      default:
        return 0;
    }
  };

  const getViewTitle = () => {
    switch (selectedView) {
      case 'income':
        return 'Tổng thu nhập';
      case 'expense':
        return 'Tổng chi';
      case 'balance':
        return 'Tổng chênh lệch';
      default:
        return '';
    }
  };

  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'week':
        return 'tuần này';
      case 'month':
        return 'tháng này';
      case 'year':
        return 'năm này';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biến động thu chi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Period Tabs */}
        <View style={styles.periodTabs}>
          <TouchableOpacity
            style={[styles.periodTab, selectedPeriod === 'week' && styles.periodTabActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.periodTabText, selectedPeriod === 'week' && styles.periodTabTextActive]}>
              Theo tuần
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodTab, selectedPeriod === 'month' && styles.periodTabActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.periodTabText, selectedPeriod === 'month' && styles.periodTabTextActive]}>
              Theo tháng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodTab, selectedPeriod === 'year' && styles.periodTabActive]}
            onPress={() => setSelectedPeriod('year')}
          >
            <Text style={[styles.periodTabText, selectedPeriod === 'year' && styles.periodTabTextActive]}>
              Theo năm
            </Text>
          </TouchableOpacity>
        </View>

        {/* View Type Buttons */}
        <View style={styles.viewTypeContainer}>
          <TouchableOpacity
            style={[styles.viewTypeButton, selectedView === 'income' && styles.viewTypeButtonActive]}
            onPress={() => setSelectedView('income')}
          >
            <Text style={[styles.viewTypeText, selectedView === 'income' && styles.viewTypeTextActive]}>
              Thu nhập
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewTypeButton, selectedView === 'expense' && styles.viewTypeButtonActive]}
            onPress={() => setSelectedView('expense')}
          >
            <Text style={[styles.viewTypeText, selectedView === 'expense' && styles.viewTypeTextActive]}>
              Chi tiêu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewTypeButton, selectedView === 'balance' && styles.viewTypeButtonActive]}
            onPress={() => setSelectedView('balance')}
          >
            <Text style={[styles.viewTypeText, selectedView === 'balance' && styles.viewTypeTextActive]}>
              Chênh lệch
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        {monthlyReport && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{getViewTitle()} {getPeriodText()}</Text>
            <Text style={[
              styles.summaryAmount,
              { color: selectedView === 'income' ? Colors.success : selectedView === 'expense' ? Colors.error : getTotalAmount() >= 0 ? Colors.success : Colors.error }
            ]}>
              {getTotalAmount() < 0 ? '-' : ''}{formatCurrency(Math.abs(getTotalAmount()))}
            </Text>
            <View style={styles.comparisonRow}>
              <Ionicons 
                name={getTotalAmount() >= 0 ? 'trending-up' : 'trending-down'} 
                size={16} 
                color={getTotalAmount() >= 0 ? Colors.success : Colors.error} 
              />
              <Text style={[styles.comparisonText, { color: getTotalAmount() >= 0 ? Colors.success : Colors.error }]}>
                {getTotalAmount() >= 0 ? 'Tăng' : 'Giảm'} {formatCurrency(Math.abs(getTotalAmount() * 0.1))}đ so với cùng kỳ tháng trước
              </Text>
              <TouchableOpacity>
                <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Biến động</Text>
            {selectedView === 'expense' && (
              <TouchableOpacity 
                style={styles.comparisonToggle}
                onPress={() => setShowComparison(!showComparison)}
              >
                <Text style={styles.comparisonToggleText}>So với cùng kỳ</Text>
                <View style={[styles.toggleSwitch, showComparison && styles.toggleSwitchActive]}>
                  <View style={[styles.toggleThumb, showComparison && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {chartData.datasets[0].data.length > 0 && (
            <View>
              <BarChart
                data={chartData}
                width={screenWidth - 32}
                height={200}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  backgroundGradientFromOpacity: 0,
                  backgroundGradientToOpacity: 0,
                  decimalPlaces: 0,
                  color: (opacity = 1) => selectedView === 'income' 
                    ? `rgba(34, 197, 94, ${opacity})` 
                    : selectedView === 'expense'
                    ? `rgba(239, 68, 68, ${opacity})`
                    : `rgba(59, 130, 246, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: '#E5E5E5',
                    strokeWidth: 1,
                  },
                  barPercentage: 0.5,
                  fillShadowGradient: 'transparent',
                  fillShadowGradientOpacity: 0,
                }}
                style={styles.chart}
                fromZero
                withInnerLines={true}
                showValuesOnTopOfBars={false}
              />
              {showComparison && selectedView === 'expense' && (
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                    <Text style={styles.legendText}>Chi tiêu cùng kỳ</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
                    <Text style={styles.legendText}>Tổng chi tiêu tháng tháng</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Transaction List or Category List */}
        {selectedView === 'balance' && monthlyReport && (
          <View style={styles.transactionSection}>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionHeaderLeft}>
                <Text style={styles.transactionDate}>1</Text>
                <Text style={styles.transactionDay}>Th 4</Text>
              </View>
              <View style={styles.transactionHeaderRight}>
                <Text style={styles.transactionLabel}>Còn lại</Text>
                <Text style={[styles.transactionValue, { color: monthlyReport.summary.balance >= 0 ? Colors.success : Colors.error }]}>
                  {monthlyReport.summary.balance >= 0 ? '+' : ''}{formatCurrency(monthlyReport.summary.balance)}
                </Text>
              </View>
            </View>

            {monthlyReport.transactions.slice(0, 5).map((transaction: any) => {
              const isIncome = transaction.type === 'INCOME';
              const amount = transaction.amount;
              return (
                <View key={transaction.id} style={styles.transactionRow}>
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionTitle}>{transaction.description || transaction.category?.name || 'Ghi chú'}</Text>
                    <Text style={styles.transactionSubtitle}>
                      {isIncome ? 'Thu' : 'Chi'} {formatCurrency(amount)}đ
                    </Text>
                  </View>
                  <Text style={[styles.transactionAmount, { color: isIncome ? Colors.success : Colors.error }]}>
                    {isIncome ? '+' : '-'}{formatCurrency(amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {selectedView === 'expense' && monthlyReport && monthlyReport.categoryBreakdown.length > 0 && (
          <View style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.sectionTitle}>Danh mục con</Text>
              <Text style={styles.categoryHeaderRight}>Danh mục cha</Text>
            </View>
            {monthlyReport.categoryBreakdown
              .filter(b => b.expense > 0)
              .map((breakdown) => (
              <View key={breakdown.category.id} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: breakdown.category.color + '20' }]}>
                    <Ionicons name={breakdown.category.icon as any} size={18} color={breakdown.category.color} />
                  </View>
                  <Text style={styles.categoryName}>{breakdown.category.name}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryAmount}>{formatCurrency(breakdown.expense)}</Text>
                  <View style={styles.categoryBadge}>
                    <Ionicons name="trending-up" size={12} color={Colors.error} />
                    <Text style={styles.categoryBadgeText}>
                      {formatCurrency(breakdown.expense * 0.1)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedView === 'income' && monthlyReport && monthlyReport.categoryBreakdown.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Danh mục thu nhập</Text>
            {monthlyReport.categoryBreakdown
              .filter(b => b.income > 0)
              .map((breakdown) => (
              <View key={breakdown.category.id} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: breakdown.category.color + '20' }]}>
                    <Ionicons name={breakdown.category.icon as any} size={18} color={breakdown.category.color} />
                  </View>
                  <Text style={styles.categoryName}>{breakdown.category.name}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={[styles.categoryAmount, { color: Colors.success }]}>
                    {formatCurrency(breakdown.income)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    flex: 1,
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Layout.spacing.md,
    paddingTop: Layout.spacing.md,
  },
  periodTab: {
    flex: 1,
    paddingVertical: Layout.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  periodTabActive: {
    borderBottomColor: '#E91E63',
  },
  periodTabText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  periodTabTextActive: {
    color: '#E91E63',
    fontWeight: '600',
  },
  viewTypeContainer: {
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    gap: Layout.spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  viewTypeButton: {
    flex: 1,
    paddingVertical: Layout.spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  viewTypeButtonActive: {
    backgroundColor: '#E91E63',
  },
  viewTypeText: {
    fontSize: 14,
    color: Colors.text,
  },
  viewTypeTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: Layout.spacing.md,
    padding: Layout.spacing.lg,
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  comparisonText: {
    fontSize: 12,
    flex: 1,
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    margin: Layout.spacing.md,
    marginTop: 0,
    padding: Layout.spacing.md,
    borderRadius: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  comparisonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comparisonToggleText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#4CD964',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  transactionSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: Colors.background,
  },
  transactionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  transactionDay: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  transactionHeaderRight: {
    alignItems: 'flex-end',
  },
  transactionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  transactionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categorySection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderRadius: 12,
    padding: Layout.spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryHeaderRight: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  categoryIconText: {
    fontSize: 18,
  },
  categoryName: {
    fontSize: 14,
    color: Colors.text,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: Colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Layout.spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.lg,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: Layout.spacing.sm,
  },
  exportOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  exportOptionText: {
    flex: 1,
  },
  exportOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  exportOptionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalCancelButton: {
    marginTop: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#FFFFFF',
    padding: Layout.spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    fontSize: 16,
    color: Colors.text,
  },
});
