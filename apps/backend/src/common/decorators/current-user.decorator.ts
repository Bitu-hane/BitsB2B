import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string;         // user_id
  sessionId?: string;  // auth_sessions record UUID
  phone?: string;
  roles?: string[];
  permissions?: string[];
  businessId?: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user) return null;
    return data ? user[data] : user;
  },
);
