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

  // Báo cáo xu hướng theo tuần (7 ngày từ Thứ 2 - Chủ Nhật)
  async getWeeklyTrendReport(userId: string) {
    const trends = [];
    const now = new Date();
    
    // Tìm ngày thứ 2 của tuần hiện tại
    const currentDay = now.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Nếu CN thì lùi 6 ngày
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysFromMonday);
    monday.setHours(0, 0, 0, 0);

    // Lấy dữ liệu cho 7 ngày (T2 -> CN)
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      
      const startDate = new Date(dayDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(dayDate);
      endDate.setHours(23, 59, 59, 999);

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

      // dayOfWeek: 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7, 7=CN
      const dayOfWeek = i + 1; // i = 0-6, dayOfWeek = 1-7
      
      trends.push({
        dayOfWeek: dayOfWeek,
        date: dayDate.toISOString().split('T')[0],
        income: income._sum.amount || 0,
        expense: expense._sum.amount || 0,
        balance: (income._sum.amount || 0) - (expense._sum.amount || 0),
      });
    }

    // Sắp xếp theo thứ tự ngày để đảm bảo T2->CN
    return trends.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }

  // Báo cáo xu hướng theo năm (5 năm gần nhất)
  async getYearlyTrendReport(userId: string, years: number = 5) {
    const trends = [];
    const now = new Date();

    for (let i = years - 1; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);

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
        year,
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
    const [income, expense, transactions, categoryBreakdown, user] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
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
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      }),
    ]);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margin: 50,
          size: 'A4',
          info: {
            Title: 'Bao cao tai chinh',
            Author: user?.name || 'User',
          }
        });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const pageWidth = doc.page.width - 100;
        const primaryColor = '#3B82F6';
        const successColor = '#10B981';
        const dangerColor = '#EF4444';
        const lightGray = '#F3F4F6';
        const darkGray = '#6B7280';
        
        let pageNumber = 1;
        
        // Helper function to add page footer
        const addFooter = () => {
          const bottomY = doc.page.height - 50;
          doc.fontSize(8)
             .fillColor(darkGray)
             .text(
               `Trang ${pageNumber} | Tao boi ${user?.name || 'User'} | ${new Date().toLocaleDateString('vi-VN')}`,
               50,
               bottomY,
               { align: 'center', width: pageWidth }
             );
          pageNumber++;
        };

        // Header with background
        doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);
        doc.fontSize(28)
           .fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .text('BAO CAO TAI CHINH', 50, 40, { align: 'center' });
        
        doc.fontSize(11)
           .fillColor('#FFFFFF')
           .font('Helvetica')
           .text(`Chu tai khoan: ${user?.name || 'User'}`, 50, 75, { align: 'center' });
        
        doc.fontSize(10)
           .fillColor('#E5E7EB')
           .text(
             `Tu ${startDate.toLocaleDateString('vi-VN')} den ${endDate.toLocaleDateString('vi-VN')}`,
             50,
             92,
             { align: 'center' }
           );

        doc.moveDown(4);

        // Summary Section with cards
        const balance = (income._sum.amount || 0) - (expense._sum.amount || 0);
        const startY = 150;
        const cardWidth = (pageWidth - 30) / 3;
        const cardHeight = 100;

        // Income Card
        doc.roundedRect(50, startY, cardWidth, cardHeight, 8)
           .fillAndStroke(successColor, successColor);
        doc.fontSize(11).fillColor('#FFFFFF').text('THU NHAP', 60, startY + 15);
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text(
             `${(income._sum.amount || 0).toLocaleString('vi-VN')}`,
             60,
             startY + 40,
             { width: cardWidth - 20 }
           );
        doc.fontSize(9).font('Helvetica').text('VND', 60, startY + 68);
        doc.fontSize(8).text(`${income._count || 0} giao dich`, 60, startY + 82);

        // Expense Card
        doc.roundedRect(50 + cardWidth + 15, startY, cardWidth, cardHeight, 8)
           .fillAndStroke(dangerColor, dangerColor);
        doc.fontSize(11).fillColor('#FFFFFF').text('CHI TIEU', 60 + cardWidth + 15, startY + 15);
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text(
             `${(expense._sum.amount || 0).toLocaleString('vi-VN')}`,
             60 + cardWidth + 15,
             startY + 40,
             { width: cardWidth - 20 }
           );
        doc.fontSize(9).font('Helvetica').text('VND', 60 + cardWidth + 15, startY + 68);
        doc.fontSize(8).text(`${expense._count || 0} giao dich`, 60 + cardWidth + 15, startY + 82);

        // Balance Card
        const balanceColor = balance >= 0 ? '#059669' : '#DC2626';
        doc.roundedRect(50 + (cardWidth + 15) * 2, startY, cardWidth, cardHeight, 8)
           .fillAndStroke(balanceColor, balanceColor);
        doc.fontSize(11).fillColor('#FFFFFF').text('SO DU', 60 + (cardWidth + 15) * 2, startY + 15);
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text(
             `${balance.toLocaleString('vi-VN')}`,
             60 + (cardWidth + 15) * 2,
             startY + 40,
             { width: cardWidth - 20 }
           );
        doc.fontSize(9).font('Helvetica').text('VND', 60 + (cardWidth + 15) * 2, startY + 68);
        const savingsRate = income._sum.amount ? ((balance / income._sum.amount) * 100).toFixed(1) : '0';
        doc.fontSize(8).text(`Ti le tiet kiem: ${savingsRate}%`, 60 + (cardWidth + 15) * 2, startY + 82);

        doc.y = startY + cardHeight + 30;

        // Category Breakdown Section
        if (categoryBreakdown.length > 0) {
          doc.fontSize(16)
             .fillColor('#1F2937')
             .font('Helvetica-Bold')
             .text('PHAN TICH THEO DANH MUC', 50, doc.y);
          doc.moveDown(1);

          // Table header
          const tableTop = doc.y + 10;
          const colWidths = [pageWidth * 0.35, pageWidth * 0.2, pageWidth * 0.2, pageWidth * 0.25];
          
          doc.rect(50, tableTop, pageWidth, 30).fill(lightGray);
          doc.fontSize(10)
             .fillColor('#374151')
             .font('Helvetica-Bold')
             .text('Danh muc', 60, tableTop + 10, { width: colWidths[0] })
             .text('Thu nhap', 60 + colWidths[0], tableTop + 10, { width: colWidths[1] })
             .text('Chi tieu', 60 + colWidths[0] + colWidths[1], tableTop + 10, { width: colWidths[2] })
             .text('So giao dich', 60 + colWidths[0] + colWidths[1] + colWidths[2], tableTop + 10, { width: colWidths[3] });

          let currentY = tableTop + 40;
          
          // Sort by expense (highest first)
          const sortedCategories = [...categoryBreakdown].sort((a, b) => b.expense - a.expense);
          
          sortedCategories.forEach((item, index) => {
            if (currentY > doc.page.height - 150) {
              addFooter();
              doc.addPage();
              currentY = 80;
            }

            const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
            doc.rect(50, currentY - 5, pageWidth, 25).fill(bgColor);
            
            doc.fontSize(9)
               .fillColor('#1F2937')
               .font('Helvetica')
               .text(item.category.name, 60, currentY, { width: colWidths[0] });
            
            doc.fillColor(successColor)
               .text(`${item.income.toLocaleString('vi-VN')}`, 60 + colWidths[0], currentY, { width: colWidths[1] });
            
            doc.fillColor(dangerColor)
               .text(`${item.expense.toLocaleString('vi-VN')}`, 60 + colWidths[0] + colWidths[1], currentY, { width: colWidths[2] });
            
            doc.fillColor(darkGray)
               .text(`${item.transactionCount}`, 60 + colWidths[0] + colWidths[1] + colWidths[2], currentY, { width: colWidths[3], align: 'center' });
            
            currentY += 25;
          });

          doc.y = currentY + 20;
        }

        // Transactions Section
        if (transactions.length > 0) {
          if (doc.y > doc.page.height - 200) {
            addFooter();
            doc.addPage();
            doc.y = 80;
          }

          doc.fontSize(16)
             .fillColor('#1F2937')
             .font('Helvetica-Bold')
             .text('CHI TIET GIAO DICH', 50, doc.y);
          doc.moveDown(0.5);
          
          doc.fontSize(9)
             .fillColor(darkGray)
             .font('Helvetica')
             .text(`Hien thi ${Math.min(transactions.length, 50)} giao dich gan nhat`, 50, doc.y);
          doc.moveDown(1);

          const tableTop = doc.y + 10;
          const colWidths2 = [pageWidth * 0.15, pageWidth * 0.12, pageWidth * 0.25, pageWidth * 0.18, pageWidth * 0.3];
          
          doc.rect(50, tableTop, pageWidth, 30).fill(lightGray);
          doc.fontSize(9)
             .fillColor('#374151')
             .font('Helvetica-Bold')
             .text('Ngay', 60, tableTop + 10, { width: colWidths2[0] })
             .text('Loai', 60 + colWidths2[0], tableTop + 10, { width: colWidths2[1] })
             .text('Danh muc', 60 + colWidths2[0] + colWidths2[1], tableTop + 10, { width: colWidths2[2] })
             .text('So tien', 60 + colWidths2[0] + colWidths2[1] + colWidths2[2], tableTop + 10, { width: colWidths2[3] })
             .text('Ghi chu', 60 + colWidths2[0] + colWidths2[1] + colWidths2[2] + colWidths2[3], tableTop + 10, { width: colWidths2[4] });

          let currentY = tableTop + 40;
          
          transactions.slice(0, 50).forEach((txn, index) => {
            if (currentY > doc.page.height - 100) {
              addFooter();
              doc.addPage();
              currentY = 80;
            }

            const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
            doc.rect(50, currentY - 5, pageWidth, 22).fill(bgColor);
            
            const date = new Date(txn.date).toLocaleDateString('vi-VN');
            const type = txn.type === 'INCOME' ? 'Thu' : 'Chi';
            const typeColor = txn.type === 'INCOME' ? successColor : dangerColor;
            
            doc.fontSize(8)
               .fillColor('#1F2937')
               .font('Helvetica')
               .text(date, 60, currentY, { width: colWidths2[0] });
            
            doc.fillColor(typeColor)
               .font('Helvetica-Bold')
               .text(type, 60 + colWidths2[0], currentY, { width: colWidths2[1] });
            
            doc.fillColor('#1F2937')
               .font('Helvetica')
               .text(txn.category.name, 60 + colWidths2[0] + colWidths2[1], currentY, { width: colWidths2[2], ellipsis: true });
            
            doc.fillColor(typeColor)
               .font('Helvetica-Bold')
               .text(txn.amount.toLocaleString('vi-VN'), 60 + colWidths2[0] + colWidths2[1] + colWidths2[2], currentY, { width: colWidths2[3] });
            
            doc.fillColor(darkGray)
               .font('Helvetica')
               .fontSize(7)
               .text(txn.description || '-', 60 + colWidths2[0] + colWidths2[1] + colWidths2[2] + colWidths2[3], currentY, { width: colWidths2[4], ellipsis: true });
            
            currentY += 22;
          });
        }

        // Final footer
        addFooter();
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Export Excel
  async exportExcel(userId: string, startDate: Date, endDate: Date): Promise<Buffer> {
    const [income, expense, transactions, categoryBreakdown, user] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
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
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      }),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = user?.name || 'User';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    const balance = (income._sum.amount || 0) - (expense._sum.amount || 0);
    const savingsRate = income._sum.amount ? ((balance / income._sum.amount) * 100).toFixed(1) : '0';

    // ========== Summary Sheet ==========
    const summarySheet = workbook.addWorksheet('Tong quan', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    });
    
    // Title
    summarySheet.mergeCells('A1:E1');
    summarySheet.getCell('A1').value = 'BAO CAO TAI CHINH';
    summarySheet.getCell('A1').font = { size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
    summarySheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    summarySheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' },
    };
    summarySheet.getRow(1).height = 40;

    // Period info
    summarySheet.mergeCells('A2:E2');
    summarySheet.getCell('A2').value = `Ky bao cao: ${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}`;
    summarySheet.getCell('A2').font = { size: 11, color: { argb: 'FF6B7280' } };
    summarySheet.getCell('A2').alignment = { horizontal: 'center' };
    summarySheet.getRow(2).height = 25;

    // User info
    summarySheet.mergeCells('A3:E3');
    summarySheet.getCell('A3').value = `Chu tai khoan: ${user?.name || 'User'} (${user?.email || ''})`;
    summarySheet.getCell('A3').font = { size: 10, color: { argb: 'FF6B7280' } };
    summarySheet.getCell('A3').alignment = { horizontal: 'center' };
    summarySheet.getRow(3).height = 20;

    // Summary Cards
    summarySheet.getCell('A5').value = 'CHI TIEU CHINH';
    summarySheet.getCell('A5').font = { size: 12, bold: true };
    summarySheet.getCell('A5').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    };

    const summaryData = [
      ['Thu nhap', income._sum.amount || 0, `${income._count || 0} giao dich`],
      ['Chi tieu', expense._sum.amount || 0, `${expense._count || 0} giao dich`],
      ['So du', balance, `Ti le tiet kiem: ${savingsRate}%`],
      ['Tong giao dich', income._count + expense._count, ''],
    ];

    summaryData.forEach((row, index) => {
      const rowNum = 6 + index;
      summarySheet.getCell(`A${rowNum}`).value = row[0];
      summarySheet.getCell(`B${rowNum}`).value = row[1];
      summarySheet.getCell(`C${rowNum}`).value = row[2];
      
      summarySheet.getCell(`A${rowNum}`).font = { bold: true };
      summarySheet.getCell(`B${rowNum}`).numFmt = '#,##0 "VND"';
      summarySheet.getCell(`B${rowNum}`).font = { size: 12, bold: true };
      
      // Color coding
      if (row[0] === 'Thu nhap') {
        summarySheet.getCell(`B${rowNum}`).font = { ...summarySheet.getCell(`B${rowNum}`).font, color: { argb: 'FF10B981' } };
      } else if (row[0] === 'Chi tieu') {
        summarySheet.getCell(`B${rowNum}`).font = { ...summarySheet.getCell(`B${rowNum}`).font, color: { argb: 'FFEF4444' } };
      } else if (row[0] === 'So du') {
        const color = balance >= 0 ? 'FF059669' : 'FFDC2626';
        summarySheet.getCell(`B${rowNum}`).font = { ...summarySheet.getCell(`B${rowNum}`).font, color: { argb: color } };
        summarySheet.getCell(`A${rowNum}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: balance >= 0 ? 'FFD1FAE5' : 'FFFECACA' },
        };
        summarySheet.getCell(`B${rowNum}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: balance >= 0 ? 'FFD1FAE5' : 'FFFECACA' },
        };
      }
      
      summarySheet.getCell(`C${rowNum}`).font = { size: 9, color: { argb: 'FF6B7280' } };
    });

    summarySheet.getColumn('A').width = 25;
    summarySheet.getColumn('B').width = 20;
    summarySheet.getColumn('C').width = 30;

    // ========== Category Sheet ==========
    const categorySheet = workbook.addWorksheet('Danh muc', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    });
    
    categorySheet.columns = [
      { header: 'Danh muc', key: 'name', width: 30 },
      { header: 'Thu nhap', key: 'income', width: 18 },
      { header: 'Chi tieu', key: 'expense', width: 18 },
      { header: 'So giao dich', key: 'count', width: 15 },
      { header: '% Chi tieu', key: 'percentage', width: 15 },
    ];

    // Style header
    categorySheet.getRow(1).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    categorySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' },
    };
    categorySheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    categorySheet.getRow(1).height = 30;

    const totalExpense = expense._sum.amount || 0;
    const sortedCategories = [...categoryBreakdown].sort((a, b) => b.expense - a.expense);
    
    sortedCategories.forEach((item, index) => {
      const percentage = totalExpense > 0 ? ((item.expense / totalExpense) * 100).toFixed(1) : '0';
      const row = categorySheet.addRow({
        name: item.category.name,
        income: item.income,
        expense: item.expense,
        count: item.transactionCount,
        percentage: parseFloat(percentage),
      });

      // Format numbers
      row.getCell(2).numFmt = '#,##0 "VND"';
      row.getCell(3).numFmt = '#,##0 "VND"';
      row.getCell(5).numFmt = '0.0"%"';

      // Color code income and expense
      row.getCell(2).font = { color: { argb: 'FF10B981' }, bold: true };
      row.getCell(3).font = { color: { argb: 'FFEF4444' }, bold: true };
      
      // Alternating row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
      }

      // Center align count
      row.getCell(4).alignment = { horizontal: 'center' };
    });

    // Add borders to all cells
    categorySheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    });

    // Add total row
    const totalRow = categorySheet.addRow({
      name: 'TONG CONG',
      income: { formula: `SUM(B2:B${categorySheet.rowCount})` },
      expense: { formula: `SUM(C2:C${categorySheet.rowCount})` },
      count: { formula: `SUM(D2:D${categorySheet.rowCount})` },
      percentage: 100,
    });
    totalRow.font = { bold: true, size: 11 };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };
    totalRow.getCell(2).numFmt = '#,##0 "VND"';
    totalRow.getCell(3).numFmt = '#,##0 "VND"';
    totalRow.getCell(5).numFmt = '0.0"%"';

    // ========== Transactions Sheet ==========
    const transactionSheet = workbook.addWorksheet('Giao dich', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    });
    
    transactionSheet.columns = [
      { header: 'Ngay', key: 'date', width: 15 },
      { header: 'Loai', key: 'type', width: 12 },
      { header: 'Danh muc', key: 'category', width: 25 },
      { header: 'So tien', key: 'amount', width: 18 },
      { header: 'Ghi chu', key: 'description', width: 40 },
    ];

    // Style header
    transactionSheet.getRow(1).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    transactionSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' },
    };
    transactionSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    transactionSheet.getRow(1).height = 30;

    transactions.forEach((txn, index) => {
      const row = transactionSheet.addRow({
        date: new Date(txn.date),
        type: txn.type === 'INCOME' ? 'Thu nhap' : 'Chi tieu',
        category: txn.category.name,
        amount: txn.amount,
        description: txn.description || '-',
      });

      // Format
      row.getCell(1).numFmt = 'dd/mm/yyyy';
      row.getCell(4).numFmt = '#,##0 "VND"';
      
      // Color code by type
      const typeColor = txn.type === 'INCOME' ? 'FF10B981' : 'FFEF4444';
      row.getCell(2).font = { bold: true, color: { argb: typeColor } };
      row.getCell(4).font = { bold: true, color: { argb: typeColor } };
      
      // Alternating row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
      }
    });

    // Add borders
    transactionSheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    });

    // Add summary row
    const txnSummaryRow = transactionSheet.addRow({
      date: '',
      type: 'TONG CONG',
      category: '',
      amount: { formula: `SUM(D2:D${transactionSheet.rowCount})` },
      description: `${transactions.length} giao dich`,
    });
    txnSummaryRow.font = { bold: true, size: 11 };
    txnSummaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };
    txnSummaryRow.getCell(4).numFmt = '#,##0 "VND"';

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }
}
