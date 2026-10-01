import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ListingsModeratorService {
  constructor(private readonly dataSource: DataSource) {}

  async getPendingListingsCount(): Promise<number> {
    const res = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM products WHERE status IN ('PENDING_APPROVAL', 'FLAGGED', 'Pending approval', 'Flagged')`,
    ).catch(() => [{ count: 0 }]);
    return res[0]?.count || 0;
  }
}
