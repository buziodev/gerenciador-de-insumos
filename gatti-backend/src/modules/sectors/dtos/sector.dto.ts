import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateSectorDto {
  @ApiProperty({
    example: 'Administrativo',
    description: 'Nome do setor',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'Setor administrativo da empresa',
    description: 'Descrição do setor',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'CC-ADM-001',
    description: 'Centro de custo do setor',
    required: false,
  })
  @IsOptional()
  @IsString()
  costCenter?: string;

  @ApiProperty({
    example: 'Responsável pelo Administrativo',
    description: 'Responsável pelo setor',
    required: false,
  })
  @IsOptional()
  @IsString()
  manager?: string;
}

export class UpdateSectorDto extends PartialType(CreateSectorDto) {}

export class ListSectorsQueryDto {
  @ApiProperty({
    example: 0,
    description: 'Número de registros a pular',
    required: false,
  })
  @IsOptional()
  skip?: number;

  @ApiProperty({
    example: 10,
    description: 'Número de registros a retornar',
    required: false,
  })
  @IsOptional()
  take?: number;

  @ApiProperty({
    example: 'Administrativo',
    description: 'Buscar por nome',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
