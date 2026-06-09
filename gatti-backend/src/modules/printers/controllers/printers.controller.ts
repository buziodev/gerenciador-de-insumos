import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrintersService } from '../services/printers.service';
import { CreatePrinterDto, UpdatePrinterDto, ListPrintersQueryDto } from '../dtos/printer.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';

@ApiTags('Printers')
@Controller('printers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class PrintersController {
  constructor(private printersService: PrintersService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova impressora' })
  async create(@Body() createPrinterDto: CreatePrinterDto) {
    return this.printersService.create(createPrinterDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Listar impressoras' })
  async findAll(@Query() query: ListPrintersQueryDto) {
    return this.printersService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Obter detalhes de uma impressora' })
  async findOne(@Param('id') id: string) {
    return this.printersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Atualizar impressora' })
  async update(
    @Param('id') id: string,
    @Body() updatePrinterDto: UpdatePrinterDto,
  ) {
    return this.printersService.update(id, updatePrinterDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar impressora' })
  async remove(@Param('id') id: string) {
    await this.printersService.remove(id);
  }

  @Get(':id/metrics')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Obter métricas da impressora' })
  async getMetrics(
    @Param('id') id: string,
    @Query('days') days: number = 30,
  ) {
    return this.printersService.getMetrics(id, days);
  }
}
