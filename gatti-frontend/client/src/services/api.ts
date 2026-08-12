/**
 * API Services
 * Serviços centralizados para chamadas à API
 */

import {
  Alert,
  AlertSeverity,
  AlertType,
  CreateAlertRequest,
  CreatePrinterRequest,
  CreateReportRequest,
  CreateStockMovementRequest,
  CreateSupplyRequest,
  ListAlertsQuery,
  ListPrintersQuery,
  ListReportsQuery,
  ListStockMovementsQuery,
  ListSuppliesQuery,
  MaintenanceHistory,
  PaginatedResponse,
  Printer,
  PrinterMetric,
  Report,
  ReportData,
  Stock,
  StockMovement,
  Supply,
  TonerChange,
  TonerForecast,
  UpdatePrinterRequest,
  UpdateStockLevelsRequest,
  UpdateSupplyRequest,
  ZabbixSync,
} from '@/types';
import {
  CreateSectorRequest,
  CreateUserRequest,
  ListSectorsQuery,
  ListUsersQuery,
  Sector,
  UpdateSectorRequest,
  UpdateUserRequest,
  User,
  UserRole,
} from '@/types';
import { apiClient } from '@/config/api';

// ============================================================================
// PRINTERS
// ============================================================================

export const printersService = {
  /**
   * Listar impressoras
   */
  list: async (query?: ListPrintersQuery) => {
    const response = await apiClient.get<PaginatedResponse<Printer>>('/printers', {
      params: query,
    });
    return response.data;
  },

  /**
   * Obter detalhes de uma impressora
   */
  getById: async (id: string) => {
    const response = await apiClient.get<Printer>(`/printers/${id}`);
    return response.data;
  },

  /**
   * Criar impressora
   */
  create: async (data: CreatePrinterRequest) => {
    const response = await apiClient.post<Printer>('/printers', data);
    return response.data;
  },

  /**
   * Atualizar impressora
   */
  update: async (id: string, data: UpdatePrinterRequest) => {
    const response = await apiClient.patch<Printer>(`/printers/${id}`, data);
    return response.data;
  },

  /**
   * Deletar impressora
   */
  delete: async (id: string) => {
    await apiClient.delete(`/printers/${id}`);
  },

  /**
   * Obter métricas de uma impressora
   */
  getMetrics: async (id: string, days: number = 30) => {
    const response = await apiClient.get<PrinterMetric[]>(`/printers/${id}/metrics`, {
      params: { days },
    });
    return response.data;
  },
};

// ============================================================================
// SUPPLIES
// ============================================================================

export const suppliesService = {
  /**
   * Listar suprimentos
   */
  list: async (query?: ListSuppliesQuery) => {
    const response = await apiClient.get<PaginatedResponse<Supply>>('/supplies', {
      params: query,
    });
    return response.data;
  },

  /**
   * Obter detalhes de um suprimento
   */
  getById: async (id: string) => {
    const response = await apiClient.get<Supply>(`/supplies/${id}`);
    return response.data;
  },

  /**
   * Criar suprimento
   */
  create: async (data: CreateSupplyRequest) => {
    const response = await apiClient.post<Supply>('/supplies', data);
    return response.data;
  },

  /**
   * Atualizar suprimento
   */
  update: async (id: string, data: UpdateSupplyRequest) => {
    const response = await apiClient.patch<Supply>(`/supplies/${id}`, data);
    return response.data;
  },

  /**
   * Deletar suprimento
   */
  delete: async (id: string) => {
    await apiClient.delete(`/supplies/${id}`);
  },

  /**
   * Obter estoque de um suprimento
   */
  getStock: async (id: string) => {
    const response = await apiClient.get<Stock>(`/supplies/${id}/stock`);
    return response.data;
  },
};

// ============================================================================
// STOCK
// ============================================================================

export const stockService = {
  /**
   * Criar movimentação de estoque
   */
  createMovement: async (data: CreateStockMovementRequest) => {
    const response = await apiClient.post<StockMovement>('/stock/movements', data);
    return response.data;
  },

  /**
   * Listar movimentações
   */
  listMovements: async (query?: ListStockMovementsQuery) => {
    const response = await apiClient.get<PaginatedResponse<StockMovement>>('/stock/movements', {
      params: query,
    });
    return response.data;
  },

  /**
   * Obter níveis de estoque
   */
  getLevels: async () => {
    const response = await apiClient.get<Stock[]>('/stock/levels');
    return response.data;
  },

  /**
   * Obter estoque crítico
   */
  getCritical: async () => {
    const response = await apiClient.get<Stock[]>('/stock/critical');
    return response.data;
  },

  /**
   * Atualizar níveis de estoque
   */
  updateLevels: async (supplyId: string, data: UpdateStockLevelsRequest) => {
    const response = await apiClient.patch<Stock>(`/stock/${supplyId}/levels`, data);
    return response.data;
  },
};

