import { Controller, Get, UseGuards, Request, Query, Header } from '@nestjs/common';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('transactions')
  exportTransactions(
    @Request() req,
    @Query('format') format: 'json' | 'csv' = 'json',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.exportService.exportTransactions(req.user.userId, format, {
      startDate,
      endDate,
      type,
      categoryId,
    });
  }

  @Get('budgets')
  exportBudgets(
    @Request() req,
    @Query('format') format: 'json' | 'csv' = 'json',
  ) {
    return this.exportService.exportBudgets(req.user.userId, format);
  }

  @Get('categories')
  exportCategories(
    @Request() req,
    @Query('format') format: 'json' | 'csv' = 'json',
  ) {
    return this.exportService.exportCategories(req.user.userId, format);
  }

  @Get('full')
  @Header('Content-Type', 'application/json')
  exportFullData(@Request() req) {
    return this.exportService.exportFullData(req.user.userId);
  }
}
