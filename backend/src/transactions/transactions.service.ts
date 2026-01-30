import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    // Kiểm tra category có thuộc về user không
    const category = await this.prisma.category.findFirst({
      where: { id: createTransactionDto.categoryId, userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        date: new Date(createTransactionDto.date),
        userId,
      },
      include: {
        category: true,
      },
    });

    // Cập nhật spent cho budget liên quan (nếu có)
    if (createTransactionDto.type === 'EXPENSE') {
      await this.updateBudgetSpent(userId, createTransactionDto.categoryId);
    }

    return transaction;
  }

  async findAll(userId: string, filters?: {
    type?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  }) {
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

    return this.prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(id: string, userId: string, updateTransactionDto: UpdateTransactionDto) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (updateTransactionDto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: updateTransactionDto.categoryId, userId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...updateTransactionDto,
        ...(updateTransactionDto.date && { date: new Date(updateTransactionDto.date) }),
      },
      include: {
        category: true,
      },
    });

    // Cập nhật budget nếu là expense
    if (transaction.type === 'EXPENSE' || updateTransactionDto.type === 'EXPENSE') {
      await this.updateBudgetSpent(userId, transaction.categoryId);
      if (updateTransactionDto.categoryId && updateTransactionDto.categoryId !== transaction.categoryId) {
        await this.updateBudgetSpent(userId, updateTransactionDto.categoryId);
      }
    }

    return updated;
  }

  async remove(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    await this.prisma.transaction.delete({
      where: { id },
    });

    // Cập nhật budget sau khi xóa
    if (transaction.type === 'EXPENSE') {
      await this.updateBudgetSpent(userId, transaction.categoryId);
    }

    return { message: 'Transaction deleted successfully' };
  }

  async getStats(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [income, expense, transactions] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalIncome: income._sum.amount || 0,
      totalExpense: expense._sum.amount || 0,
      balance: (income._sum.amount || 0) - (expense._sum.amount || 0),
      recentTransactions: transactions,
    };
  }

  private async updateBudgetSpent(userId: string, categoryId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId, categoryId },
    });

    for (const budget of budgets) {
      const result = await this.prisma.transaction.aggregate({
        where: {
          userId,
          categoryId,
          type: 'EXPENSE',
          date: {
            gte: budget.startDate,
            lte: budget.endDate,
          },
        },
        _sum: { amount: true },
      });

      await this.prisma.budget.update({
        where: { id: budget.id },
        data: { spent: result._sum.amount || 0 },
      });
    }
  }
}
