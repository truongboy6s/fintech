import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    // Kiểm tra parent category nếu có
    if (createCategoryDto.parentId) {
      const parent = await this.prisma.category.findFirst({
        where: { id: createCategoryDto.parentId, userId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      // Kiểm tra type có match với parent không
      if (parent.type !== createCategoryDto.type) {
        throw new BadRequestException('Category type must match parent type');
      }
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll(userId: string, type?: string) {
    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    return this.prisma.category.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
      include: {
        parent: true,
        children: true,
        transactions: {
          take: 10,
          orderBy: { date: 'desc' },
        },
        budgets: true,
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Tính tổng spent
    const totalSpent = await this.prisma.transaction.aggregate({
      where: {
        categoryId: id,
        userId,
        type: 'EXPENSE',
      },
      _sum: { amount: true },
    });

    return {
      ...category,
      totalSpent: totalSpent._sum.amount || 0,
    };
  }

  async update(id: string, userId: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.parentId) {
      // Không cho phép set parent là chính nó
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parent = await this.prisma.category.findFirst({
        where: { id: updateCategoryDto.parentId, userId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      // Kiểm tra type
      const type = updateCategoryDto.type || category.type;
      if (parent.type !== type) {
        throw new BadRequestException('Category type must match parent type');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
      include: {
        children: true,
        transactions: true,
        budgets: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Kiểm tra có children không
    if (category.children.length > 0) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    // Kiểm tra có transactions không
    if (category.transactions.length > 0) {
      throw new BadRequestException('Cannot delete category with transactions');
    }

    // Kiểm tra có budgets không
    if (category.budgets.length > 0) {
      throw new BadRequestException('Cannot delete category with budgets');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
