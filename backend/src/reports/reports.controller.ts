import { Controller, Get, Post, UseGuards, Request, Query, Param, Body, Res } from '@nestjs/common';
import { Response } from 'express';
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

  @Post('export/pdf')
  async exportPDF(
    @Request() req,
    @Body() body: { startDate?: string; endDate?: string },
    @Res() res: Response,
  ) {
    const currentDate = new Date();
    const startDate = body.startDate ? new Date(body.startDate) : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = body.endDate ? new Date(body.endDate) : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const buffer = await this.reportsService.exportPDF(req.user.userId, startDate, endDate);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${Date.now()}.pdf`);
    res.send(buffer);
  }

  @Post('export/excel')
  async exportExcel(
    @Request() req,
    @Body() body: { startDate?: string; endDate?: string },
    @Res() res: Response,
  ) {
    const currentDate = new Date();
    const startDate = body.startDate ? new Date(body.startDate) : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = body.endDate ? new Date(body.endDate) : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const buffer = await this.reportsService.exportExcel(req.user.userId, startDate, endDate);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report-${Date.now()}.xlsx`);
    res.send(buffer);
  }
}
