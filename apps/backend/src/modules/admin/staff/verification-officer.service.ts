import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class VerificationOfficerService {
  constructor(private readonly dataSource: DataSource) {}

  async getPendingVerificationsCount(): Promise<number> {
    const res = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM users 
       WHERE (verification_state = 'PENDING_REVIEW' OR (verification_state IS NULL AND is_verified IS NOT TRUE)) 
         AND staff_role IS NULL`,
    );
    return res[0]?.count || 0;
  }
}
