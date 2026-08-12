import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { SnmpService } from '../services/snmp.service';

@ApiTags('SNMP')
@Controller('snmp')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class SnmpController {
  constructor(private readonly snmpService: SnmpService) {}

  @Get('config')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Consultar a configuração efetiva da descoberta SNMP' })
  getConfig() {
    return this.snmpService.getConfiguration();
  }

  @Post('discover')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR')
  @ApiOperation({ summary: 'Varrer a faixa configurada e identificar Ricoh P 311/M 320 via SNMP' })
  discover() {
    return this.snmpService.discover();
  }

  @Post('sync/printers')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Descobrir Ricoh via SNMP e sincronizar impressoras, status e métricas' })
  syncPrinters() {
    return this.snmpService.syncPrinters();
  }
}

// Estilo: API operacional com contratos pequenos e explícitos; as permissões seguem a matriz RBAC
// existente e as ações de escrita ficam restritas a perfis administrativos.
