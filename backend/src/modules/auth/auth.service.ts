import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  // Helper: Create Active Multi-Device Session Token (Table 4: auth_sessions)
  private async createSession(userId: string, deviceInfo?: string, ipAddress?: string) {
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-day refresh token TTL

    const sessionRes = await this.dataSource.query(
      `INSERT INTO auth_sessions (user_id, refresh_token_hash, device_info, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, refreshTokenHash, deviceInfo || 'Web Portal', ipAddress || null, expiresAt],
    );

    const sessionId = sessionRes[0].id;
    const accessToken = this.jwtService.sign(
      { sub: userId, sessionId },
      { expiresIn: '15m' },
    );

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      sessionId,
      expiresInSeconds: 900,
    };
  }

  // 1. Request SMS OTP (Rate-Limited to max 5 requests per hour per phone)
  async requestSmsOtp(phone: string, purpose: string) {
    const recentCountResult = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM otp_challenges 
       WHERE phone = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [phone],
    );

    if (recentCountResult[0]?.count >= 5) {
      throw new BadRequestException('Too many OTP requests. Please wait 1 hour before trying again.');
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash('sha256').update(rawOtp).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5-minute TTL

    await this.dataSource.query(
      `INSERT INTO otp_challenges (phone, code_hash, purpose, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [phone, codeHash, purpose, expiresAt],
    );

    await this.dataSource.query(
      `INSERT INTO sms_logs (phone, type, provider, status)
       VALUES ($1, $2, $3, $4)`,
      [phone, 'otp', 'ethio_telecom', 'sent'],
    );

    this.logger.log(`[DEVELOPMENT ONLY] OTP generated for ${phone}: ${rawOtp}`);

    return {
      message: 'OTP verification code sent successfully via SMS',
      expiresInSeconds: 300,
    };
  }

  // 2. Verify SMS OTP & Create Multi-Device Session
  async verifySmsOtp(phone: string, code: string, purpose: string, deviceInfo?: string, ipAddress?: string) {
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    const challenges = await this.dataSource.query(
      `SELECT * FROM otp_challenges 
       WHERE phone = $1 AND purpose = $2 AND consumed_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [phone, purpose],
    );

    if (!challenges || challenges.length === 0) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    const challenge = challenges[0];

    if (challenge.attempts >= challenge.max_attempts) {
      throw new BadRequestException('OTP code invalid due to too many failed attempts');
    }

    if (challenge.code_hash !== codeHash) {
      await this.dataSource.query(
        `UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = $1`,
        [challenge.id],
      );
      throw new BadRequestException('Incorrect OTP code');
    }

    await this.dataSource.query(
      `UPDATE otp_challenges SET consumed_at = NOW() WHERE id = $1`,
      [challenge.id],
    );

    let userResult = await this.dataSource.query(
      `SELECT * FROM users WHERE phone = $1`,
      [phone],
    );

    let user = userResult[0];

    if (!user) {
      const newUser = await this.dataSource.query(
        `INSERT INTO users (full_name, phone, phone_verified_at)
         VALUES ($1, $2, NOW()) RETURNING *`,
        [`User ${phone.slice(-4)}`, phone],
      );
      user = newUser[0];
    }

    const sessionTokens = await this.createSession(user.id, deviceInfo, ipAddress);

    return {
      ...sessionTokens,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.full_name,
      },
    };
  }

  // 3. Password Credential Authentication (Table 2: user_credentials)
  async loginWithPassword(phone: string, rawPassword: string, deviceInfo?: string, ipAddress?: string) {
    const users = await this.dataSource.query(
      `SELECT * FROM users WHERE phone = $1`,
      [phone],
    );

    if (!users || users.length === 0) {
      throw new UnauthorizedException('Invalid phone number or password credentials');
    }

    const user = users[0];

    if (!user.is_active) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    const credentials = await this.dataSource.query(
      `SELECT * FROM user_credentials WHERE user_id = $1`,
      [user.id],
    );

    if (!credentials || credentials.length === 0) {
      throw new UnauthorizedException('No password set for this account. Please login using SMS OTP.');
    }

    const cred = credentials[0];

    if (cred.locked_until && new Date(cred.locked_until) > new Date()) {
      const remainingMinutes = Math.ceil(
        (new Date(cred.locked_until).getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account locked due to 5 consecutive failed login attempts. Try again in ${remainingMinutes} minutes.`,
      );
    }

    const isMatch = await bcrypt.compare(rawPassword, cred.password_hash);

    if (!isMatch) {
      const updatedAttempts = cred.failed_login_attempts + 1;
      let lockUntil: Date | null = null;

      if (updatedAttempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lock
      }

      await this.dataSource.query(
        `UPDATE user_credentials 
         SET failed_login_attempts = $1, locked_until = $2, updated_at = NOW() 
         WHERE user_id = $3`,
        [updatedAttempts, lockUntil, user.id],
      );

      const attemptsRemaining = Math.max(0, 5 - updatedAttempts);
      throw new UnauthorizedException(
        `Invalid password credentials. ${attemptsRemaining} attempts remaining before account lock.`,
      );
    }

    await this.dataSource.query(
      `UPDATE user_credentials 
       SET failed_login_attempts = 0, locked_until = NULL, updated_at = NOW() 
       WHERE user_id = $1`,
      [user.id],
    );

    const sessionTokens = await this.createSession(user.id, deviceInfo, ipAddress);

    return {
      ...sessionTokens,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.full_name,
        email: user.email,
      },
    };
  }

  // 4. Set or Update Password Credentials
  async setPassword(userId: string, rawPassword: string) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(rawPassword, saltRounds);

    await this.dataSource.query(
      `INSERT INTO user_credentials (user_id, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE 
       SET password_hash = $2, failed_login_attempts = 0, locked_until = NULL, updated_at = NOW()`,
      [userId, passwordHash],
    );

    return {
      message: 'Password credentials created and secured successfully',
    };
  }

  // 4b. Complete B2B User Registration (Saves to users, user_credentials, businesses, business_addresses)
  async registerUser(dto: RegisterUserDto, deviceInfo?: string, ipAddress?: string) {
    try {
      const existingUsers = await this.dataSource.query(
        `SELECT id FROM users WHERE phone = $1`,
        [dto.phone],
      ).catch(() => []);

      if (existingUsers && existingUsers.length > 0) {
        throw new BadRequestException('Phone number is already registered in our database. Please sign in instead.');
      }

      const userRes = await this.dataSource.query(
        `INSERT INTO users (full_name, phone, email, phone_verified_at)
         VALUES ($1, $2, $3, NOW()) RETURNING id, full_name AS "fullName", phone, email`,
        [dto.fullName, dto.phone, dto.email || null],
      );
      const user = userRes[0];

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(dto.password, saltRounds);
      await this.dataSource.query(
        `INSERT INTO user_credentials (user_id, password_hash) VALUES ($1, $2)`,
        [user.id, passwordHash],
      );

      let bTypeCode = dto.businessTypeCode || 'wholesaler';
      const bTypeCheck = await this.dataSource.query(
        `SELECT code FROM business_types WHERE code = $1`,
        [bTypeCode],
      );
      if (!bTypeCheck || bTypeCheck.length === 0) {
        bTypeCode = 'wholesaler';
      }

      const bizRes = await this.dataSource.query(
        `INSERT INTO businesses (owner_user_id, name, business_type_code, can_buy, can_sell, phone, tin_number, trade_license_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, business_type_code AS "businessTypeCode", can_buy AS "canBuy", can_sell AS "canSell"`,
        [
          user.id,
          dto.businessName,
          bTypeCode,
          dto.canBuy ?? true,
          dto.canSell ?? false,
          dto.phone,
          dto.tinNumber || null,
          dto.tradeLicenseNumber || null,
        ],
      );
      const business = bizRes[0];

      await this.dataSource.query(
        `INSERT INTO business_addresses (business_id, label, region, city, subcity, kebele, landmark, is_default_billing, is_default_shipping)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, true)`,
        [
          business.id,
          'headquarters',
          dto.region,
          dto.city,
          dto.subcity || null,
          dto.kebele || null,
          dto.landmark || null,
        ],
      );

      const sessionTokens = await this.createSession(user.id, deviceInfo, ipAddress);

      return {
        ...sessionTokens,
        user,
        business,
      };
    } catch (err: any) {
      this.logger.error(`Error during user registration: ${err.message}`, err.stack);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(err.message || 'Registration failed due to database constraint.');
    }
  }

  // 5. Refresh Token Session Rotation (Table 4: auth_sessions)
  async refreshSession(rawRefreshToken: string) {
    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const sessions = await this.dataSource.query(
      `SELECT * FROM auth_sessions WHERE refresh_token_hash = $1`,
      [refreshTokenHash],
    );

    if (!sessions || sessions.length === 0) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = sessions[0];

    if (session.revoked_at !== null) {
      throw new UnauthorizedException('Session has been revoked');
    }

    if (new Date(session.expires_at) < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Rotate Refresh Token
    const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRawRefreshToken).digest('hex');
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.dataSource.query(
      `UPDATE auth_sessions 
       SET refresh_token_hash = $1, expires_at = $2 
       WHERE id = $3`,
      [newRefreshTokenHash, newExpiresAt, session.id],
    );

    const accessToken = this.jwtService.sign(
      { sub: session.user_id, sessionId: session.id },
      { expiresIn: '15m' },
    );

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
      expiresInSeconds: 900,
    };
  }

  // 6. Logout Current Active Device Session
  async logout(sessionId: string) {
    if (!sessionId) return { message: 'Already logged out' };

    await this.dataSource.query(
      `UPDATE auth_sessions SET revoked_at = NOW() WHERE id = $1`,
      [sessionId],
    );

    return {
      message: 'Logged out successfully from current device session',
    };
  }

  // 7. Logout From All Devices (Revoke All Active Sessions)
  async logoutAll(userId: string) {
    await this.dataSource.query(
      `UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    );

    return {
      message: 'Logged out successfully from all active device sessions',
    };
  }

  // 8. Get Authenticated User Profile with RBAC Roles & Granted Permissions
  async getUserProfile(userId: string) {
    const users = await this.dataSource.query(
      `SELECT id, full_name AS "fullName", phone, email, avatar_url AS "avatarUrl", 
              is_active AS "isActive", phone_verified_at AS "phoneVerifiedAt", created_at AS "createdAt"
       FROM users WHERE id = $1`,
      [userId],
    );

    if (!users || users.length === 0) {
      throw new UnauthorizedException('User profile not found');
    }

    const user = users[0];

    // Load Business Profile if exists
    const businesses = await this.dataSource.query(
      `SELECT b.id, b.name, b.business_type_code AS "businessTypeCode", 
              b.can_buy AS "canBuy", b.can_sell AS "canSell", b.verification_status AS "verificationStatus"
       FROM businesses b WHERE b.owner_user_id = $1`,
      [userId],
    );

    // Load Assigned Roles
    const rolesRes = await this.dataSource.query(
      `SELECT r.name FROM user_roles ur
       INNER JOIN roles r ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId],
    );

    // Load Granted Permissions
    const permsRes = await this.dataSource.query(
      `SELECT p.code FROM user_roles ur
       INNER JOIN role_permissions rp ON rp.role_id = ur.role_id
       INNER JOIN permissions p ON p.id = rp.permission_id
       WHERE ur.user_id = $1`,
      [userId],
    );

    return {
      ...user,
      business: businesses[0] || null,
      roles: rolesRes.map((r: any) => r.name),
      permissions: Array.from(new Set(permsRes.map((p: any) => p.code))),
    };
  }

  // 9. Update Authenticated User Profile
  async updateUserProfile(userId: string, dto: { fullName?: string; email?: string; avatarUrl?: string }) {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.fullName) {
      updates.push(`full_name = $${idx}`);
      values.push(dto.fullName);
      idx++;
    }

    if (dto.email) {
      updates.push(`email = $${idx}`);
      values.push(dto.email);
      idx++;
    }

    if (dto.avatarUrl) {
      updates.push(`avatar_url = $${idx}`);
      values.push(dto.avatarUrl);
      idx++;
    }

    if (updates.length === 0) {
      return this.getUserProfile(userId);
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    await this.dataSource.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`,
      values,
    );

    return this.getUserProfile(userId);
  }
}
