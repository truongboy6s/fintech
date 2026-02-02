import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';

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

  // Export PDF
  async exportPDF(userId: string, startDate: Date, endDate: Date): Promise<Buffer> {
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
        take: 50,
      }),
      this.getCategoryBreakdown(userId, startDate, endDate),
    ]);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Title
        doc.fontSize(20).text('Bao cao tai chinh', { align: 'center' });
        doc.moveDown();

        // Period
        doc.fontSize(12).text(`Tu ngay: ${startDate.toLocaleDateString('vi-VN')}`);
        doc.text(`Den ngay: ${endDate.toLocaleDateString('vi-VN')}`);
        doc.moveDown();

        // Summary
        doc.fontSize(16).text('Tong quan', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.text(`Thu nhap: ${(income._sum.amount || 0).toLocaleString('vi-VN')} VND`);
        doc.text(`Chi tieu: ${(expense._sum.amount || 0).toLocaleString('vi-VN')} VND`);
        doc.text(`Can doi: ${((income._sum.amount || 0) - (expense._sum.amount || 0)).toLocaleString('vi-VN')} VND`);
        doc.moveDown();

        // Category Breakdown
        if (categoryBreakdown.length > 0) {
          doc.fontSize(16).text('Phan tich theo danh muc', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10);
          
          categoryBreakdown.forEach((item) => {
            doc.text(`${item.category.name}: ${item.expense.toLocaleString('vi-VN')} VND`);
          });
          doc.moveDown();
        }

        // Transactions
        if (transactions.length > 0) {
          doc.fontSize(16).text('Giao dich gan day', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(9);
          
          transactions.slice(0, 20).forEach((txn) => {
            const date = new Date(txn.date).toLocaleDateString('vi-VN');
            const type = txn.type === 'INCOME' ? 'Thu' : 'Chi';
            doc.text(`${date} - ${type} - ${txn.category.name}: ${txn.amount.toLocaleString('vi-VN')} VND`);
          });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Export Excel
  async exportExcel(userId: string, startDate: Date, endDate: Date): Promise<Buffer> {
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

    const workbook = new ExcelJS.Workbook();
    
    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Tong quan');
    summarySheet.columns = [
      { header: 'Muc', key: 'label', width: 30 },
      { header: 'Gia tri', key: 'value', width: 20 },
    ];
    
    summarySheet.addRows([
      { label: 'Thoi gian', value: `${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}` },
      { label: 'Thu nhap', value: income._sum.amount || 0 },
      { label: 'Chi tieu', value: expense._sum.amount || 0 },
      { label: 'Can doi', value: (income._sum.amount || 0) - (expense._sum.amount || 0) },
    ]);

    // Category Sheet
    const categorySheet = workbook.addWorksheet('Danh muc');
    categorySheet.columns = [
      { header: 'Danh muc', key: 'name', width: 30 },
      { header: 'Thu nhap', key: 'income', width: 15 },
      { header: 'Chi tieu', key: 'expense', width: 15 },
      { header: 'So giao dich', key: 'count', width: 15 },
    ];
    
    categorySheet.addRows(
      categoryBreakdown.map((item) => ({
        name: item.category.name,
        income: item.income,
        expense: item.expense,
        count: item.transactionCount,
      })),
    );

    // Transactions Sheet
    const transactionSheet = workbook.addWorksheet('Giao dich');
    transactionSheet.columns = [
      { header: 'Ngay', key: 'date', width: 15 },
      { header: 'Loai', key: 'type', width: 10 },
      { header: 'Danh muc', key: 'category', width: 20 },
      { header: 'So tien', key: 'amount', width: 15 },
      { header: 'Ghi chu', key: 'description', width: 30 },
    ];
    
    transactionSheet.addRows(
      transactions.map((txn) => ({
        date: new Date(txn.date).toLocaleDateString('vi-VN'),
        type: txn.type === 'INCOME' ? 'Thu nhap' : 'Chi tieu',
        category: txn.category.name,
        amount: txn.amount,
        description: txn.description || '',
      })),
    );

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }
}
