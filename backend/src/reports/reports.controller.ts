import { Controller, Get, UseGuards, Request, Query, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  getMonthlyReport(
    @Request() req,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const currentDate = new Date();
    const yearNum = year ? parseInt(year) : currentDate.getFullYear();
    const monthNum = month ? parseInt(month) : currentDate.getMonth() + 1;

    return this.reportsService.getMonthlyReport(req.user.userId, yearNum, monthNum);
  }

  @Get('category/:categoryId')
  getCategoryReport(
    @Request() req,
    @Param('categoryId') categoryId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getCategoryReport(
      req.user.userId,
      categoryId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('trend')
  getTrendReport(@Request() req, @Query('months') months?: string) {
    const monthsNum = months ? parseInt(months) : 6;
    return this.reportsService.getTrendReport(req.user.userId, monthsNum);
  }

  @Get('budget')
  getBudgetReport(@Request() req) {
    return this.reportsService.getBudgetReport(req.user.userId);
  }
}
