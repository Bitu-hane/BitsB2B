import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  IsOptional,
  IsEmail,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: '+251911223344', description: 'Ethiopian mobile phone number' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+251[0-9]{9}$/, {
    message: 'Phone number must be a valid Ethiopian mobile number (e.g., +251911223344)',
  })
  phone: string;

  @ApiProperty({ example: 'SecurePassword123', description: 'Account password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'Abebe Tadesse Bekele', description: 'Full legal name' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ example: 'abebe@ethioagro.et', description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Ethio Agro Machinery Import PLC', description: 'Legal Business Name' })
  @IsNotEmpty()
  @IsString()
  businessName: string;

  @ApiProperty({ example: 'importer', description: 'Trade License Category (code)' })
  @IsNotEmpty()
  @IsString()
  businessTypeCode: string;

  @ApiPropertyOptional({ example: true, description: 'Can purchase wholesale goods' })
  @IsOptional()
  @IsBoolean()
  canBuy?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Can sell products on platform' })
  @IsOptional()
  @IsBoolean()
  canSell?: boolean;

  @ApiPropertyOptional({ example: '0012345678', description: 'Tax Identification Number' })
  @IsOptional()
  @IsString()
  tinNumber?: string;

  @ApiPropertyOptional({ example: 'ET-ADD-2024-8849', description: 'Trade License Registration Number' })
  @IsOptional()
  @IsString()
  tradeLicenseNumber?: string;

  @ApiProperty({ example: 'Addis Ababa', description: 'Ethiopian Region' })
  @IsNotEmpty()
  @IsString()
  region: string;

  @ApiProperty({ example: 'Addis Ababa', description: 'City' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: 'Bole Subcity', description: 'Subcity or Zone' })
  @IsOptional()
  @IsString()
  subcity?: string;

  @ApiPropertyOptional({ example: 'Kebele 03', description: 'Kebele or Wereda' })
  @IsOptional()
  @IsString()
  kebele?: string;

  @ApiPropertyOptional({ example: 'Behind CBE Merkato Branch', description: 'Logistics Landmark' })
  @IsOptional()
  @IsString()
  landmark?: string;
}
