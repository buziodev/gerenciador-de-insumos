/**
 * Dashboard Page
 * Dashboard executivo com KPIs e gráficos
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/common/MetricCard';
import { SimpleChart } from '@/components/charts/SimpleChart';
import { AlertCircle, Printer, Package, Warehouse, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalPrinters: 45,
    onlinePrinters: 42,
    alertsCount: 8,
    criticalStock: 12,
    consumptionData: [
      { date: '01/06', value: 120 },
      { date: '02/06', value: 132 },
      { date: '03/06', value: 101 },
      { date: '04/06', value: 156 },
      { date: '05/06', value: 129 },
      { date: '06/06', value: 150 },
    ],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema GATTI</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Impressoras"
          value={metrics.totalPrinters}
          icon={<Printer className="w-6 h-6" />}
          color="blue"
          trend={{ value: 5, direction: 'up', label: 'vs mês anterior' }}
        />
        <MetricCard
          title="Impressoras Online"
          value={metrics.onlinePrinters}
          unit="de 45"
          color="green"
          trend={{ value: 2, direction: 'up', label: 'aumento' }}
        />
        <MetricCard
          title="Alertas Ativos"
          value={metrics.alertsCount}
          icon={<AlertCircle className="w-6 h-6" />}
          color="red"
          trend={{ value: 3, direction: 'down', label: 'redução' }}
        />
        <MetricCard
          title="Estoque Crítico"
          value={metrics.criticalStock}
          icon={<Package className="w-6 h-6" />}
          color="yellow"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          title="Consumo de Toner (Últimos 6 dias)"
          description="Consumo total em unidades"
          data={metrics.consumptionData}
          type="line"
          color="#3b82f6"
        />
        <Card>
          <CardHeader>
            <CardTitle>Alertas Recentes</CardTitle>
            <CardDescription>Últimos alertas do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Toner crítico na Impressora {i}</p>
                    <p className="text-sm text-muted-foreground">Há {i} hora(s)</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Impressoras com Problemas */}
      <Card>
        <CardHeader>
          <CardTitle>Impressoras com Problemas</CardTitle>
          <CardDescription>Impressoras que precisam de atenção</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Impressora Sala {i}</p>
                  <p className="text-sm text-muted-foreground">Toner em {20 + i * 10}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Crítico</p>
                  <p className="text-xs text-muted-foreground">Ação necessária</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
