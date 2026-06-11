import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

/**
 * Rate Limiting Guard
 * Limita requisições por IP e por usuário
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private store: RateLimitStore = {};
  private readonly MAX_REQUESTS = 100; // Máximo de requisições
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutos em ms

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);
    const key = `${ip}`;
    const now = Date.now();

    // Limpar entrada expirada
    if (this.store[key] && this.store[key].resetTime < now) {
      delete this.store[key];
    }

    // Inicializar ou incrementar contador
    if (!this.store[key]) {
      this.store[key] = { count: 1, resetTime: now + this.WINDOW_MS };
    } else {
      this.store[key].count++;
    }

    // Verificar limite
    if (this.store[key].count > this.MAX_REQUESTS) {
      throw new HttpException(
        `Limite de requisições excedido. Máximo: ${this.MAX_REQUESTS} requisições por ${this.WINDOW_MS / 60000} minutos`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}
