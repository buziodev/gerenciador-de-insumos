/**
 * Constantes da Aplicação
 */

import {
  AlertSeverity,
  AlertType,
  MaintenanceStatus,
  MaintenanceType,
  MovementType,
  PrinterStatus,
  SupplyType,
  TonerColor,
  UserRole,
} from '@/types';

// ============================================================================
// APLICAÇÃO
// ============================================================================

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'GATTI';
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'GATTI - Gerenciador de Insumos';
export const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION || 'Sistema de Gestão de Impressoras, Suprimentos e Estoque';

// ============================================================================
// PAGINAÇÃO
// ============================================================================

export const DEFAULT_PAGE_SIZE = parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '10', 10);
export const MAX_PAGE_SIZE = parseInt(import.meta.env.VITE_MAX_PAGE_SIZE || '100', 10);

// ============================================================================
// LABELS E ENUMS
// ============================================================================

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.MANAGER]: 'Gerente',
  [UserRole.OPERATOR]: 'Operador',
  [UserRole.VIEWER]: 'Visualizador',
};

export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Acesso total ao sistema',
  [UserRole.MANAGER]: 'Gestão de impressoras e suprimentos',
  [UserRole.OPERATOR]: 'Operações de estoque e alertas',
  [UserRole.VIEWER]: 'Visualização de dados apenas',
};

export const PRINTER_STATUS_LABELS: Record<PrinterStatus, string> = {
  [PrinterStatus.ONLINE]: 'Online',
  [PrinterStatus.OFFLINE]: 'Offline',
  [PrinterStatus.MAINTENANCE]: 'Manutenção',
  [PrinterStatus.ERROR]: 'Erro',
};

export const PRINTER_STATUS_COLORS: Record<PrinterStatus, string> = {
  [PrinterStatus.ONLINE]: 'bg-green-100 text-green-800',
  [PrinterStatus.OFFLINE]: 'bg-red-100 text-red-800',
  [PrinterStatus.MAINTENANCE]: 'bg-yellow-100 text-yellow-800',
  [PrinterStatus.ERROR]: 'bg-red-100 text-red-800',
};

export const TONER_COLOR_LABELS: Record<TonerColor, string> = {
  [TonerColor.BLACK]: 'Preto',
  [TonerColor.CYAN]: 'Ciano',
  [TonerColor.MAGENTA]: 'Magenta',
  [TonerColor.YELLOW]: 'Amarelo',
  [TonerColor.WASTE]: 'Resíduo',
};

export const TONER_COLOR_HEX: Record<TonerColor, string> = {
  [TonerColor.BLACK]: '#000000',
  [TonerColor.CYAN]: '#00BFFF',
  [TonerColor.MAGENTA]: '#FF1493',
  [TonerColor.YELLOW]: '#FFD700',
  [TonerColor.WASTE]: '#808080',
};

export const SUPPLY_TYPE_LABELS: Record<SupplyType, string> = {
  [SupplyType.TONER]: 'Toner',
  [SupplyType.CYLINDER]: 'Cilindro',
  [SupplyType.FUSER]: 'Fusor',
  [SupplyType.MAINTENANCE_KIT]: 'Kit de Manutenção',
  [SupplyType.SPARE_PART]: 'Peça de Reposição',
};

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.ENTRY]: 'Entrada',
  [MovementType.EXIT]: 'Saída',
  [MovementType.TRANSFER]: 'Transferência',
  [MovementType.ADJUSTMENT]: 'Ajuste',
  [MovementType.LOSS]: 'Perda',
};

export const MOVEMENT_TYPE_COLORS: Record<MovementType, string> = {
  [MovementType.ENTRY]: 'bg-green-100 text-green-800',
  [MovementType.EXIT]: 'bg-red-100 text-red-800',
  [MovementType.TRANSFER]: 'bg-blue-100 text-blue-800',
  [MovementType.ADJUSTMENT]: 'bg-yellow-100 text-yellow-800',
  [MovementType.LOSS]: 'bg-red-100 text-red-800',
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  [AlertType.LOW_TONER]: 'Toner Baixo',
  [AlertType.CRITICAL_STOCK]: 'Estoque Crítico',
  [AlertType.PRINTER_OFFLINE]: 'Impressora Offline',
  [AlertType.ABNORMAL_CONSUMPTION]: 'Consumo Anormal',
  [AlertType.OPERATIONAL_FAILURE]: 'Falha Operacional',
  [AlertType.MAINTENANCE_DUE]: 'Manutenção Necessária',
};

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  [AlertSeverity.INFO]: 'Informação',
  [AlertSeverity.WARNING]: 'Aviso',
  [AlertSeverity.CRITICAL]: 'Crítico',
};

