import { IsNotEmpty, IsString, Length, Matches, IsIn } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+251[0-9]{9}$/)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
  code: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['login', 'registration', 'payout_release', 'password_reset'])
  purpose: string;
}
