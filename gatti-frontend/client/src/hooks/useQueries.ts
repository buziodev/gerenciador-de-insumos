/**
 * TanStack Query Hooks
 * Hooks customizados para data fetching com caching automático
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { printersService, suppliesService, stockService, alertsService, reportsService } from '@/services/api';
import { Printer, Supply, StockMovement, Alert, Report, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

// ============================================================================
// PRINTERS QUERIES
// ============================================================================

export function usePrinters(options?: UseQueryOptions<PaginatedResponse<Printer>>) {
  return useQuery({
    queryKey: ['printers'],
    queryFn: () => printersService.list({ skip: 0, take: 10 }),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  });
}

export function usePrinter(id: string, options?: UseQueryOptions<Printer>) {
  return useQuery({
    queryKey: ['printers', id],
    queryFn: () => printersService.getById(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useCreatePrinter(options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => printersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      toast.success('Impressora criada com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao criar impressora: ${error.message}`);
    },
    ...options,
  });
}

export function useUpdatePrinter(id: string, options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => printersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      queryClient.invalidateQueries({ queryKey: ['printers', id] });
      toast.success('Impressora atualizada com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar impressora: ${error.message}`);
    },
    ...options,
  });
}

export function useDeletePrinter(id: string, options?: UseMutationOptions<void, Error, void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => printersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['printers'] });
      toast.success('Impressora deletada com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao deletar impressora: ${error.message}`);
    },
    ...options,
  });
}

// ============================================================================
// SUPPLIES QUERIES
// ============================================================================

export function useSupplies(options?: UseQueryOptions<PaginatedResponse<Supply>>) {
  return useQuery({
    queryKey: ['supplies'],
    queryFn: () => suppliesService.list({ skip: 0, take: 10 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useSupply(id: string, options?: UseQueryOptions<Supply>) {
  return useQuery({
    queryKey: ['supplies', id],
    queryFn: () => suppliesService.getById(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useCreateSupply(options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => suppliesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
      toast.success('Suprimento criado com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao criar suprimento: ${error.message}`);
    },
    ...options,
  });
}

export function useUpdateSupply(id: string, options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => suppliesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
      queryClient.invalidateQueries({ queryKey: ['supplies', id] });
      toast.success('Suprimento atualizado com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar suprimento: ${error.message}`);
    },
    ...options,
  });
}

export function useDeleteSupply(id: string, options?: UseMutationOptions<void, Error, void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => suppliesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies'] });
      toast.success('Suprimento deletado com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao deletar suprimento: ${error.message}`);
    },
    ...options,
  });
}

// ============================================================================
// STOCK QUERIES
// ============================================================================

export function useStockMovements(options?: UseQueryOptions<PaginatedResponse<StockMovement>>) {
  return useQuery({
    queryKey: ['stock-movements'],
    queryFn: () => stockService.listMovements({ skip: 0, take: 10 }),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useCreateStockMovement(options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => stockService.createMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      toast.success('Movimentação de estoque criada com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao criar movimentação: ${error.message}`);
    },
    ...options,
  });
}

// ============================================================================
// ALERTS QUERIES
// ============================================================================

export function useAlerts(options?: UseQueryOptions<PaginatedResponse<Alert>>) {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsService.list({ skip: 0, take: 10 }),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos
    ...options,
  });
}

export function useAlert(id: string, options?: UseQueryOptions<Alert>) {
  return useQuery({
    queryKey: ['alerts', id],
    queryFn: () => alertsService.getById(id),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useAcknowledgeAlert(id: string, options?: UseMutationOptions<any, Error, void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => alertsService.acknowledge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts', id] });
      toast.success('Alerta reconhecido');
    },
    onError: (error) => {
      toast.error(`Erro ao reconhecer alerta: ${error.message}`);
    },
    ...options,
  });
}

export function useResolveAlert(id: string, options?: UseMutationOptions<any, Error, void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => alertsService.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts', id] });
      toast.success('Alerta resolvido');
    },
    onError: (error) => {
      toast.error(`Erro ao resolver alerta: ${error.message}`);
    },
    ...options,
  });
}

// ============================================================================
// REPORTS QUERIES
// ============================================================================

export function useReports(options?: UseQueryOptions<PaginatedResponse<Report>>) {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsService.list({ skip: 0, take: 10 }),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000,
    ...options,
  });
}

export function useReport(id: string, options?: UseQueryOptions<Report>) {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => reportsService.getById(id),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  });
}

export function useCreateReport(options?: UseMutationOptions<any, Error, any>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => reportsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Relatório criado com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao criar relatório: ${error.message}`);
    },
    ...options,
  });
}

export function useExportReport(id: string, options?: UseMutationOptions<any, Error, void>) {
  return useMutation({
    mutationFn: () => reportsService.getById(id),
    onSuccess: () => {
      toast.success('Relatório obtido com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao exportar relatório: ${error.message}`);
    },
    ...options,
  });
}
