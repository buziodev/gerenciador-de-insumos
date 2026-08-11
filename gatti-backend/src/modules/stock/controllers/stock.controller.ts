import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from '../services/stock.service';
import { CreateStockMovementDto, ListMovementsQueryDto, UpdateStockLevelsDto } from '../dtos/stock.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';

@ApiTags('Stock')
@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class StockController {
  constructor(private stockService: StockService) {}

  @Post('movements')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar movimentação de estoque' })
  async createMovement(@Body() createMovementDto: CreateStockMovementDto, @Request() req: any) {
    return this.stockService.createMovement({
      ...createMovementDto,
      createdBy: req.user.userId,
    });
  }

  @Get('movements')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Listar movimentações de estoque' })
  async listMovements(@Query() query: ListMovementsQueryDto) {
    return this.stockService.listMovements(query);
  }

  @Get('levels')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Obter níveis de estoque' })
  async getStockLevels() {
    return this.stockService.getStockLevels();
  }

  @Get('critical')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Obter suprimentos com estoque crítico' })
  async getCriticalStock() {
    return this.stockService.getCriticalStock();
  }

  @Patch(':supplyId/levels')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Atualizar níveis mínimo e máximo de estoque' })
  async updateStockLevels(
    @Param('supplyId') supplyId: string,
    @Body() updateLevelsDto: UpdateStockLevelsDto,
  ) {
    return this.stockService.updateStockLevels(
      supplyId,
      updateLevelsDto.minimumLevel,
      updateLevelsDto.maximumLevel,
    );
  }
}
