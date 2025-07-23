import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

const apiKeys = (process.env.API_KEY || '').split(' ').filter((key) => !!key);

if (apiKeys.length === 0) {
  throw new Error('Missing API_KEY in env');
}

export const AUTH_KEY_HEADER = 'auth-key';

export const isValidAuthKey = (key: string): boolean => {
  return apiKeys.includes(key);
};

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.headers[AUTH_KEY_HEADER];

    return typeof key === 'string' && isValidAuthKey(key);
  }
}