// ============================================================================
// ALERTS
// ============================================================================

export const alertsService = {
  /**
   * Listar alertas
   */
  list: async (query?: ListAlertsQuery) => {
    const response = await apiClient.get<PaginatedResponse<Alert>>('/alerts', {
      params: query,
    });
    return response.data;
  },

  /**
   * Obter alertas ativos
   */
  getActive: async () => {
    const response = await apiClient.get<Alert[]>('/alerts/active');
    return response.data;
  },

  /**
   * Obter alertas críticos
   */
  getCritical: async () => {
    const response = await apiClient.get<Alert[]>('/alerts/critical');
    return response.data;
  },

  /**
   * Obter alerta por ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<Alert>(`/alerts/${id}`);
    return response.data;
  },

  /**
   * Obter alertas de uma impressora
   */
  getByPrinter: async (printerId: string) => {
    const response = await apiClient.get<Alert[]>(`/alerts/printer/${printerId}`);
    return response.data;
  },

  /**
   * Criar alerta
   */
  create: async (data: CreateAlertRequest) => {
    const response = await apiClient.post<Alert>('/alerts', data);
    return response.data;
  },

  /**
   * Reconhecer alerta
   */
  acknowledge: async (id: string) => {
    const response = await apiClient.patch<Alert>(`/alerts/${id}/acknowledge`);
    return response.data;
  },

  /**
   * Resolver alerta
   */
  resolve: async (id: string) => {
    const response = await apiClient.patch<Alert>(`/alerts/${id}/resolve`);
    return response.data;
  },
};

// ============================================================================
// REPORTS
// ============================================================================

export const reportsService = {
  /**
   * Listar relatórios
   */
  list: async (query?: ListReportsQuery) => {
    const response = await apiClient.get<PaginatedResponse<Report>>('/reports', {
      params: query,
    });
    return response.data;
  },

  /**
   * Obter relatório por ID
   */
  getById: async (id: string) => {
    const response = await apiClient.get<Report>(`/reports/${id}`);
    return response.data;
  },

  /**
   * Criar relatório
   */
  create: async (data: CreateReportRequest) => {
    const response = await apiClient.post<Report>('/reports', data);
    return response.data;
  },

  /**
   * Obter relatório de consumo mensal
   */
  getConsumptionReport: async (startDate: string, endDate: string) => {
    const response = await apiClient.get<ReportData>('/reports/consumption/monthly', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Obter relatório de custos
   */
  getCostsReport: async (startDate: string, endDate: string) => {
    const response = await apiClient.get<ReportData>('/reports/costs/summary', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Obter relatório de trocas de toner
   */
  getTonerChangesReport: async (startDate: string, endDate: string) => {
    const response = await apiClient.get<ReportData>('/reports/toner-changes/summary', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Obter relatório de inventário de estoque
   */
  getStockInventoryReport: async () => {
    const response = await apiClient.get<ReportData>('/reports/stock/inventory');
    return response.data;
  },
};

// ============================================================================
// ZABBIX
// ============================================================================

export const zabbixService = {
  /**
   * Sincronizar impressoras
   */
  syncPrinters: async () => {
    const response = await apiClient.post<ZabbixSync>('/zabbix/sync/printers');
    return response.data;
  },

  /**
   * Sincronizar métricas
   */
  syncMetrics: async () => {
    const response = await apiClient.post<ZabbixSync>('/zabbix/sync/metrics');
    return response.data;
  },
};

// ============================================================================
// HEALTH
// ============================================================================

export const healthService = {
  /**
   * Health check
   */
  check: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  /**
   * Readiness probe
   */
  ready: async () => {
    const response = await apiClient.get('/health/ready');
    return response.data;
  },

  /**
   * Liveness probe
   */
  live: async () => {
    const response = await apiClient.get('/health/live');
    return response.data;
  },
};

// ============================================================================
// ADMINISTRATION
// ============================================================================

export const usersService = {
  list: async (query?: ListUsersQuery) => {
    const response = await apiClient.get<PaginatedResponse<User>>('/users', { params: query });
    return response.data;
  },
  create: async (data: CreateUserRequest) => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },
  update: async (id: string, data: UpdateUserRequest) => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },
  updateRole: async (id: string, role: UserRole) => {
    const response = await apiClient.patch<User>(`/users/${id}/role`, { role });
    return response.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/users/${id}`);
  },
};

export const sectorsService = {
  list: async (query?: ListSectorsQuery) => {
    const response = await apiClient.get<PaginatedResponse<Sector>>('/sectors', { params: query });
    return response.data;
  },
  create: async (data: CreateSectorRequest) => {
    const response = await apiClient.post<Sector>('/sectors', data);
    return response.data;
  },
  update: async (id: string, data: UpdateSectorRequest) => {
    const response = await apiClient.patch<Sector>(`/sectors/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/sectors/${id}`);
  },
};
