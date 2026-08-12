import { Controller, Get, Post, Body, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SectorsService } from '../services/sectors.service';
import { CreateSectorDto, UpdateSectorDto, ListSectorsQueryDto } from '../dtos/sector.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { HttpCode, HttpStatus } from '@nestjs/common';

@ApiTags('Sectors')
@Controller('sectors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class SectorsController {
  constructor(private sectorsService: SectorsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Criar novo setor' })
  async create(@Body() createSectorDto: CreateSectorDto) {
    return this.sectorsService.create(createSectorDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Listar todos os setores' })
  async findAll(@Query() query: ListSectorsQueryDto) {
    return this.sectorsService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER')
  @ApiOperation({ summary: 'Obter detalhes de um setor' })
  async findOne(@Param('id') id: string) {
    return this.sectorsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Atualizar setor' })
  async update(@Param('id') id: string, @Body() updateSectorDto: UpdateSectorDto) {
    return this.sectorsService.update(id, updateSectorDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar setor (soft delete)' })
  async remove(@Param('id') id: string) {
    await this.sectorsService.remove(id);
  }
}
