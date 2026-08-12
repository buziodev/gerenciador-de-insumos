/** Página de movimentações de estoque alinhada ao DTO CreateStockMovement. */
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStockMovements, useSupplies } from '@/hooks/useQueries';
import { stockService } from '@/services/api';
import { MovementType } from '@/types';

const MOVEMENT_LABELS: Record<MovementType, string> = {
  [MovementType.ENTRY]: 'Entrada', [MovementType.EXIT]: 'Saída', [MovementType.TRANSFER]: 'Transferência', [MovementType.ADJUSTMENT]: 'Ajuste', [MovementType.LOSS]: 'Perda',
};

export default function StockPage() {
  const { data: movementResponse, isLoading, refetch } = useStockMovements();
  const { data: supplyResponse, isLoading: isLoadingSupplies } = useSupplies();
  const movements = movementResponse?.data ?? [];
  const supplies = supplyResponse?.data ?? [];
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [supplyId, setSupplyId] = useState('');
  const [type, setType] = useState<MovementType>(MovementType.ENTRY);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const visibleMovements = movements.filter((movement) => movement.supply?.name.toLowerCase().includes(search.toLowerCase()));

  const resetDialog = () => { setSupplyId(''); setType(MovementType.ENTRY); setQuantity(''); setReason(''); };
  const saveMovement = async () => {
    const parsedQuantity = Number(quantity);
    if (!supplyId || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      toast.error('Selecione um suprimento e informe uma quantidade inteira positiva.');
      return;
    }
    try {
      setIsSaving(true);
      await stockService.createMovement({ supplyId, type, quantity: parsedQuantity, reason: reason.trim() || undefined });
      toast.success('Movimentação registrada com sucesso.');
      setOpen(false);
      resetDialog();
      await refetch();
    } catch {
      toast.error('Não foi possível registrar a movimentação.');
    } finally { setIsSaving(false); }
  };

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-3xl font-bold">Estoque</h1><p className="text-muted-foreground">Registre entradas, saídas e demais movimentações de suprimentos.</p></div><Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Nova movimentação</Button></div>
    <Card><CardHeader><CardTitle>Movimentações</CardTitle><CardDescription>{visibleMovements.length} registro(s) encontrado(s).</CardDescription></CardHeader><CardContent className="space-y-4"><div className="relative max-w-lg"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por suprimento" /></div><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Suprimento</TableHead><TableHead>Quantidade</TableHead><TableHead>Tipo</TableHead><TableHead>Motivo</TableHead><TableHead>Data</TableHead></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={5} className="text-center">Carregando…</TableCell></TableRow> : null}{!isLoading && visibleMovements.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma movimentação encontrada.</TableCell></TableRow> : null}{!isLoading && visibleMovements.map((movement) => <TableRow key={movement.id}><TableCell className="font-medium">{movement.supply?.name || movement.supplyId}</TableCell><TableCell>{movement.quantity}</TableCell><TableCell>{MOVEMENT_LABELS[movement.type]}</TableCell><TableCell>{movement.reason || '—'}</TableCell><TableCell>{new Date(movement.createdAt).toLocaleString('pt-BR')}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>
    <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) resetDialog(); }}><DialogContent><DialogHeader><DialogTitle>Nova movimentação</DialogTitle><DialogDescription>Os dados serão enviados ao endpoint transacional de estoque.</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>Suprimento</Label><Select value={supplyId} onValueChange={setSupplyId} disabled={isLoadingSupplies}><SelectTrigger><SelectValue placeholder={isLoadingSupplies ? 'Carregando suprimentos…' : 'Selecione um suprimento'} /></SelectTrigger><SelectContent>{supplies.map((supply) => <SelectItem key={supply.id} value={supply.id}>{supply.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Tipo</Label><Select value={type} onValueChange={(value) => setType(value as MovementType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(MOVEMENT_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="stock-quantity">Quantidade</Label><Input id="stock-quantity" type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="stock-reason">Motivo</Label><Input id="stock-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Opcional" /></div></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button disabled={isSaving} onClick={() => void saveMovement()}>{isSaving ? 'Registrando…' : 'Registrar'}</Button></div></DialogContent></Dialog>
  </div>;
}
