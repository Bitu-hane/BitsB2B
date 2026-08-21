import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    let payload: any;

    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'bitsb2b-secret-key-change-in-production',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    // 1. Verify Active Session State in auth_sessions Table
    if (payload.sessionId) {
      const sessions = await this.dataSource.query(
        `SELECT id, revoked_at, expires_at FROM auth_sessions WHERE id = $1`,
        [payload.sessionId],
      );

      if (!sessions || sessions.length === 0 || sessions[0].revoked_at !== null) {
        throw new UnauthorizedException('Session has been revoked or logged out');
      }

      if (new Date(sessions[0].expires_at) < new Date()) {
        throw new UnauthorizedException('Session expired');
      }
    }

    // 2. Load User's Assigned Roles & Granted Permissions (RBAC)
    const rolesRes = await this.dataSource.query(
      `SELECT r.name FROM user_roles ur
       INNER JOIN roles r ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [payload.sub],
    );

    const permsRes = await this.dataSource.query(
      `SELECT p.code FROM user_roles ur
       INNER JOIN role_permissions rp ON rp.role_id = ur.role_id
       INNER JOIN permissions p ON p.id = rp.permission_id
       WHERE ur.user_id = $1`,
      [payload.sub],
    );

    payload.roles = rolesRes.map((r: any) => r.name);
    payload.permissions = Array.from(new Set(permsRes.map((p: any) => p.code)));

    request['user'] = payload;
    return true;
  }
}
