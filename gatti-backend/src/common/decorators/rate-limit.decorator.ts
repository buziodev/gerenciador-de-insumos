import { UseGuards } from '@nestjs/common';
import { RateLimitGuard } from '../guards/rate-limit.guard';

/**
 * Decorator para aplicar rate limiting em endpoints
 * @param maxRequests Máximo de requisições permitidas
 * @param windowMs Janela de tempo em milissegundos
 */
export function RateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return UseGuards(RateLimitGuard);
}
