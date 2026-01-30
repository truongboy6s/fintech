import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: { name?: string; email?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getStats(userId: string) {
    const [transactionCount, categoryCount, budgetCount] = await Promise.all([
      this.prisma.transaction.count({ where: { userId } }),
      this.prisma.category.count({ where: { userId } }),
      this.prisma.budget.count({ where: { userId } }),
    ]);

    return {
      transactionCount,
      categoryCount,
      budgetCount,
    };
  }
}
