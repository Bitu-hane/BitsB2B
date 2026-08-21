import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';

import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginPasswordDto } from './dto/login-password.dto';
import { RegisterPasswordDto } from './dto/register-password.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication & Identity')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request 6-digit SMS OTP verification code' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully via SMS' })
  @ApiResponse({ status: 400, description: 'Invalid phone or rate-limit exceeded' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestSmsOtp(dto.phone, dto.purpose);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify SMS OTP code & create active multi-device session' })
  @ApiResponse({ status: 200, description: 'OTP verified, returns access & refresh tokens' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP code' })
  async verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    const userAgent = req.get('user-agent');
    const ip = req.ip;
    return this.authService.verifySmsOtp(dto.phone, dto.code, dto.purpose, userAgent, ip);
  }

  @Post('login/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with phone & password credentials (Table 2: user_credentials)' })
  @ApiResponse({ status: 200, description: 'Authentication successful, returns access & refresh tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or account locked' })
  async loginWithPassword(@Body() dto: LoginPasswordDto, @Req() req: Request) {
    const userAgent = req.get('user-agent');
    const ip = req.ip;
    return this.authService.loginWithPassword(dto.phone, dto.password, userAgent, ip);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new B2B user, business entity & location in PostgreSQL' })
  @ApiResponse({ status: 201, description: 'User & business created successfully, returns session tokens' })
  @ApiResponse({ status: 400, description: 'Phone number already registered or invalid fields' })
  async registerUser(@Body() dto: RegisterUserDto, @Req() req: Request) {
    const userAgent = req.get('user-agent');
    const ip = req.ip;
    return this.authService.registerUser(dto, userAgent, ip);
  }

  @Post('password/set')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set or update account password credentials (Authenticated User)' })
  @ApiResponse({ status: 200, description: 'Password credentials created successfully' })
  async setPassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: RegisterPasswordDto,
  ) {
    return this.authService.setPassword(userId, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate JWT access token using multi-device refresh token' })
  @ApiResponse({ status: 200, description: 'Token rotated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or revoked refresh token' })
  async refreshSession(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshSession(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from current device session' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  async logout(@CurrentUser('sessionId') sessionId: string) {
    return this.authService.logout(sessionId);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from all active multi-device sessions' })
  @ApiResponse({ status: 200, description: 'All user sessions revoked successfully' })
  async logoutAll(@CurrentUser('sub') userId: string) {
    return this.authService.logoutAll(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile with active RBAC roles & permissions' })
  @ApiResponse({ status: 200, description: 'Returns identity profile, roles & permissions' })
  async getUserProfile(@CurrentUser('sub') userId: string) {
    return this.authService.getUserProfile(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update authenticated user profile (Name, Email, Avatar)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateUserProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateUserProfile(userId, dto);
  }
}
