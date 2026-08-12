/**
 * Dashboard GATTI — visão operacional baseada somente em dados realmente retornados pela API.
 * Design: cartões informativos claros, hierarquia administrativa e estados vazios honestos.
 */
import { useQueries } from '@tanstack/react-query';
import { AlertCircle, Package, Printer, TriangleAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/common/MetricCard';
import { alertsService, printersService, stockService } from '@/services/api';
import { Printer as PrinterEntity, PrinterStatus } from '@/types';

const STATUS_LABELS: Record<PrinterStatus, string> = {
  [PrinterStatus.ONLINE]: 'Online',
  [PrinterStatus.OFFLINE]: 'Offline',
  [PrinterStatus.MAINTENANCE]: 'Em manutenção',
  [PrinterStatus.ERROR]: 'Com erro',
};

export default function Dashboard() {
  const [printersQuery, alertsQuery, criticalStockQuery] = useQueries({
    queries: [
      { queryKey: ['dashboard-printers'], queryFn: () => printersService.list({ skip: 0, take: 100 }), staleTime: 60_000 },
      { queryKey: ['dashboard-active-alerts'], queryFn: alertsService.getActive, staleTime: 30_000 },
      { queryKey: ['dashboard-critical-stock'], queryFn: stockService.getCritical, staleTime: 60_000 },
    ],
  });

  const printers = printersQuery.data?.data ?? [];
  const activeAlerts = alertsQuery.data ?? [];
  const criticalStock = criticalStockQuery.data ?? [];
  const onlinePrinters = printers.filter((printer) => printer.status === PrinterStatus.ONLINE).length;
  const problemPrinters = printers.filter((printer) => printer.status !== PrinterStatus.ONLINE);
  const isLoading = printersQuery.isLoading || alertsQuery.isLoading || criticalStockQuery.isLoading;
  const metricValue = (value: number) => (isLoading ? '—' : value);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral baseada nos registros operacionais disponíveis.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total de impressoras" value={metricValue(printers.length)} icon={<Printer className="h-6 w-6" />} color="blue" />
        <MetricCard title="Impressoras online" value={metricValue(onlinePrinters)} unit={isLoading ? undefined : `de ${printers.length}`} icon={<Printer className="h-6 w-6" />} color="green" />
        <MetricCard title="Alertas ativos" value={metricValue(activeAlerts.length)} icon={<AlertCircle className="h-6 w-6" />} color="red" />
        <MetricCard title="Estoque crítico" value={metricValue(criticalStock.length)} icon={<Package className="h-6 w-6" />} color="yellow" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Alertas ativos recentes</CardTitle><CardDescription>Registros ativos retornados pela API.</CardDescription></CardHeader>
          <CardContent>
            {alertsQuery.isLoading ? <p className="text-sm text-muted-foreground">Carregando alertas…</p> : null}
            {!alertsQuery.isLoading && activeAlerts.length === 0 ? <p className="text-sm text-muted-foreground">Não há alertas ativos.</p> : null}
            <div className="space-y-4">{activeAlerts.slice(0, 5).map((alert) => <div key={alert.id} className="flex gap-3 border-b pb-3 last:border-0"><TriangleAlert className="mt-0.5 h-4 w-4 text-destructive" /><div><p className="font-medium">{alert.message}</p><p className="text-sm text-muted-foreground">{alert.severity} · {new Date(alert.createdAt).toLocaleString('pt-BR')}</p></div></div>)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Estoque em nível crítico</CardTitle><CardDescription>Itens cujo saldo está no mínimo configurado ou abaixo dele.</CardDescription></CardHeader>
          <CardContent>
            {criticalStockQuery.isLoading ? <p className="text-sm text-muted-foreground">Carregando estoque…</p> : null}
            {!criticalStockQuery.isLoading && criticalStock.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum item crítico no momento.</p> : null}
            <div className="space-y-4">{criticalStock.slice(0, 5).map((stock) => <div key={stock.id} className="flex items-center justify-between border-b pb-3 last:border-0"><div><p className="font-medium">{stock.supply.name}</p><p className="text-sm text-muted-foreground">Mínimo configurado: {stock.minimumLevel}</p></div><span className="font-semibold text-destructive">{stock.quantity} un.</span></div>)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Impressoras que exigem atenção</CardTitle><CardDescription>Ativos que não estão com status online.</CardDescription></CardHeader>
        <CardContent>
          {printersQuery.isLoading ? <p className="text-sm text-muted-foreground">Carregando impressoras…</p> : null}
          {!printersQuery.isLoading && problemPrinters.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma impressora requer atenção no momento.</p> : null}
          <div className="space-y-3">{problemPrinters.slice(0, 8).map((printer: PrinterEntity) => <div key={printer.id} className="flex items-center justify-between rounded-lg bg-muted p-3"><div><p className="font-medium">{printer.name}</p><p className="text-sm text-muted-foreground">{printer.ipAddress} · {printer.model}</p></div><span className="text-sm font-medium text-destructive">{STATUS_LABELS[printer.status]}</span></div>)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
