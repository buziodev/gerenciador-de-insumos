/**
 * Rate Limiting Configuration
 * Proteção contra brute force e abuso de API
 */

export const RATE_LIMIT_CONFIG = {
  // Login: 5 tentativas a cada 15 minutos
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo de 5 tentativas
  },

  // API Geral: 100 requisições a cada 1 minuto
  API: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100,
  },

  // Endpoints sensíveis: 10 requisições a cada 1 minuto
  SENSITIVE: {
    windowMs: 1 * 60 * 1000,
    max: 10,
  },
};

/**
 * Armazenamento de tentativas de login falhadas
 * Formato: { email: { attempts: number, lastAttempt: Date } }
 */
export class LoginAttemptTracker {
  private attempts = new Map<string, { count: number; resetTime: number }>();

  /**
   * Registra uma tentativa de login falhada
   */
  recordFailedAttempt(email: string): void {
    const now = Date.now();
    const existing = this.attempts.get(email);

    if (existing && now < existing.resetTime) {
      existing.count++;
    } else {
      this.attempts.set(email, {
        count: 1,
        resetTime: now + RATE_LIMIT_CONFIG.LOGIN.windowMs,
      });
    }
  }

  /**
   * Registra um login bem-sucedido (reseta tentativas)
   */
  recordSuccessfulLogin(email: string): void {
    this.attempts.delete(email);
  }

  /**
   * Verifica se o email está bloqueado
   */
  isBlocked(email: string): boolean {
    const existing = this.attempts.get(email);
    if (!existing) return false;

    const now = Date.now();
    if (now >= existing.resetTime) {
      this.attempts.delete(email);
      return false;
    }

    return existing.count >= RATE_LIMIT_CONFIG.LOGIN.max;
  }

  /**
   * Retorna o número de tentativas restantes
   */
  getRemainingAttempts(email: string): number {
    const existing = this.attempts.get(email);
    if (!existing) return RATE_LIMIT_CONFIG.LOGIN.max;

    const now = Date.now();
    if (now >= existing.resetTime) {
      this.attempts.delete(email);
      return RATE_LIMIT_CONFIG.LOGIN.max;
    }

    return Math.max(0, RATE_LIMIT_CONFIG.LOGIN.max - existing.count);
  }

  /**
   * Retorna o tempo até o reset (em segundos)
   */
  getResetTime(email: string): number {
    const existing = this.attempts.get(email);
    if (!existing) return 0;

    const now = Date.now();
    if (now >= existing.resetTime) {
      this.attempts.delete(email);
      return 0;
    }

    return Math.ceil((existing.resetTime - now) / 1000);
  }

  /**
   * Limpa tentativas expiradas
   */
  cleanup(): void {
    const now = Date.now();
    for (const [email, data] of this.attempts.entries()) {
      if (now >= data.resetTime) {
        this.attempts.delete(email);
      }
    }
  }
}

export const loginAttemptTracker = new LoginAttemptTracker();
