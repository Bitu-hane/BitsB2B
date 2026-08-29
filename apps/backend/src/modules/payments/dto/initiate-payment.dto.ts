import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsIn,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({
    description: 'Target Purchase Order UUID in orders table',
    example: 'd9b2d63d-a233-4123-8472-ee98276f5b9d',
  })
  @IsNotEmpty()
  @IsUUID('4', { message: 'orderId must be a valid UUID' })
  orderId: string;

  @ApiProperty({
    description: 'Payment service provider',
    enum: ['telebirr', 'cbe_birr', 'bank_transfer', 'awash_birr'],
    example: 'telebirr',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['telebirr', 'cbe_birr', 'bank_transfer', 'awash_birr'], {
    message: 'provider must be telebirr, cbe_birr, bank_transfer, or awash_birr',
  })
  provider: string;

  @ApiProperty({
    description: 'Payment channel or method',
    example: 'ussd_push',
    enum: ['ussd_push', 'qr_code', 'account_transfer', 'web_checkout'],
  })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @ApiProperty({
    description: 'Payment transaction amount in Ethiopian Birr',
    example: 15450.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'amount must be greater than zero' })
  amount: number;

  @ApiPropertyOptional({
    description: 'ISO currency code',
    default: 'ETB',
    example: 'ETB',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Customer mobile phone for Telebirr/CBE Birr push prompt',
    example: '+251911223344',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Bank account number (for CBE or bank wire transfers)',
    example: '1000189283741',
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({
    description: 'Client-provided unique idempotency key to prevent duplicate charges',
    example: 'idem-ord-8839-step1',
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
