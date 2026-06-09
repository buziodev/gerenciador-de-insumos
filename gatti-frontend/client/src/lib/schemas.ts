/**
 * Zod Schemas para Validação de Formulários
 * Sincronizados com DTOs do backend
 */

import { z } from 'zod';
import { AlertSeverity, AlertType, MaintenanceType, MovementType, PrinterStatus, SupplyType, TonerColor, UserRole } from '@/types';

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

export const LoginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export type RefreshTokenFormData = z.infer<typeof RefreshTokenSchema>;

// ============================================================================
// IMPRESSORAS
// ============================================================================

export const CreatePrinterSchema = z.object({
  zabbixHostId: z.string().min(1, 'ID do Zabbix é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  hostname: z.string().min(1, 'Hostname é obrigatório').max(255, 'Hostname muito longo'),
  ipAddress: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, 'Endereço IP inválido'),
  model: z.string().min(1, 'Modelo é obrigatório').max(255, 'Modelo muito longo'),
  manufacturer: z.string().min(1, 'Fabricante é obrigatório').max(255, 'Fabricante muito longo'),
  group: z.string().min(1, 'Grupo é obrigatório'),
  serialNumber: z.string().optional(),
  status: z.enum([PrinterStatus.ONLINE, PrinterStatus.OFFLINE, PrinterStatus.MAINTENANCE, PrinterStatus.ERROR]).optional(),
  sectorId: z.string().optional(),
});

export type CreatePrinterFormData = z.infer<typeof CreatePrinterSchema>;

export const UpdatePrinterSchema = CreatePrinterSchema.partial();

export type UpdatePrinterFormData = z.infer<typeof UpdatePrinterSchema>;

// ============================================================================
// SETORES
// ============================================================================

export const CreateSectorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  costCenter: z.string().optional(),
  manager: z.string().optional(),
});

export type CreateSectorFormData = z.infer<typeof CreateSectorSchema>;

export const UpdateSectorSchema = CreateSectorSchema.partial();

export type UpdateSectorFormData = z.infer<typeof UpdateSectorSchema>;

// ============================================================================
// SUPRIMENTOS
// ============================================================================

export const CreateSupplySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  type: z.enum([SupplyType.TONER, SupplyType.CYLINDER, SupplyType.FUSER, SupplyType.MAINTENANCE_KIT, SupplyType.SPARE_PART]),
  manufacturer: z.string().min(1, 'Fabricante é obrigatório').max(255, 'Fabricante muito longo'),
  model: z.string().max(255, 'Modelo muito longo').optional(),
  compatibleModels: z.array(z.string()).optional(),
  nominalCapacity: z.number().int().positive('Capacidade deve ser um número positivo'),
  unitCost: z.number().positive('Custo deve ser um número positivo'),
});

export type CreateSupplyFormData = z.infer<typeof CreateSupplySchema>;

export const UpdateSupplySchema = CreateSupplySchema.partial();

export type UpdateSupplyFormData = z.infer<typeof UpdateSupplySchema>;

// ============================================================================
// ESTOQUE
// ============================================================================

export const CreateStockMovementSchema = z.object({
  supplyId: z.string().min(1, 'Suprimento é obrigatório'),
  type: z.enum([MovementType.ENTRY, MovementType.EXIT, MovementType.TRANSFER, MovementType.ADJUSTMENT, MovementType.LOSS]),
  quantity: z.number().int().positive('Quantidade deve ser um número positivo'),
  reason: z.string().max(500, 'Motivo muito longo').optional(),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  createdBy: z.string().min(1, 'Usuário é obrigatório'),
});

export type CreateStockMovementFormData = z.infer<typeof CreateStockMovementSchema>;

export const UpdateStockLevelsSchema = z.object({
  minimumLevel: z.number().int().nonnegative('Nível mínimo deve ser não-negativo'),
  maximumLevel: z.number().int().positive('Nível máximo deve ser positivo'),
}).refine((data) => data.maximumLevel > data.minimumLevel, {
  message: 'Nível máximo deve ser maior que o nível mínimo',
  path: ['maximumLevel'],
});

export type UpdateStockLevelsFormData = z.infer<typeof UpdateStockLevelsSchema>;

// ============================================================================
// ALERTAS
// ============================================================================

