import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_user_id', unique: true })
  ownerUserId: string;

  @Column()
  name: string;

  @Column({ name: 'business_type_code' })
  businessTypeCode: string;

  @Column({ name: 'can_buy', default: true })
  canBuy: boolean;

  @Column({ name: 'can_sell', default: false })
  canSell: boolean;

  @Column()
  phone: string;

  @Column({ name: 'tin_number', nullable: true })
  tinNumber: string;

  @Column({ name: 'trade_license_number', nullable: true })
  tradeLicenseNumber: string;

  @Column({ name: 'verification_status', default: 'pending' })
  verificationStatus: string;

  @Column({ name: 'subscription_plan', length: 50, default: 'FREE' })
  subscriptionPlan: string;

  @Column({
    type: 'timestamptz',
    name: 'subscription_start_date',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  subscriptionStartDate: Date | null;

  @Column({ type: 'timestamptz', name: 'subscription_end_date', nullable: true })
  subscriptionEndDate: Date | null;

  @Column({ name: 'subscription_status', length: 30, default: 'ACTIVE' })
  subscriptionStatus: string;

  @Column({ name: 'listing_limit', type: 'int', default: 5 })
  listingLimit: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
