import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum AlertTypeEnum {
  LOW_TONER = 'LOW_TONER',
  CRITICAL_STOCK = 'CRITICAL_STOCK',
  PRINTER_OFFLINE = 'PRINTER_OFFLINE',
  ABNORMAL_CONSUMPTION = 'ABNORMAL_CONSUMPTION',
  OPERATIONAL_FAILURE = 'OPERATIONAL_FAILURE',
  MAINTENANCE_DUE = 'MAINTENANCE_DUE',
}

export enum AlertSeverityEnum {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export class CreateAlertDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID da impressora (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  printerId?: string;

  @ApiProperty({
    enum: AlertTypeEnum,
    example: AlertTypeEnum.LOW_TONER,
    description: 'Tipo de alerta',
  })
  @IsEnum(AlertTypeEnum)
  type: AlertTypeEnum;

  @ApiProperty({
    enum: AlertSeverityEnum,
    example: AlertSeverityEnum.WARNING,
    description: 'Severidade do alerta',
  })
  @IsEnum(AlertSeverityEnum)
  severity: AlertSeverityEnum;

  @ApiProperty({
    example: 'Toner preto com nível baixo (10%)',
    description: 'Mensagem do alerta',
  })
  @IsString()
  message: string;
}

export class AcknowledgeAlertDto {
  @ApiProperty({
    example: 'user-123',
    description: 'ID do usuário que reconheceu o alerta',
  })
  @IsString()
  acknowledgedBy: string;
}

export class ListAlertsQueryDto {
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
    enum: AlertTypeEnum,
    description: 'Filtrar por tipo',
    required: false,
  })
  @IsOptional()
  @IsEnum(AlertTypeEnum)
  type?: AlertTypeEnum;

  @ApiProperty({
    enum: AlertSeverityEnum,
    description: 'Filtrar por severidade',
    required: false,
  })
  @IsOptional()
  @IsEnum(AlertSeverityEnum)
  severity?: AlertSeverityEnum;

  @ApiProperty({
    example: true,
    description: 'Filtrar por status ativo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
