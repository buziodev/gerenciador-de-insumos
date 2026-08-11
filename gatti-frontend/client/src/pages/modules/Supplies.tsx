/**
 * Página de suprimentos.
 * Mantém o formulário e a tabela alinhados ao contrato Supply da API.
 */
import { useState } from 'react';
import { Plus, Pencil, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSupplies } from '@/hooks/useQueries';
import { suppliesService } from '@/services/api';
import { Supply, SupplyType } from '@/types';

type SupplyDraft = {
  name: string;
  type: SupplyType;
  manufacturer: string;
  model: string;
  compatibleModels: string;
  nominalCapacity: string;
  unitCost: string;
};

const EMPTY_DRAFT: SupplyDraft = {
  name: '',
  type: SupplyType.TONER,
  manufacturer: '',
  model: '',
  compatibleModels: '',
  nominalCapacity: '',
  unitCost: '',
};

const TYPE_LABELS: Record<SupplyType, string> = {
  [SupplyType.TONER]: 'Toner',
  [SupplyType.CYLINDER]: 'Cilindro',
  [SupplyType.FUSER]: 'Fusor',
  [SupplyType.MAINTENANCE_KIT]: 'Kit de manutenção',
  [SupplyType.SPARE_PART]: 'Peça de reposição',
};

export default function SuppliesPage() {
  const { data, isLoading, refetch } = useSupplies();
  const supplies = data?.data ?? [];
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supply | null>(null);
  const [draft, setDraft] = useState<SupplyDraft>(EMPTY_DRAFT);
  const [isSaving, setIsSaving] = useState(false);

  const filteredSupplies = supplies.filter((supply) =>
    [supply.name, supply.manufacturer, supply.model].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setOpen(true);
  };

  const openEdit = (supply: Supply) => {
    setEditing(supply);
    setDraft({
      name: supply.name,
      type: supply.type,
      manufacturer: supply.manufacturer,
      model: supply.model || '',
      compatibleModels: supply.compatibleModels.join(', '),
      nominalCapacity: String(supply.nominalCapacity),
      unitCost: String(supply.unitCost),
    });
    setOpen(true);
  };

  const saveSupply = async () => {
    const nominalCapacity = Number(draft.nominalCapacity);
    const unitCost = Number(draft.unitCost);
    if (!draft.name.trim() || !draft.manufacturer.trim() || !Number.isInteger(nominalCapacity) || nominalCapacity <= 0 || !Number.isFinite(unitCost) || unitCost <= 0) {
      toast.error('Informe nome, fabricante, capacidade inteira positiva e custo positivo.');
      return;
    }

    const payload = {
      name: draft.name.trim(),
      type: draft.type,
      manufacturer: draft.manufacturer.trim(),
      model: draft.model.trim() || undefined,
      compatibleModels: draft.compatibleModels.split(',').map((value) => value.trim()).filter(Boolean),
      nominalCapacity,
      unitCost,
    };

    try {
      setIsSaving(true);
      if (editing) {
        await suppliesService.update(editing.id, payload);
        toast.success('Suprimento atualizado com sucesso.');
      } else {
        await suppliesService.create(payload);
        toast.success('Suprimento criado com sucesso.');
      }
      setOpen(false);
      await refetch();
    } catch {
      toast.error('Não foi possível salvar o suprimento. Verifique os dados e a conexão com a API.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeSupply = async (supply: Supply) => {
    if (!window.confirm(`Excluir o suprimento “${supply.name}”?`)) return;
    try {
      await suppliesService.delete(supply.id);
      toast.success('Suprimento removido com sucesso.');
      await refetch();
    } catch {
      toast.error('Não foi possível remover o suprimento.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Suprimentos</h1>
          <p className="text-muted-foreground">Cadastre e acompanhe itens compatíveis com as impressoras.</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Novo suprimento</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de suprimentos</CardTitle>
          <CardDescription>{filteredSupplies.length} item(ns) encontrado(s).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, fabricante ou modelo" />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Fabricante</TableHead><TableHead>Capacidade</TableHead><TableHead>Custo</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {isLoading ? <TableRow><TableCell colSpan={6} className="text-center">Carregando…</TableCell></TableRow> : null}
                {!isLoading && filteredSupplies.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum suprimento encontrado.</TableCell></TableRow> : null}
                {!isLoading && filteredSupplies.map((supply) => <TableRow key={supply.id}>
                  <TableCell className="font-medium">{supply.name}</TableCell><TableCell>{TYPE_LABELS[supply.type]}</TableCell><TableCell>{supply.manufacturer}</TableCell><TableCell>{supply.nominalCapacity.toLocaleString('pt-BR')} pág.</TableCell><TableCell>{supply.unitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  <TableCell className="text-right"><Button size="icon" variant="ghost" aria-label={`Editar ${supply.name}`} onClick={() => openEdit(supply)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label={`Excluir ${supply.name}`} onClick={() => void removeSupply(supply)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>{editing ? 'Editar suprimento' : 'Novo suprimento'}</DialogTitle><DialogDescription>Os campos seguem o contrato da API de suprimentos.</DialogDescription></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="supply-name">Nome</Label><Input id="supply-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></div>
            <div className="space-y-2"><Label>Tipo</Label><Select value={draft.type} onValueChange={(value) => setDraft({ ...draft, type: value as SupplyType })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="supply-manufacturer">Fabricante</Label><Input id="supply-manufacturer" value={draft.manufacturer} onChange={(event) => setDraft({ ...draft, manufacturer: event.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="supply-model">Modelo</Label><Input id="supply-model" value={draft.model} onChange={(event) => setDraft({ ...draft, model: event.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="supply-capacity">Capacidade nominal (páginas)</Label><Input id="supply-capacity" type="number" min="1" value={draft.nominalCapacity} onChange={(event) => setDraft({ ...draft, nominalCapacity: event.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="supply-cost">Custo unitário</Label><Input id="supply-cost" type="number" min="0.01" step="0.01" value={draft.unitCost} onChange={(event) => setDraft({ ...draft, unitCost: event.target.value })} /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="supply-compatible">Modelos compatíveis</Label><Input id="supply-compatible" value={draft.compatibleModels} onChange={(event) => setDraft({ ...draft, compatibleModels: event.target.value })} placeholder="Separe os modelos por vírgula" /></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button disabled={isSaving} onClick={() => void saveSupply()}>{isSaving ? 'Salvando…' : 'Salvar'}</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
