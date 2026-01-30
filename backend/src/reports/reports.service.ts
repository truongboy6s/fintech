import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // Báo cáo tổng quan theo tháng
  async getMonthlyReport(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [income, expense, transactions, categoryBreakdown] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        include: { category: true },
        orderBy: { date: 'desc' },
      }),
      this.getCategoryBreakdown(userId, startDate, endDate),
    ]);

    return {
      period: { year, month, startDate, endDate },
      summary: {
        totalIncome: income._sum.amount || 0,
        totalExpense: expense._sum.amount || 0,
        balance: (income._sum.amount || 0) - (expense._sum.amount || 0),
        transactionCount: transactions.length,
      },
      categoryBreakdown,
      transactions,
    };
  }

  // Báo cáo theo category
  async getCategoryReport(userId: string, categoryId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId, categoryId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [transactions, income, expense, category] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      this.prisma.category.findUnique({
        where: { id: categoryId },
        include: { budgets: true },
      }),
    ]);

    return {
      category,
      summary: {
        totalIncome: income._sum.amount || 0,
        totalExpense: expense._sum.amount || 0,
        transactionCount: transactions.length,
      },
      transactions,
    };
  }

  // Báo cáo xu hướng theo thời gian
  async getTrendReport(userId: string, months: number = 6) {
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const [income, expense] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: 'INCOME',
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: 'EXPENSE',
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        }),
      ]);

      trends.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        income: income._sum.amount || 0,
        expense: expense._sum.amount || 0,
        balance: (income._sum.amount || 0) - (expense._sum.amount || 0),
      });
    }

    return trends;
  }

  // Báo cáo so sánh budget vs thực tế
  async getBudgetReport(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    const budgetReports = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await this.prisma.transaction.aggregate({
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

        const spentAmount = spent._sum.amount || 0;
        const remaining = budget.amount - spentAmount;
        const percentage = (spentAmount / budget.amount) * 100;

        return {
          budget,
          spent: spentAmount,
          remaining,
          percentage,
          status:
            percentage >= 100
              ? 'exceeded'
              : percentage >= (budget.alertThreshold || 80)
              ? 'warning'
              : 'good',
        };
      }),
    );

    return budgetReports;
  }

  // Breakdown theo category
  private async getCategoryBreakdown(userId: string, startDate: Date, endDate: Date) {
    const categories = await this.prisma.category.findMany({
      where: { userId },
    });

    const breakdown = await Promise.all(
      categories.map(async (category) => {
        const [income, expense] = await Promise.all([
          this.prisma.transaction.aggregate({
            where: {
              userId,
              categoryId: category.id,
              type: 'INCOME',
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
            _count: true,
          }),
          this.prisma.transaction.aggregate({
            where: {
              userId,
              categoryId: category.id,
              type: 'EXPENSE',
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
            _count: true,
          }),
        ]);

        return {
          category,
          income: income._sum.amount || 0,
          expense: expense._sum.amount || 0,
          transactionCount: income._count + expense._count,
        };
      }),
    );

    return breakdown.filter((item) => item.transactionCount > 0);
  }
}
