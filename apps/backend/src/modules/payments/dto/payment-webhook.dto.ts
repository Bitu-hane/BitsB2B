import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsNumber,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentWebhookDto {
  @ApiProperty({
    description: 'Payment provider emitting webhook',
    example: 'telebirr',
  })
  @IsNotEmpty()
  @IsString()
  provider: string;

  @ApiProperty({
    description: 'Unique event ID from payment provider',
    example: 'evt_telebirr_9921448',
  })
  @IsNotEmpty()
  @IsString()
  providerEventId: string;

  @ApiProperty({
    description: 'Provider internal transaction ID',
    example: 'TXN-ET-2026-99381',
  })
  @IsNotEmpty()
  @IsString()
  providerTransactionId: string;

  @ApiProperty({
    description: 'Event type identifier',
    example: 'charge.completed',
  })
  @IsNotEmpty()
  @IsString()
  eventType: string;

  @ApiProperty({
    description: 'Status of payment from provider',
    enum: ['completed', 'failed'],
    example: 'completed',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['completed', 'failed'])
  status: 'completed' | 'failed';

  @ApiProperty({
    description: 'Settled amount in Birr',
    example: 15450.0,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    description: 'Failure reason description if payment failed',
    example: 'Insufficient buyer balance in Telebirr account',
  })
  @IsOptional()
  @IsString()
  failureReason?: string;

  @ApiProperty({
    description: 'Raw payload from payment gateway',
    example: { rawPayload: true },
  })
  @IsNotEmpty()
  @IsObject()
  payload: Record<string, any>;
}
