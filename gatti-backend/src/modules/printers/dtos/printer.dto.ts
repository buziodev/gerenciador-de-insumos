import { IsString, IsOptional, IsEnum, IsIP } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum PrinterStatusEnum {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR',
}

export class CreatePrinterDto {
  @ApiProperty({
    example: '12345',
    description: 'ID do host no Zabbix',
  })
  @IsString()
  zabbixHostId!: string;

  @ApiProperty({
    example: 'Impressora Sala 101',
    description: 'Nome da impressora',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'printer-101.empresa.com',
    description: 'Hostname da impressora',
  })
  @IsString()
  hostname!: string;

  @ApiProperty({
    example: '192.168.1.100',
    description: 'Endereço IP da impressora',
  })
  @IsIP()
  ipAddress!: string;

  @ApiProperty({
    example: 'HP LaserJet Pro M404n',
    description: 'Modelo da impressora',
  })
  @IsString()
  model!: string;

  @ApiProperty({
    example: 'HP',
    description: 'Fabricante da impressora',
  })
  @IsString()
  manufacturer!: string;

  @ApiProperty({
    example: 'SN123456789',
    description: 'Número de série',
    required: false,
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiProperty({
    example: 'Impressoras - Administrativo',
    description: 'Grupo no Zabbix',
  })
  @IsString()
  group!: string;

  @ApiProperty({
    enum: PrinterStatusEnum,
    example: PrinterStatusEnum.ONLINE,
    description: 'Status da impressora',
    required: false,
  })
  @IsOptional()
  @IsEnum(PrinterStatusEnum)
  status?: PrinterStatusEnum;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do setor',
    required: false,
  })
  @IsOptional()
  @IsString()
  sectorId?: string;
}

export class UpdatePrinterDto extends PartialType(CreatePrinterDto) {}

export class ListPrintersQueryDto {
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
    enum: PrinterStatusEnum,
    description: 'Filtrar por status',
    required: false,
  })
  @IsOptional()
  @IsEnum(PrinterStatusEnum)
  status?: PrinterStatusEnum;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filtrar por setor',
    required: false,
  })
  @IsOptional()
  @IsString()
  sectorId?: string;

  @ApiProperty({
    example: 'HP',
    description: 'Buscar por nome, hostname ou IP',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
