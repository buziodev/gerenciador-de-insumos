/** Página de relatórios alinhada ao recurso Report disponível na API. */
import { useState } from 'react';
import { Download, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useReports } from '@/hooks/useQueries';
import { reportsService } from '@/services/api';
import { ReportType } from '@/types';
import { useCanAccess } from '@/components/layout/ProtectedRoute';

const REPORT_LABELS: Record<ReportType, string> = {
  [ReportType.MONTHLY_CONSUMPTION]: 'Consumo mensal', [ReportType.ANNUAL_CONSUMPTION]: 'Consumo anual', [ReportType.COSTS]: 'Custos', [ReportType.TONER_CHANGES]: 'Trocas de toner', [ReportType.STOCK_INVENTORY]: 'Inventário de estoque', [ReportType.PRINTER_PERFORMANCE]: 'Performance de impressoras',
};

export default function ReportsPage() {
  const { data, isLoading, refetch } = useReports();
  const reports = data?.data ?? [];
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<ReportType>(ReportType.MONTHLY_CONSUMPTION);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const canCreate = useCanAccess('reports', 'create');
  const visibleReports = reports.filter((report) => `${report.title} ${report.type}`.toLowerCase().includes(search.toLowerCase()));

  const createReport = async () => {
    if (!title.trim()) { toast.error('Informe um título para solicitar o relatório.'); return; }
    try { setIsSaving(true); await reportsService.create({ type, title: title.trim(), filters: {} }); toast.success('Solicitação de relatório registrada.'); setOpen(false); setTitle(''); await refetch(); } catch { toast.error('Não foi possível registrar a solicitação de relatório.'); } finally { setIsSaving(false); }
  };

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-bold">Relatórios</h1><p className="text-muted-foreground">Solicite relatórios e acesse os arquivos finalizados.</p></div>{canCreate ? <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Novo relatório</Button> : null}</div><Card><CardHeader><CardTitle>Relatórios disponíveis</CardTitle><CardDescription>{visibleReports.length} relatório(s) encontrado(s).</CardDescription></CardHeader><CardContent className="space-y-4"><div className="relative max-w-lg"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título ou tipo" /></div><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Tipo</TableHead><TableHead>Gerado em</TableHead><TableHead className="text-right">Arquivo</TableHead></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={4} className="text-center">Carregando…</TableCell></TableRow> : null}{!isLoading && visibleReports.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum relatório encontrado.</TableCell></TableRow> : null}{!isLoading && visibleReports.map((report) => <TableRow key={report.id}><TableCell className="font-medium">{report.title}</TableCell><TableCell>{REPORT_LABELS[report.type]}</TableCell><TableCell>{new Date(report.generatedAt || report.createdAt).toLocaleString('pt-BR')}</TableCell><TableCell className="text-right">{report.fileUrl ? <Button asChild size="sm" variant="outline"><a href={report.fileUrl} target="_blank" rel="noreferrer"><Download className="mr-1 h-4 w-4" />Baixar</a></Button> : <span className="text-sm text-muted-foreground">Em processamento</span>}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Solicitar relatório</DialogTitle><DialogDescription>A API registra a solicitação; o arquivo só fica disponível quando `fileUrl` for preenchido pelo processamento do backend.</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="report-title">Título</Label><Input id="report-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Inventário — junho de 2026" /></div><div className="space-y-2"><Label>Tipo</Label><Select value={type} onValueChange={(value) => setType(value as ReportType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(REPORT_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button disabled={isSaving} onClick={() => void createReport()}>{isSaving ? 'Solicitando…' : 'Solicitar'}</Button></div></DialogContent></Dialog></div>;
}
