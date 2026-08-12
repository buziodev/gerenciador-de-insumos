/** Página de impressoras alinhada aos contratos CreatePrinterRequest e UpdatePrinterRequest. */
import { useEffect, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { printersService } from '@/services/api';
import { Printer, PrinterStatus } from '@/types';
import { useCanAccess } from '@/components/layout/ProtectedRoute';

type PrinterDraft = {
  zabbixHostId: string;
  name: string;
  hostname: string;
  ipAddress: string;
  model: string;
  manufacturer: string;
  group: string;
  serialNumber: string;
  sectorId: string;
  status: PrinterStatus;
};

const EMPTY_DRAFT: PrinterDraft = {
  zabbixHostId: '', name: '', hostname: '', ipAddress: '', model: '', manufacturer: '', group: '', serialNumber: '', sectorId: '', status: PrinterStatus.ONLINE,
};

export default function PrintersPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Printer | null>(null);
  const [draft, setDraft] = useState<PrinterDraft>(EMPTY_DRAFT);
  const canCreate = useCanAccess('printers', 'create');
  const canUpdate = useCanAccess('printers', 'update');
  const canDelete = useCanAccess('printers', 'delete');

  const loadPrinters = async () => {
    try {
      setIsLoading(true);
      const response = await printersService.list({ skip: 0, take: 100 });
      setPrinters(response.data);
    } catch {
      toast.error('Não foi possível carregar as impressoras.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadPrinters(); }, []);

  const visiblePrinters = printers.filter((printer) => `${printer.name} ${printer.hostname} ${printer.model} ${printer.ipAddress}`.toLowerCase().includes(search.toLowerCase()));
  const changeDraft = <K extends keyof PrinterDraft>(key: K, value: PrinterDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const openCreate = () => { setEditing(null); setDraft(EMPTY_DRAFT); setOpen(true); };
  const openEdit = (printer: Printer) => {
    setEditing(printer);
    setDraft({ zabbixHostId: printer.zabbixHostId, name: printer.name, hostname: printer.hostname, ipAddress: printer.ipAddress, model: printer.model, manufacturer: printer.manufacturer, group: printer.group, serialNumber: printer.serialNumber || '', sectorId: printer.sectorId || '', status: printer.status });
    setOpen(true);
  };

  const savePrinter = async () => {
    const missing = [draft.zabbixHostId, draft.name, draft.hostname, draft.ipAddress, draft.model, draft.manufacturer, draft.group].some((value) => !value.trim());
    if (missing) { toast.error('Preencha todos os campos obrigatórios da impressora.'); return; }
    const payload = { ...draft, serialNumber: draft.serialNumber.trim() || undefined, sectorId: draft.sectorId.trim() || undefined };
    try {
      setIsSaving(true);
      if (editing) {
        const { zabbixHostId: _zabbixHostId, ...updatePayload } = payload;
        await printersService.update(editing.id, updatePayload);
        toast.success('Impressora atualizada com sucesso.');
      } else {
        await printersService.create(payload);
        toast.success('Impressora criada com sucesso.');
      }
      setOpen(false);
      await loadPrinters();
    } catch {
      toast.error('Não foi possível salvar a impressora. Verifique os dados e a conexão com a API.');
    } finally { setIsSaving(false); }
  };

  const removePrinter = async (printer: Printer) => {
    if (!window.confirm(`Excluir a impressora “${printer.name}”?`)) return;
    try { await printersService.delete(printer.id); toast.success('Impressora removida com sucesso.'); await loadPrinters(); }
    catch { toast.error('Não foi possível remover a impressora.'); }
  };

  const statusClass: Record<PrinterStatus, string> = { ONLINE: 'text-emerald-700 dark:text-emerald-300', OFFLINE: 'text-destructive', MAINTENANCE: 'text-amber-700 dark:text-amber-300', ERROR: 'text-destructive' };

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-bold">Impressoras</h1><p className="text-muted-foreground">Cadastre e acompanhe os ativos integrados ao Zabbix.</p></div>{canCreate ? <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nova impressora</Button> : null}</div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card><CardHeader className="pb-2"><CardDescription>Total</CardDescription><CardTitle>{printers.length}</CardTitle></CardHeader></Card><Card><CardHeader className="pb-2"><CardDescription>Online</CardDescription><CardTitle>{printers.filter((printer) => printer.status === PrinterStatus.ONLINE).length}</CardTitle></CardHeader></Card><Card><CardHeader className="pb-2"><CardDescription>Offline</CardDescription><CardTitle>{printers.filter((printer) => printer.status === PrinterStatus.OFFLINE).length}</CardTitle></CardHeader></Card><Card><CardHeader className="pb-2"><CardDescription>Em manutenção</CardDescription><CardTitle>{printers.filter((printer) => printer.status === PrinterStatus.MAINTENANCE).length}</CardTitle></CardHeader></Card></div>
    <Card><CardHeader><CardTitle>Ativos cadastrados</CardTitle><CardDescription>{visiblePrinters.length} impressora(s) encontrada(s).</CardDescription></CardHeader><CardContent className="space-y-4"><div className="relative max-w-lg"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, hostname, modelo ou IP" /></div><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Modelo</TableHead><TableHead>IP</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={5} className="text-center">Carregando…</TableCell></TableRow> : null}{!isLoading && visiblePrinters.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma impressora encontrada.</TableCell></TableRow> : null}{!isLoading && visiblePrinters.map((printer) => <TableRow key={printer.id}><TableCell className="font-medium">{printer.name}</TableCell><TableCell>{printer.manufacturer} {printer.model}</TableCell><TableCell className="font-mono text-sm">{printer.ipAddress}</TableCell><TableCell className={statusClass[printer.status]}>{printer.status}</TableCell><TableCell className="text-right">{canUpdate ? <Button size="icon" variant="ghost" aria-label={`Editar ${printer.name}`} onClick={() => openEdit(printer)}><Pencil className="h-4 w-4" /></Button> : null}{canDelete ? <Button size="icon" variant="ghost" aria-label={`Excluir ${printer.name}`} onClick={() => void removePrinter(printer)}><Trash2 className="h-4 w-4 text-destructive" /></Button> : null}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{editing ? 'Editar impressora' : 'Nova impressora'}</DialogTitle><DialogDescription>Os campos obrigatórios correspondem ao DTO de impressoras da API.</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="printer-zabbix">ID do host Zabbix</Label><Input id="printer-zabbix" value={draft.zabbixHostId} disabled={Boolean(editing)} onChange={(event) => changeDraft('zabbixHostId', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="printer-name">Nome</Label><Input id="printer-name" value={draft.name} onChange={(event) => changeDraft('name', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="printer-hostname">Hostname</Label><Input id="printer-hostname" value={draft.hostname} onChange={(event) => changeDraft('hostname', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="printer-ip">Endereço IP</Label><Input id="printer-ip" value={draft.ipAddress} onChange={(event) => changeDraft('ipAddress', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="printer-manufacturer">Fabricante</Label><Input id="printer-manufacturer" value={draft.manufacturer} onChange={(event) => changeDraft('manufacturer', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="printer-model">Modelo</Label><Input id="printer-model" value={draft.model} onChange={(event) => changeDraft('model', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="printer-group">Grupo</Label><Input id="printer-group" value={draft.group} onChange={(event) => changeDraft('group', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="printer-serial">Número de série</Label><Input id="printer-serial" value={draft.serialNumber} onChange={(event) => changeDraft('serialNumber', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="printer-sector">ID do setor</Label><Input id="printer-sector" value={draft.sectorId} onChange={(event) => changeDraft('sectorId', event.target.value)} placeholder="Opcional" /></div><div className="space-y-2"><Label>Status</Label><Select value={draft.status} onValueChange={(value) => changeDraft('status', value as PrinterStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.values(PrinterStatus).map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button disabled={isSaving} onClick={() => void savePrinter()}>{isSaving ? 'Salvando…' : 'Salvar'}</Button></div></DialogContent></Dialog>
  </div>;
}
