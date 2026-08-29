import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReleaseEscrowDto {
  @ApiPropertyOptional({
    description: 'Confirmation note or confirmation code for releasing funds to seller',
    example: 'Goods received and inspected in wholesale warehouse.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RefundEscrowDto {
  @ApiPropertyOptional({
    description: 'Reason for issuing refund back to buyer',
    example: 'Seller failed to dispatch shipment within agreed SLA period.',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
