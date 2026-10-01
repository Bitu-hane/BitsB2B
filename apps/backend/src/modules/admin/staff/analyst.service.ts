import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AnalystService {
  constructor(private readonly dataSource: DataSource) {}

  async getRoleLiquidityAnalytics(): Promise<any> {
    const usersCount = await this.dataSource.query(`SELECT COUNT(*)::int AS count FROM users WHERE staff_role IS NULL`);
    return {
      totalUsers: usersCount[0]?.count || 0,
      liquidityStatus: 'HEALTHY',
    };
  }
}
