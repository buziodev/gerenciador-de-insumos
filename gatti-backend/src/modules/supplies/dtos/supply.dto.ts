import { IsString, IsOptional, IsEnum, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum SupplyTypeEnum {
  TONER = 'TONER',
  CYLINDER = 'CYLINDER',
  FUSER = 'FUSER',
  MAINTENANCE_KIT = 'MAINTENANCE_KIT',
  SPARE_PART = 'SPARE_PART',
}

export class CreateSupplyDto {
  @ApiProperty({
    example: 'Toner Preto HP 85A',
    description: 'Nome do suprimento',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    enum: SupplyTypeEnum,
    example: SupplyTypeEnum.TONER,
    description: 'Tipo de suprimento',
  })
  @IsEnum(SupplyTypeEnum)
  type!: SupplyTypeEnum;

  @ApiProperty({
    example: 'HP',
    description: 'Fabricante',
  })
  @IsString()
  manufacturer!: string;

  @ApiProperty({
    example: 'CE285A',
    description: 'Modelo',
    required: false,
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({
    example: ['HP LaserJet Pro M404n', 'HP LaserJet Pro M404dn'],
    description: 'Modelos de impressoras compatíveis',
    required: false,
  })
  @IsOptional()
  @IsArray()
  compatibleModels?: string[];

  @ApiProperty({
    example: 1600,
    description: 'Capacidade nominal em páginas',
  })
  @IsNumber()
  nominalCapacity!: number;

  @ApiProperty({
    example: 85.50,
    description: 'Custo unitário',
  })
  @IsNumber()
  unitCost!: number;
}

export class UpdateSupplyDto extends PartialType(CreateSupplyDto) {}

export class ListSuppliesQueryDto {
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
    enum: SupplyTypeEnum,
    description: 'Filtrar por tipo',
    required: false,
  })
  @IsOptional()
  @IsEnum(SupplyTypeEnum)
  type?: SupplyTypeEnum;

  @ApiProperty({
    example: 'HP',
    description: 'Buscar por nome, fabricante ou modelo',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
