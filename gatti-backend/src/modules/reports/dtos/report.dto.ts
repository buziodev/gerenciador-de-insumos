import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReportTypeEnum {
  MONTHLY_CONSUMPTION = 'MONTHLY_CONSUMPTION',
  ANNUAL_CONSUMPTION = 'ANNUAL_CONSUMPTION',
  COSTS = 'COSTS',
  TONER_CHANGES = 'TONER_CHANGES',
  STOCK_INVENTORY = 'STOCK_INVENTORY',
  PRINTER_PERFORMANCE = 'PRINTER_PERFORMANCE',
}

export class GenerateReportDto {
  @ApiProperty({
    enum: ReportTypeEnum,
    example: ReportTypeEnum.MONTHLY_CONSUMPTION,
    description: 'Tipo de relatório',
  })
  @IsEnum(ReportTypeEnum)
  type: ReportTypeEnum;

  @ApiProperty({
    example: 'Consumo Mensal - Junho 2024',
    description: 'Título do relatório',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Relatório de consumo de toner por setor',
    description: 'Descrição do relatório',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'user-123',
    description: 'ID do usuário que gerou o relatório',
  })
  @IsString()
  generatedBy: string;

  @ApiProperty({
    example: { startDate: '2024-06-01', endDate: '2024-06-30' },
    description: 'Filtros aplicados ao relatório',
    required: false,
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

export class ListReportsQueryDto {
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
    enum: ReportTypeEnum,
    description: 'Filtrar por tipo de relatório',
    required: false,
  })
  @IsOptional()
  @IsEnum(ReportTypeEnum)
  type?: ReportTypeEnum;
}
