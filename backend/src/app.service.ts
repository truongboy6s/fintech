import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: 'Finance Management API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        categories: '/api/categories',
        transactions: '/api/transactions',
        budgets: '/api/budgets',
        reports: '/api/reports',
        export: '/api/export',
      },
      documentation: '/api/docs',
      health: '/api/health',
    };
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
