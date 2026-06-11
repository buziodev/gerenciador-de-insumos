import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { z } from 'zod';
import { useSupplies } from '@/hooks/useQueries';
import { apiClient } from '@/config/api';

const SupplySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  sku: z.string().min(1, 'SKU é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  description: z.string().optional().default(''),
  unitPrice: z.any().transform(v => Number(v)).refine(v => v > 0, 'Preço deve ser positivo'),
  minimumStock: z.any().transform(v => Number(v)).refine(v => v >= 0, 'Estoque mínimo deve ser não-negativo'),
});

type SupplyFormData = z.infer<typeof SupplySchema>;

export default function SuppliesPage() {

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: suppliesResponse, isLoading, refetch } = useSupplies();
  const supplies = Array.isArray(suppliesResponse) ? suppliesResponse : suppliesResponse?.data || [];

  const form = useForm<any>({
    resolver: zodResolver(SupplySchema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      description: '',
      unitPrice: 0,
      minimumStock: 0,
    },
  });

  const onSubmit = async (data: SupplyFormData) => {
    try {
      if (editingId) {
        await apiClient.put(`/supplies/${editingId}`, data);
        toast.success('Suprimento atualizado com sucesso');
      } else {
        await apiClient.post('/supplies', data);
        toast.success('Suprimento criado com sucesso');
      }
      form.reset();
      setOpen(false);
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error('Erro ao salvar suprimento');
    }
  };

  const handleEdit = (supply: any): void => {
    setEditingId(supply.id);
    form.reset(supply);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este suprimento?')) return;
    try {
      await apiClient.delete(`/supplies/${id}`);
      toast.success('Suprimento deletado com sucesso');
      refetch();
    } catch (error) {
      toast.error('Erro ao deletar suprimento');
    }
  };

  const filteredSupplies = supplies.filter((supply: any) =>
    supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supply.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Suprimentos</h1>
          <p className="text-muted-foreground">Gerencie seus suprimentos e estoque</p>
        </div>
        <Button onClick={() => { setEditingId(null); form.reset(); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Suprimento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Suprimentos</CardTitle>
          <CardDescription>Total: {filteredSupplies.length} suprimentos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço Unitário</TableHead>
                  <TableHead>Estoque Mínimo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredSupplies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhum suprimento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSupplies.map(supply => (
                    <TableRow key={supply.id}>
                      <TableCell>{supply.name}</TableCell>
                      <TableCell>{supply.sku}</TableCell>
                      <TableCell>{supply.category}</TableCell>
                      <TableCell>R$ {supply.unitPrice?.toFixed(2)}</TableCell>
                      <TableCell>{supply.minimumStock}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(supply)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(supply.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Suprimento' : 'Novo Suprimento'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do suprimento
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Ex: Toner Preto"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {typeof form.formState.errors.name === 'string' ? form.formState.errors.name : (form.formState.errors.name as any)?.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                {...form.register('sku')}
                placeholder="Ex: TONER-BK-001"
              />
              {form.formState.errors.sku && (
                <p className="text-sm text-red-500 mt-1">
                  {typeof form.formState.errors.sku === 'string' ? form.formState.errors.sku : (form.formState.errors.sku as any)?.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select value={form.watch('category')} onValueChange={(value) => form.setValue('category', value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toner">Toner</SelectItem>
                  <SelectItem value="papel">Papel</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="acessorios">Acessórios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="unitPrice">Preço Unitário (R$)</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                {...form.register('unitPrice')}
                placeholder="0.00"
              />
              {form.formState.errors.unitPrice && (
                <p className="text-sm text-red-500 mt-1">
                  {typeof form.formState.errors.unitPrice === 'string' ? form.formState.errors.unitPrice : (form.formState.errors.unitPrice as any)?.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="minimumStock">Estoque Mínimo</Label>
              <Input
                id="minimumStock"
                type="number"
                {...form.register('minimumStock')}
                placeholder="0"
              />
              {form.formState.errors.minimumStock && (
                <p className="text-sm text-red-500 mt-1">
                  {typeof form.formState.errors.minimumStock === 'string' ? form.formState.errors.minimumStock : (form.formState.errors.minimumStock as any)?.message}
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingId ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