export const CreateAlertSchema = z.object({
  printerId: z.string().optional(),
  type: z.enum([
    AlertType.LOW_TONER,
    AlertType.CRITICAL_STOCK,
    AlertType.PRINTER_OFFLINE,
    AlertType.ABNORMAL_CONSUMPTION,
    AlertType.OPERATIONAL_FAILURE,
    AlertType.MAINTENANCE_DUE,
  ]),
  severity: z.enum([AlertSeverity.INFO, AlertSeverity.WARNING, AlertSeverity.CRITICAL]),
  message: z.string().min(1, 'Mensagem é obrigatória').max(500, 'Mensagem muito longa'),
});

export type CreateAlertFormData = z.infer<typeof CreateAlertSchema>;

export const AcknowledgeAlertSchema = z.object({
  acknowledgedBy: z.string().min(1, 'Usuário é obrigatório'),
});

export type AcknowledgeAlertFormData = z.infer<typeof AcknowledgeAlertSchema>;

// ============================================================================
// MANUTENÇÃO
// ============================================================================

export const CreateMaintenanceSchema = z.object({
  printerId: z.string().min(1, 'Impressora é obrigatória'),
  type: z.enum([MaintenanceType.PREVENTIVE, MaintenanceType.CORRECTIVE, MaintenanceType.CLEANING, MaintenanceType.PARTS_REPLACEMENT]),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  performedBy: z.string().min(1, 'Responsável é obrigatório'),
  startDate: z.string(),
  endDate: z.string().optional(),
});

export type CreateMaintenanceFormData = z.infer<typeof CreateMaintenanceSchema>;

// ============================================================================
// RELATÓRIOS
// ============================================================================

export const CreateReportSchema = z.object({
  type: z.string().min(1, 'Tipo de relatório é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório').max(255, 'Título muito longo'),
  description: z.string().max(1000, 'Descrição muito longa').optional(),
  generatedBy: z.string().min(1, 'Usuário é obrigatório'),
  filters: z.record(z.string(), z.any()).optional(),
});

export type CreateReportFormData = z.infer<typeof CreateReportSchema>;

export const DateRangeSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
}).superRefine((data, ctx) => {
  if (new Date(data.startDate) > new Date(data.endDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Data final deve ser posterior à data inicial',
      path: ['endDate'],
    });
  }
});

export type DateRangeFormData = z.infer<typeof DateRangeSchema>;

// ============================================================================
// FILTROS
// ============================================================================

export const PrinterFilterSchema = z.object({
  skip: z.number().int().nonnegative().optional(),
  take: z.number().int().positive().optional(),
  status: z.enum([PrinterStatus.ONLINE, PrinterStatus.OFFLINE, PrinterStatus.MAINTENANCE, PrinterStatus.ERROR]).optional(),
  sectorId: z.string().optional(),
  search: z.string().optional(),
});

export type PrinterFilterData = z.infer<typeof PrinterFilterSchema>;

export const SupplyFilterSchema = z.object({
  skip: z.number().int().nonnegative().optional(),
  take: z.number().int().positive().optional(),
  type: z.enum([SupplyType.TONER, SupplyType.CYLINDER, SupplyType.FUSER, SupplyType.MAINTENANCE_KIT, SupplyType.SPARE_PART]).optional(),
  search: z.string().optional(),
});

export type SupplyFilterData = z.infer<typeof SupplyFilterSchema>;

export const AlertFilterSchema = z.object({
  skip: z.number().int().nonnegative().optional(),
  take: z.number().int().positive().optional(),
  type: z.string().optional(),
  severity: z.enum([AlertSeverity.INFO, AlertSeverity.WARNING, AlertSeverity.CRITICAL]).optional(),
  isActive: z.boolean().optional(),
});

export type AlertFilterData = z.infer<typeof AlertFilterSchema>;

export const StockMovementFilterSchema = z.object({
  skip: z.number().int().nonnegative().optional(),
  take: z.number().int().positive().optional(),
  supplyId: z.string().optional(),
  type: z.enum([MovementType.ENTRY, MovementType.EXIT, MovementType.TRANSFER, MovementType.ADJUSTMENT, MovementType.LOSS]).optional(),
});

export type StockMovementFilterData = z.infer<typeof StockMovementFilterSchema>;
