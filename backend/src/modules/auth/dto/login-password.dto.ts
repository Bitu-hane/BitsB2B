import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginPasswordDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+251[0-9]{9}$/, {
    message: 'Phone number must be a valid Ethiopian mobile number (e.g., +251911223344)',
  })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