export const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  [AlertSeverity.INFO]: 'bg-blue-100 text-blue-800',
  [AlertSeverity.WARNING]: 'bg-yellow-100 text-yellow-800',
  [AlertSeverity.CRITICAL]: 'bg-red-100 text-red-800',
};

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  [MaintenanceType.PREVENTIVE]: 'Preventiva',
  [MaintenanceType.CORRECTIVE]: 'Corretiva',
  [MaintenanceType.CLEANING]: 'Limpeza',
  [MaintenanceType.PARTS_REPLACEMENT]: 'Substituição de Peças',
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.PENDING]: 'Pendente',
  [MaintenanceStatus.IN_PROGRESS]: 'Em Progresso',
  [MaintenanceStatus.COMPLETED]: 'Concluída',
  [MaintenanceStatus.CANCELLED]: 'Cancelada',
};

export const MAINTENANCE_STATUS_COLORS: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [MaintenanceStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [MaintenanceStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [MaintenanceStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
};

// ============================================================================
// VALIDAÇÕES
// ============================================================================

export const PASSWORD_MIN_LENGTH = 6;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const HOSTNAME_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
export const IP_ADDRESS_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

// ============================================================================
// LIMITES
// ============================================================================

export const LIMITS = {
  PRINTER_NAME_MAX: 255,
  PRINTER_MODEL_MAX: 255,
  SUPPLY_NAME_MAX: 255,
  SUPPLY_MODEL_MAX: 255,
  SECTOR_NAME_MAX: 255,
  ALERT_MESSAGE_MAX: 500,
  REASON_MAX: 500,
  DESCRIPTION_MAX: 1000,
};

// ============================================================================
// TIMEOUTS
// ============================================================================

export const TIMEOUTS = {
  TOAST: 3000,
  MODAL: 300,
  ANIMATION: 200,
};

// ============================================================================
// ROTAS
// ============================================================================

export const ROUTES = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',

  // Dashboard
  DASHBOARD: '/dashboard',
  DASHBOARD_EXECUTIVE: '/dashboard/executive',
  DASHBOARD_OPERATIONAL: '/dashboard/operational',

  // Printers
  PRINTERS: '/printers',
  PRINTER_DETAIL: '/printers/:id',
  PRINTER_CREATE: '/printers/create',
  PRINTER_EDIT: '/printers/:id/edit',

  // Supplies
  SUPPLIES: '/supplies',
  SUPPLY_DETAIL: '/supplies/:id',
  SUPPLY_CREATE: '/supplies/create',
  SUPPLY_EDIT: '/supplies/:id/edit',

  // Stock
  STOCK: '/stock',
  STOCK_MOVEMENTS: '/stock/movements',
  STOCK_LEVELS: '/stock/levels',
  STOCK_CRITICAL: '/stock/critical',

  // Alerts
  ALERTS: '/alerts',
  ALERT_DETAIL: '/alerts/:id',

  // Reports
  REPORTS: '/reports',
  REPORT_DETAIL: '/reports/:id',
  REPORT_CREATE: '/reports/create',

  // Admin
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SECTORS: '/admin/sectors',
  ADMIN_AUDIT: '/admin/audit',
  ADMIN_ZABBIX: '/admin/zabbix',

  // Not Found
  NOT_FOUND: '/404',
};

// ============================================================================
// MENSAGENS
// ============================================================================

export const MESSAGES = {
  // Sucesso
  SUCCESS_LOGIN: 'Login realizado com sucesso',
  SUCCESS_LOGOUT: 'Logout realizado com sucesso',
  SUCCESS_CREATE: 'Criado com sucesso',
  SUCCESS_UPDATE: 'Atualizado com sucesso',
  SUCCESS_DELETE: 'Deletado com sucesso',
  SUCCESS_SYNC: 'Sincronização concluída com sucesso',

  // Erro
  ERROR_LOGIN: 'Email ou senha incorretos',
  ERROR_UNAUTHORIZED: 'Você não tem permissão para acessar este recurso',
  ERROR_NOT_FOUND: 'Recurso não encontrado',
  ERROR_NETWORK: 'Erro de conexão. Verifique sua internet',
  ERROR_SERVER: 'Erro do servidor. Tente novamente mais tarde',
  ERROR_VALIDATION: 'Verifique os dados e tente novamente',

  // Confirmação
  CONFIRM_DELETE: 'Tem certeza que deseja deletar este item?',
  CONFIRM_LOGOUT: 'Tem certeza que deseja fazer logout?',

  // Loading
  LOADING: 'Carregando...',
  SYNCING: 'Sincronizando...',
};

// ============================================================================
// CORES DO GRÁFICO
// ============================================================================

export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',
};

// ============================================================================
// FORMATAÇÃO
// ============================================================================

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';
