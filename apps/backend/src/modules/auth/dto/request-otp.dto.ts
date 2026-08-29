import { IsNotEmpty, IsString, Matches, IsIn } from 'class-validator';

export class RequestOtpDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+251[0-9]{9}$/, {
    message: 'Phone number must be a valid Ethiopian mobile number (e.g., +251911223344)',
  })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['login', 'registration', 'payout_release', 'password_reset'])
  purpose: string;
}
