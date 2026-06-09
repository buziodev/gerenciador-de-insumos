import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service';
import { GenerateReportDto, ListReportsQueryDto } from '../dtos/report.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gerar novo relatório' })
  async generateReport(@Body() generateReportDto: GenerateReportDto) {
    return this.reportsService.generateReport(generateReportDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Listar relatórios' })
  async findAll(@Query() query: ListReportsQueryDto) {
    return this.reportsService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Obter detalhes de um relatório' })
  async findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Get('consumption/monthly')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Gerar relatório de consumo mensal' })
  async getConsumptionReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getConsumptionReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('costs/summary')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Gerar relatório de custos' })
  async getCostsReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getCostsReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('toner-changes/summary')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Gerar relatório de trocas de toner' })
  async getTonerChangesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getTonerChangesReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('stock/inventory')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Gerar relatório de inventário de estoque' })
  async getStockInventoryReport() {
    return this.reportsService.getStockInventoryReport();
  }
}
