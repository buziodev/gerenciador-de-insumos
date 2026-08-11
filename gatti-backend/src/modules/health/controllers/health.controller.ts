import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '@infrastructure/prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar saúde da aplicação' })
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Verificar se a aplicação está pronta' })
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException('Banco de dados indisponível');
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Verificar se a aplicação está viva' })
  live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
