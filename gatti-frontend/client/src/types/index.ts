/**
 * GATTI Frontend - Type Definitions
 * Tipos globais da aplicação sincronizados com o backend
 */

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export interface ListUsersQuery {
  skip?: number;
  take?: number;
  role?: UserRole;
  search?: string;
}

export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
}

// ============================================================================
// IMPRESSORAS
// ============================================================================

export enum PrinterStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR',
}

export interface Printer {
  id: string;
  zabbixHostId: string;
  name: string;
  hostname: string;
  ipAddress: string;
  model: string;
  manufacturer: string;
  serialNumber?: string;
  group: string;
  status: PrinterStatus;
  sectorId?: string;
  sector?: Sector;
  isActive: boolean;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface SnmpConfiguration {
  startIp: string;
  endIp: string;
  port: number;
  version: string;
  supportedModels: string[];
  communityConfigured: boolean;
}

export interface SnmpDiscoveredDevice {
  ipAddress: string;
  hostname: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber?: string;
  status: PrinterStatus;
  pageCount?: number;
  tonerLevels: Array<{ color: TonerColor; percentageLevel: number; pageCount: number }>;
}

export interface SnmpDiscoveryResponse {
  source: 'SNMP';
  scanned: number;
  discovered: number;
  range: { startIp: string; endIp: string };
  devices: SnmpDiscoveredDevice[];
}

export interface SnmpSyncResponse extends SnmpDiscoveryResponse {
  created: number;
  updated: number;
  syncedAt: string;
}

export interface PrinterMetric {
  id: string;
  printerId: string;
  pageCount: number;
  pageCountPerMinute?: number;
  tonerLevel?: number;
  printerStatus?: string;
  uptime?: number;
  recordedAt: string;
  createdAt: string;
}

export interface TonerLevel {
  id: string;
  printerId: string;
  color: TonerColor;
  percentageLevel: number;
  pageCount: number;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export enum TonerColor {
  BLACK = 'BLACK',
  CYAN = 'CYAN',
  MAGENTA = 'MAGENTA',
  YELLOW = 'YELLOW',
  WASTE = 'WASTE',
}

export interface TonerChange {
  id: string;
  printerId: string;
  printer?: Printer;
  color: TonerColor;
  pagesProducedInCycle: number;
  cycleDurationDays: number;
  previousLevel: number;
  newLevel: number;
  detectedAt: string;
  createdAt: string;
}

export interface TonerForecast {
  id: string;
  printerId: string;
  color: TonerColor;
  currentLevel: number;
  daysRemaining: number;
  pagesRemaining: number;
  estimatedReplaceDate: string;
  confidence: number;
  basedOnDays: number;
  calculatedAt: string;
  updatedAt: string;
}

export interface ConsumptionHistory {
  id: string;
  printerId: string;
  color: TonerColor;
  pagesProduced: number;
  consumedPercentage: number;
  pagesPerPercent: number;
  dailyAverage?: number;
  monthlyAverage?: number;
  recordedAt: string;
  createdAt: string;
}

export interface CreatePrinterRequest {
  zabbixHostId: string;
  name: string;
  hostname: string;
  ipAddress: string;
  model: string;
  manufacturer: string;
  group: string;
  serialNumber?: string;
  status?: PrinterStatus;
  sectorId?: string;
}

export interface UpdatePrinterRequest {
  name?: string;
  hostname?: string;
  ipAddress?: string;
  model?: string;
  manufacturer?: string;
  group?: string;
  serialNumber?: string;
  status?: PrinterStatus;
  sectorId?: string;
}

export interface ListPrintersQuery {
  skip?: number;
  take?: number;
  status?: PrinterStatus;
  sectorId?: string;
  search?: string;
}

// ============================================================================
// SETORES
// ============================================================================

export interface Sector {
  id: string;
  name: string;
  description?: string;
  costCenter?: string;
  manager?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateSectorRequest {
  name: string;
  description?: string;
  costCenter?: string;
  manager?: string;
}

export interface UpdateSectorRequest {
  name?: string;
  description?: string;
  costCenter?: string;
  manager?: string;
}

export interface ListSectorsQuery {
  skip?: number;
  take?: number;
  search?: string;
}

// ============================================================================
// SUPRIMENTOS
// ============================================================================

export enum SupplyType {
  TONER = 'TONER',
  CYLINDER = 'CYLINDER',
  FUSER = 'FUSER',
  MAINTENANCE_KIT = 'MAINTENANCE_KIT',
  SPARE_PART = 'SPARE_PART',
}

export interface Supply {
  id: string;
  name: string;
  type: SupplyType;
  manufacturer: string;
  model?: string;
  compatibleModels: string[];
  nominalCapacity: number;
  unitCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateSupplyRequest {
  name: string;
  type: SupplyType;
  manufacturer: string;
  model?: string;
  compatibleModels?: string[];
  nominalCapacity: number;
  unitCost: number;
}

export interface UpdateSupplyRequest {
  name?: string;
  type?: SupplyType;
  manufacturer?: string;
  model?: string;
  compatibleModels?: string[];
  nominalCapacity?: number;
  unitCost?: number;
}

export interface ListSuppliesQuery {
  skip?: number;
  take?: number;
  type?: SupplyType;
  search?: string;
}

// ============================================================================
// ESTOQUE
// ============================================================================

export interface Stock {
  id: string;
  supplyId: string;
  supply: Supply;
  quantity: number;
  minimumLevel: number;
  maximumLevel: number;
  lastCountedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum MovementType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  LOSS = 'LOSS',
}

export interface StockMovement {
  id: string;
  supplyId: string;
  supply?: Supply;
  type: MovementType;
  quantity: number;
  reason?: string;
  fromLocation?: string;
  toLocation?: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateStockMovementRequest {
  supplyId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  fromLocation?: string;
  toLocation?: string;
}

export interface UpdateStockLevelsRequest {
  minimumLevel: number;
  maximumLevel: number;
}

export interface ListStockMovementsQuery {
  skip?: number;
  take?: number;
  supplyId?: string;
  type?: MovementType;
}

// ============================================================================
// ALERTAS
// ============================================================================

export enum AlertType {
  LOW_TONER = 'LOW_TONER',
  CRITICAL_STOCK = 'CRITICAL_STOCK',
  PRINTER_OFFLINE = 'PRINTER_OFFLINE',
  ABNORMAL_CONSUMPTION = 'ABNORMAL_CONSUMPTION',
  OPERATIONAL_FAILURE = 'OPERATIONAL_FAILURE',
  MAINTENANCE_DUE = 'MAINTENANCE_DUE',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export interface Alert {
  id: string;
  printerId?: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  isActive: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateAlertRequest {
  printerId?: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
}

export interface ListAlertsQuery {
  skip?: number;
  take?: number;
  type?: AlertType;
  severity?: AlertSeverity;
  isActive?: boolean;
}

// ============================================================================
// MANUTENÇÃO
// ============================================================================

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  CLEANING = 'CLEANING',
  PARTS_REPLACEMENT = 'PARTS_REPLACEMENT',
}

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface MaintenanceHistory {
  id: string;
  printerId: string;
  printer?: Printer;
  type: MaintenanceType;
  description?: string;
  performedBy: string;
  startDate: string;
  endDate?: string;
  status: MaintenanceStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// RELATÓRIOS
// ============================================================================

export enum ReportType {
  MONTHLY_CONSUMPTION = 'MONTHLY_CONSUMPTION',
  ANNUAL_CONSUMPTION = 'ANNUAL_CONSUMPTION',
  COSTS = 'COSTS',
  TONER_CHANGES = 'TONER_CHANGES',
  STOCK_INVENTORY = 'STOCK_INVENTORY',
  PRINTER_PERFORMANCE = 'PRINTER_PERFORMANCE',
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description?: string;
  generatedBy: string;
  generatedAt: string;
  fileUrl?: string;
  fileSize?: number;
  filters?: Record<string, any>;
  createdAt: string;
}

export interface CreateReportRequest {
  type: ReportType;
  title: string;
  description?: string;
  filters?: Record<string, any>;
}

export interface ListReportsQuery {
  skip?: number;
  take?: number;
  type?: ReportType;
}

export interface ReportData {
  type: ReportType;
  period?: { startDate: string; endDate: string };
  generatedAt?: string;
  total?: number;
  data: any[];
}

// ============================================================================
// AUDITORIA
// ============================================================================

export interface AuditLog {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ============================================================================
// INTEGRAÇÃO ZABBIX
// ============================================================================

export enum SyncStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface ZabbixSync {
  id: string;
  lastSyncPrinters?: string;
  lastSyncMetrics?: string;
  totalPrinters: number;
  totalMetrics: number;
  status: SyncStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    skip: number;
    take: number;
    pages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

// ============================================================================
// PERMISSÕES
// ============================================================================

export type Permission = {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  roles: UserRole[];
};

export const PERMISSIONS: Permission[] = [
  // Printers
  { resource: 'printers', action: 'create', roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { resource: 'printers', action: 'read', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER] },
  { resource: 'printers', action: 'update', roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { resource: 'printers', action: 'delete', roles: [UserRole.ADMIN] },

  // Supplies
  { resource: 'supplies', action: 'create', roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { resource: 'supplies', action: 'read', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER] },
  { resource: 'supplies', action: 'update', roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { resource: 'supplies', action: 'delete', roles: [UserRole.ADMIN] },

  // Stock
  { resource: 'stock', action: 'create', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR] },
  { resource: 'stock', action: 'read', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER] },
  { resource: 'stock', action: 'update', roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { resource: 'stock', action: 'delete', roles: [UserRole.ADMIN] },

  // Alerts
  { resource: 'alerts', action: 'create', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR] },
  { resource: 'alerts', action: 'read', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER] },
  { resource: 'alerts', action: 'update', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR] },
  { resource: 'alerts', action: 'delete', roles: [UserRole.ADMIN] },

  // Reports
  { resource: 'reports', action: 'create', roles: [UserRole.ADMIN, UserRole.MANAGER] },
  { resource: 'reports', action: 'read', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER] },
  { resource: 'reports', action: 'delete', roles: [UserRole.ADMIN] },

  // Admin
  { resource: 'admin', action: 'create', roles: [UserRole.ADMIN] },
  { resource: 'admin', action: 'read', roles: [UserRole.ADMIN] },
  { resource: 'admin', action: 'update', roles: [UserRole.ADMIN] },
  { resource: 'admin', action: 'delete', roles: [UserRole.ADMIN] },
];

// ============================================================================
// UTILIDADES
// ============================================================================

export function hasPermission(userRole: UserRole, resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean {
  return PERMISSIONS.some(
    (permission) =>
      permission.resource === resource &&
      permission.action === action &&
      permission.roles.includes(userRole)
  );
}

export function canAccess(userRole: UserRole, resource: string): boolean {
  return PERMISSIONS.some(
    (permission) =>
      permission.resource === resource &&
      permission.roles.includes(userRole)
  );
}
