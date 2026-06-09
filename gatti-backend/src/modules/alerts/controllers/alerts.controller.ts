import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertsService } from '../services/alerts.service';
import { CreateAlertDto, ListAlertsQueryDto, AcknowledgeAlertDto } from '../dtos/alert.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'OPERATOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo alerta' })
  async create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertsService.create(createAlertDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Listar alertas' })
  async findAll(@Query() query: ListAlertsQueryDto) {
    return this.alertsService.findAll(query);
  }

  @Get('active')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Obter alertas ativos' })
  async getActiveAlerts() {
    return this.alertsService.getActiveAlerts();
  }

  @Get('critical')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Obter alertas críticos' })
  async getCriticalAlerts() {
    return this.alertsService.getCriticalAlerts();
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Obter detalhes de um alerta' })
  async findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Patch(':id/acknowledge')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR')
  @ApiOperation({ summary: 'Reconhecer um alerta' })
  async acknowledge(
    @Param('id') id: string,
    @Body() acknowledgeDto: AcknowledgeAlertDto,
  ) {
    return this.alertsService.acknowledge(id, acknowledgeDto);
  }

  @Patch(':id/resolve')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR')
  @ApiOperation({ summary: 'Resolver um alerta' })
  async resolve(@Param('id') id: string) {
    return this.alertsService.resolve(id);
  }

  @Get('printer/:printerId')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Obter alertas de uma impressora' })
  async getAlertsByPrinter(@Param('printerId') printerId: string) {
    return this.alertsService.getAlertsByPrinter(printerId);
  }
}
