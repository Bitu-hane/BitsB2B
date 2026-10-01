import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  moq: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsOptional()
  @IsString()
  stockStatus?: string;

  @IsOptional()
  @IsString()
  leadTime?: string;

  @IsOptional()
  @IsArray()
  deliveryZones?: string[];

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @IsOptional()
  @IsString()
  sellerBusinessId?: string;

  @IsOptional()
  @IsString()
  sellerBusinessName?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  priceTiers?: any[];

  @IsOptional()
  featured?: boolean;

  @IsOptional()
  @IsString()
  sellerRegion?: string;
}
