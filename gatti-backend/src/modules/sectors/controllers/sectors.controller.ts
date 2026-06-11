import { Controller, Get, Post, Body, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SectorsService } from '../services/sectors.service';
import { CreateSectorDto, UpdateSectorDto, ListSectorsQueryDto } from '../dtos/sector.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Sectors')
@Controller('sectors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SectorsController {
  constructor(private sectorsService: SectorsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo setor' })
  async create(@Body() createSectorDto: CreateSectorDto) {
    return this.sectorsService.create(createSectorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os setores' })
  async findAll(@Query() query: ListSectorsQueryDto) {
    return this.sectorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um setor' })
  async findOne(@Param('id') id: string) {
    return this.sectorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar setor' })
  async update(@Param('id') id: string, @Body() updateSectorDto: UpdateSectorDto) {
    return this.sectorsService.update(id, updateSectorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar setor (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.sectorsService.remove(id);
  }
}
