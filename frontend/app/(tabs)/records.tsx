import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Card } from '@/components/ui';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTransactions } from '@/store/slices/transaction.slice';

export default function RecordsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { list: transactions, loading } = useAppSelector((state) => state.transactions);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchTransactions());
    }, [dispatch])
  );

  const groupTransactionsByDate = () => {
    const grouped: { [key: string]: typeof transactions } = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('vi-VN');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(t);
    });
    
    return Object.entries(grouped).sort((a, b) => 
      new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime()
    );
  };

  const groupedTransactions = groupTransactionsByDate();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ghi chép</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/add-income')}
          >
            <Ionicons name="arrow-down-circle" size={24} color={Colors.income} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/add-expense')}
          >
            <Ionicons name="arrow-up-circle" size={24} color={Colors.expense} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Đang tải...</Text>
            </View>
          </Card>
        ) : transactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Chưa có giao dịch</Text>
              <Text style={styles.emptyText}>
                Bắt đầu thêm thu nhập hoặc chi tiêu của bạn
              </Text>
            </View>
          </Card>
        ) : (
          groupedTransactions.map(([date, items]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              <Card style={styles.transactionsCard}>
                {items.map((transaction, index) => (
                  <TouchableOpacity
                    key={transaction.id}
                    style={[
                      styles.transactionItem,
                      index !== items.length - 1 && styles.transactionItemBorder
                    ]}
                  >
                    <View style={styles.transactionLeft}>
                      <View style={[
                        styles.transactionIcon,
                        { backgroundColor: transaction.category?.color || Colors.primary }
                      ]}>
                        <Ionicons 
                          name={(transaction.category?.icon || 'wallet') as any} 
                          size={20} 
                          color={Colors.textLight} 
                        />
                      </View>
                      <View>
                        <Text style={styles.transactionCategory}>
                          {transaction.category?.name || 'Không có danh mục'}
                        </Text>
                        {transaction.description && (
                          <Text style={styles.transactionNote} numberOfLines={1}>
                            {transaction.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      { color: transaction.type === 'INCOME' ? Colors.income : Colors.expense }
                    ]}>
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
          ))
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
  headerButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  addButton: {
    padding: Layout.spacing.sm,
  },
  dateGroup: {
    marginTop: Layout.spacing.md,
  },
  dateHeader: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
  },
  transactionsCard: {
    marginHorizontal: Layout.spacing.lg,
    padding: 0,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.md,
  },
  transactionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  transactionCategory: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  transactionNote: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: Layout.fontSize.md,
    fontWeight: 'bold',
  },
  emptyCard: {
    margin: Layout.spacing.lg,
    minHeight: 300,
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
    textAlign: 'center',
  },
});
