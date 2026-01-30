import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBudgetDto: CreateBudgetDto) {
    // Kiểm tra category có thuộc về user không
    const category = await this.prisma.category.findFirst({
      where: { id: createBudgetDto.categoryId, userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.budget.create({
      data: {
        ...createBudgetDto,
        startDate: new Date(createBudgetDto.startDate),
        endDate: new Date(createBudgetDto.endDate),
        userId,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Tính toán spent cho mỗi budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await this.calculateSpent(budget.id, userId);
        return {
          ...budget,
          spent,
          remaining: budget.amount - spent,
          percentage: (spent / budget.amount) * 100,
        };
      }),
    );

    return budgetsWithSpent;
  }

  async findOne(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: {
        category: true,
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const spent = await this.calculateSpent(id, userId);

    return {
      ...budget,
      spent,
      remaining: budget.amount - spent,
      percentage: (spent / budget.amount) * 100,
    };
  }

  async update(id: string, userId: string, updateBudgetDto: UpdateBudgetDto) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    if (updateBudgetDto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: updateBudgetDto.categoryId, userId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.prisma.budget.update({
      where: { id },
      data: {
        ...updateBudgetDto,
        ...(updateBudgetDto.startDate && { startDate: new Date(updateBudgetDto.startDate) }),
        ...(updateBudgetDto.endDate && { endDate: new Date(updateBudgetDto.endDate) }),
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    return this.prisma.budget.delete({
      where: { id },
    });
  }

  private async calculateSpent(budgetId: string, userId: string): Promise<number> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) return 0;

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
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }
}
