import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto, LoginResponseDto, RefreshTokenDto } from '../dtos/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { loginAttemptTracker } from '../../../config/rate-limit';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Realizar login' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    // Verificar se o email está bloqueado por tentativas falhadas
    if (loginAttemptTracker.isBlocked(loginDto.email)) {
      const resetTime = loginAttemptTracker.getResetTime(loginDto.email);
      throw new BadRequestException(
        `Conta temporariamente bloqueada. Tente novamente em ${resetTime} segundos.`
      );
    }

    try {
      const result = await this.authService.login(loginDto);
      // Login bem-sucedido: reseta tentativas
      loginAttemptTracker.recordSuccessfulLogin(loginDto.email);
      return result;
    } catch (error) {
      // Login falhado: registra tentativa
      loginAttemptTracker.recordFailedAttempt(loginDto.email);
      const remaining = loginAttemptTracker.getRemainingAttempts(loginDto.email);
      
      throw new BadRequestException(
        `Email ou senha inválidos. Tentativas restantes: ${remaining}`
      );
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Renovar token de acesso' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<LoginResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realizar logout' })
  async logout(@Request() req: any) {
    await this.authService.logout(req.user.userId);
    return { message: 'Logout realizado com sucesso' };
  }
}
