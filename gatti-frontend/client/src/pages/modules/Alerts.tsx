/** Página de alertas alinhada ao modelo Alert e aos métodos PATCH da API. */
import { useState } from 'react';
import { CheckCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAlerts } from '@/hooks/useQueries';
import { alertsService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertSeverity } from '@/types';

const severityVariant = (severity: AlertSeverity): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (severity === AlertSeverity.CRITICAL) return 'destructive';
  if (severity === AlertSeverity.WARNING) return 'secondary';
  return 'outline';
};

export default function AlertsPage() {
  const { user } = useAuth();
  const { data, isLoading, refetch } = useAlerts();
  const alerts = data?.data ?? [];
  const [search, setSearch] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const filteredAlerts = alerts.filter((alert) => `${alert.message} ${alert.type}`.toLowerCase().includes(search.toLowerCase()));

  const acknowledge = async (alert: Alert) => {
    if (!user?.id) { toast.error('Não foi possível identificar o usuário atual.'); return; }
    try { setPendingId(alert.id); await alertsService.acknowledge(alert.id, user.id); toast.success('Alerta reconhecido.'); await refetch(); } catch { toast.error('Não foi possível reconhecer o alerta.'); } finally { setPendingId(null); }
  };
  const resolve = async (alert: Alert) => {
    try { setPendingId(alert.id); await alertsService.resolve(alert.id); toast.success('Alerta resolvido.'); await refetch(); } catch { toast.error('Não foi possível resolver o alerta.'); } finally { setPendingId(null); }
  };

  return <div className="space-y-6"><div><h1 className="text-3xl font-bold">Alertas</h1><p className="text-muted-foreground">Acompanhe e trate alertas operacionais do sistema.</p></div><Card><CardHeader><CardTitle>Alertas do sistema</CardTitle><CardDescription>{filteredAlerts.length} alerta(s) encontrado(s).</CardDescription></CardHeader><CardContent className="space-y-4"><div className="relative max-w-lg"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por mensagem ou tipo" /></div><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Mensagem</TableHead><TableHead>Severidade</TableHead><TableHead>Status</TableHead><TableHead>Criado em</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={5} className="text-center">Carregando…</TableCell></TableRow> : null}{!isLoading && filteredAlerts.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum alerta encontrado.</TableCell></TableRow> : null}{!isLoading && filteredAlerts.map((alert) => { const isResolved = Boolean(alert.resolvedAt) || !alert.isActive; const isAcknowledged = Boolean(alert.acknowledgedAt); return <TableRow key={alert.id}><TableCell className="font-medium">{alert.message}</TableCell><TableCell><Badge variant={severityVariant(alert.severity)}>{alert.severity}</Badge></TableCell><TableCell><Badge variant={isResolved ? 'outline' : 'default'}>{isResolved ? 'Resolvido' : 'Ativo'}</Badge></TableCell><TableCell>{new Date(alert.createdAt).toLocaleString('pt-BR')}</TableCell><TableCell className="space-x-2 text-right">{!isAcknowledged && !isResolved ? <Button size="sm" variant="outline" disabled={pendingId === alert.id} onClick={() => void acknowledge(alert)}><CheckCircle className="mr-1 h-4 w-4" />Reconhecer</Button> : null}{!isResolved ? <Button size="sm" variant="outline" disabled={pendingId === alert.id} onClick={() => void resolve(alert)}>Resolver</Button> : null}</TableCell></TableRow>; })}</TableBody></Table></div></CardContent></Card></div>;
}
