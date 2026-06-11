import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useStockMovements } from '@/hooks/useQueries';
import { apiClient } from '@/config/api';

export default function StockPage() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState<'entrada' | 'saida'>('entrada');

  const { data: stock = [], isLoading, refetch } = useStockMovements();

  const handleMovement = async (supplyId: string) => {
    try {
      await apiClient.post(`/stock/movements`, {
        supplyId,
        quantity: parseInt(quantity),
        type,
        notes: 'Movimentação manual',
      });
      toast.success('Movimentação registrada com sucesso');
      setOpen(false);
      setQuantity('');
      refetch();
    } catch (error) {
      toast.error('Erro ao registrar movimentação');
    }
  };

  const filteredStock = (Array.isArray(stock) ? stock : stock?.data || []).filter((item: any) =>
    item.supply?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Estoque</h1>
          <p className="text-muted-foreground">Gerencie movimentações de estoque</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Movimentação
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações de Estoque</CardTitle>
          <CardDescription>Total: {filteredStock.length} registros</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por suprimento..."
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
                  <TableHead>Suprimento</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Nenhuma movimentação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStock.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.supply?.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.type === 'entrada' ? '📥 Entrada' : '📤 Saída'}</TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
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
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>Registre uma movimentação de estoque</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={type === 'entrada' ? 'default' : 'outline'}
                  onClick={() => setType('entrada')}
                >
                  📥 Entrada
                </Button>
                <Button
                  variant={type === 'saida' ? 'default' : 'outline'}
                  onClick={() => setType('saida')}
                >
                  📤 Saída
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => handleMovement('')}>
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
