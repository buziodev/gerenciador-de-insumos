import { Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ZabbixService } from '../services/zabbix.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';

@ApiTags('Zabbix')
@Controller('zabbix')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ZabbixController {
  constructor(private zabbixService: ZabbixService) {}

  @Post('sync/printers')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar impressoras do Zabbix' })
  async syncPrinters() {
    return this.zabbixService.syncPrinters();
  }

  @Post('sync/metrics')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar métricas do Zabbix' })
  async syncMetrics() {
    return this.zabbixService.syncMetrics();
  }
}
