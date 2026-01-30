import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportTransactions(
    userId: string,
    format: 'json' | 'csv',
    filters?: {
      startDate?: string;
      endDate?: string;
      type?: string;
      categoryId?: string;
    },
  ) {
    const where: any = { userId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    if (format === 'json') {
      return {
        format: 'json',
        data: transactions,
        count: transactions.length,
      };
    }

    // CSV format
    const csv = this.convertToCSV(transactions);
    return {
      format: 'csv',
      data: csv,
      count: transactions.length,
    };
  }

  async exportBudgets(userId: string, format: 'json' | 'csv') {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // Tính spent cho mỗi budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const result = await this.prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: 'EXPENSE',
            date: {
              gte: budget.startDate,
              lte: budget.endDate,
            },
          },
          _sum: { amount: true },
        });

        return {
          ...budget,
          spent: result._sum.amount || 0,
          remaining: budget.amount - (result._sum.amount || 0),
        };
      }),
    );

    if (format === 'json') {
      return {
        format: 'json',
        data: budgetsWithSpent,
        count: budgetsWithSpent.length,
      };
    }

    // CSV format
    const csv = this.convertBudgetsToCSV(budgetsWithSpent);
    return {
      format: 'csv',
      data: csv,
      count: budgetsWithSpent.length,
    };
  }

  async exportCategories(userId: string, format: 'json' | 'csv') {
    const categories = await this.prisma.category.findMany({
      where: { userId },
      include: {
        parent: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });

    if (format === 'json') {
      return {
        format: 'json',
        data: categories,
        count: categories.length,
      };
    }

    // CSV format
    const csv = this.convertCategoriesToCSV(categories);
    return {
      format: 'csv',
      data: csv,
      count: categories.length,
    };
  }

  async exportFullData(userId: string) {
    const [user, transactions, budgets, categories] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      }),
      this.prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
      }),
      this.prisma.budget.findMany({
        where: { userId },
        include: { category: true },
      }),
      this.prisma.category.findMany({
        where: { userId },
        include: { parent: true },
      }),
    ]);

    return {
      exportDate: new Date(),
      user,
      data: {
        transactions,
        budgets,
        categories,
      },
      stats: {
        transactionCount: transactions.length,
        budgetCount: budgets.length,
        categoryCount: categories.length,
      },
    };
  }

  private convertToCSV(transactions: any[]): string {
    const headers = [
      'ID',
      'Date',
      'Type',
      'Category',
      'Amount',
      'Description',
      'Created At',
    ];
    const rows = transactions.map((t) => [
      t.id,
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category.name,
      t.amount,
      t.description || '',
      new Date(t.createdAt).toLocaleDateString(),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  private convertBudgetsToCSV(budgets: any[]): string {
    const headers = [
      'ID',
      'Name',
      'Category',
      'Amount',
      'Spent',
      'Remaining',
      'Period',
      'Start Date',
      'End Date',
    ];
    const rows = budgets.map((b) => [
      b.id,
      b.name,
      b.category.name,
      b.amount,
      b.spent,
      b.remaining,
      b.period,
      new Date(b.startDate).toLocaleDateString(),
      new Date(b.endDate).toLocaleDateString(),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  private convertCategoriesToCSV(categories: any[]): string {
    const headers = [
      'ID',
      'Name',
      'Type',
      'Parent',
      'Icon',
      'Color',
      'Transaction Count',
      'Budget Count',
    ];
    const rows = categories.map((c) => [
      c.id,
      c.name,
      c.type,
      c.parent?.name || '',
      c.icon || '',
      c.color || '',
      c._count.transactions,
      c._count.budgets,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
}
