import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DisputeMediatorService {
  constructor(private readonly dataSource: DataSource) {}

  async getOpenDisputesCount(): Promise<number> {
    const res = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM dispute_cases WHERE status IN ('OPEN', 'INVESTIGATING', 'RECOMMENDED_REFUND', 'RECOMMENDED_RELEASE')`,
    ).catch(() => [{ count: 0 }]);
    return res[0]?.count || 0;
  }
}
