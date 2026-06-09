import { IsString, IsOptional, IsEnum, IsNumber, IsInt } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum MovementTypeEnum {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  LOSS = 'LOSS',
}

export class CreateStockMovementDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do suprimento',
  })
  @IsString()
  supplyId: string;

  @ApiProperty({
    enum: MovementTypeEnum,
    example: MovementTypeEnum.ENTRY,
    description: 'Tipo de movimentação',
  })
  @IsEnum(MovementTypeEnum)
  type: MovementTypeEnum;

  @ApiProperty({
    example: 10,
    description: 'Quantidade movimentada',
  })
  @IsInt()
  quantity: number;

  @ApiProperty({
    example: 'Compra fornecedor ABC',
    description: 'Motivo da movimentação',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    example: 'Almoxarifado Central',
    description: 'Local de origem',
    required: false,
  })
  @IsOptional()
  @IsString()
  fromLocation?: string;

  @ApiProperty({
    example: 'Almoxarifado Filial',
    description: 'Local de destino',
    required: false,
  })
  @IsOptional()
  @IsString()
  toLocation?: string;

  @ApiProperty({
    example: 'user-123',
    description: 'ID do usuário que criou o movimento',
  })
  @IsString()
  createdBy: string;
}

export class ListMovementsQueryDto {
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
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filtrar por suprimento',
    required: false,
  })
  @IsOptional()
  @IsString()
  supplyId?: string;

  @ApiProperty({
    enum: MovementTypeEnum,
    description: 'Filtrar por tipo de movimentação',
    required: false,
  })
  @IsOptional()
  @IsEnum(MovementTypeEnum)
  type?: MovementTypeEnum;
}

export class UpdateStockLevelsDto {
  @ApiProperty({
    example: 5,
    description: 'Nível mínimo de estoque',
  })
  @IsInt()
  minimumLevel: number;

  @ApiProperty({
    example: 100,
    description: 'Nível máximo de estoque',
  })
  @IsInt()
  maximumLevel: number;
}
