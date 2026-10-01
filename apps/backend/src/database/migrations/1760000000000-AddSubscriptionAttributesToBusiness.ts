import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptionAttributesToBusiness1760000000000 implements MigrationInterface {
  name = 'AddSubscriptionAttributesToBusiness1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "businesses"
      ADD COLUMN IF NOT EXISTS "subscription_plan" VARCHAR(50) NOT NULL DEFAULT 'FREE',
      ADD COLUMN IF NOT EXISTS "subscription_start_date" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "subscription_end_date" TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS "subscription_status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
      ADD COLUMN IF NOT EXISTS "listing_limit" INTEGER NOT NULL DEFAULT 5
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "businesses"
      DROP COLUMN IF EXISTS "subscription_plan",
      DROP COLUMN IF EXISTS "subscription_start_date",
      DROP COLUMN IF EXISTS "subscription_end_date",
      DROP COLUMN IF EXISTS "subscription_status",
      DROP COLUMN IF EXISTS "listing_limit"
    `);
  }
}
