import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class EscrowOfficerService {
  constructor(private readonly dataSource: DataSource) {}

  async getHeldEscrowTotal(): Promise<number> {
    const res = await this.dataSource.query(
      `SELECT COALESCE(SUM(total_price), 0)::float AS total FROM orders WHERE escrow_status = 'HELD_ESCROW'`,
    ).catch(() => [{ total: 0 }]);
    return res[0]?.total || 0;
  }
}
