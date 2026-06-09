/**
 * Printers Page
 * Página de gerenciamento de impressoras
 */

import { useState } from 'react';
import { Printer } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePrinterSchema, CreatePrinterFormData } from '@/lib/schemas';
import { useApi } from '@/hooks/useApi';
import { printersService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DataTable } from '@/components/tables/DataTable';
import { MetricCard } from '@/components/common/MetricCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FormField } from '@/components/forms/FormField';
import { Plus, Trash2, Edit2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function PrintersPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false });

  const { control, handleSubmit, reset } = useForm<CreatePrinterFormData>({
    resolver: zodResolver(CreatePrinterSchema),
  });

  // Carregar impressoras
  const loadPrinters = async () => {
    try {
      setIsLoading(true);
      const data = await printersService.list({ skip: 0, take: 10 });
      setPrinters(data.data);
    } catch (error) {
      toast.error('Erro ao carregar impressoras');
    } finally {
      setIsLoading(false);
    }
  };

  // Criar impressora
  const onSubmit = async (data: CreatePrinterFormData) => {
    try {
      setIsLoading(true);
      if (selectedPrinter) {
        await printersService.update(selectedPrinter.id, data);
        toast.success('Impressora atualizada com sucesso');
      } else {
        await printersService.create(data);
        toast.success('Impressora criada com sucesso');
      }
      setOpenDialog(false);
      reset();
      loadPrinters();
    } catch (error) {
      toast.error('Erro ao salvar impressora');
    } finally {
      setIsLoading(false);
    }
  };

  // Deletar impressora
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await printersService.delete(id);
      toast.success('Impressora deletada com sucesso');
      setDeleteConfirm({ open: false });
      loadPrinters();
    } catch (error) {
      toast.error('Erro ao deletar impressora');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Impressoras</h1>
          <p className="text-muted-foreground">Gerenciamento de impressoras e suprimentos</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelectedPrinter(null); reset(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Impressora
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedPrinter ? 'Editar Impressora' : 'Nova Impressora'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="name"
                control={control}
                label="Nome"
                placeholder="Ex: Impressora Sala 1"
                required
              />
              <FormField
                name="model"
                control={control}
                label="Modelo"
                placeholder="Ex: HP LaserJet Pro"
                required
              />
              <FormField
                name="serialNumber"
                control={control}
                label="Número de Série"
                placeholder="Ex: SN123456"
                required
              />
              <FormField
                name="ipAddress"
                control={control}
                label="Endereço IP"
                placeholder="Ex: 192.168.1.100"
                required
              />
              <FormField
                name="sectorId"
                control={control}
                label="Setor"
                type="select"
                options={[
                  { label: 'Administrativo', value: '1' },
                  { label: 'Financeiro', value: '2' },
                  { label: 'Operacional', value: '3' },
                ]}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {selectedPrinter ? 'Atualizar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Impressoras"
          value={printers.length}
          icon={<Plus className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Online"
          value={printers.filter((p: any) => p.status === 'ONLINE').length}
          color="green"
        />
        <MetricCard
          title="Offline"
          value={printers.filter((p: any) => p.status === 'OFFLINE').length}
          color="red"
        />
        <MetricCard
          title="Em Manutenção"
          value={printers.filter((p: any) => p.status === 'MAINTENANCE').length}
          color="yellow"
        />
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Impressoras</CardTitle>
          <CardDescription>Gerenciar todas as impressoras da empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'name' as const, label: 'Nome' },
              { key: 'model' as const, label: 'Modelo' },
              { key: 'ipAddress' as const, label: 'IP' },
              {
                key: 'status' as const,
                label: 'Status',
                render: (value) => <StatusBadge type="printer" value={value} />,
              },
            ]}
            data={printers}
            isLoading={isLoading}
            isEmpty={printers.length === 0}
            emptyMessage="Nenhuma impressora cadastrada"
            actions={[
              {
                label: 'Editar',
                onClick: (row: any) => {
                  setSelectedPrinter(row);
                  setOpenDialog(true);
                },
                variant: 'ghost',
              },
              {
                label: 'Deletar',
                onClick: (row: any) => {
                  setDeleteConfirm({ open: true, id: row.id });
                },
                variant: 'destructive',
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Deletar Impressora"
        description="Tem certeza que deseja deletar esta impressora? Esta ação não pode ser desfeita."
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false })}
        isLoading={isLoading}
        confirmText="Deletar"
        variant="destructive"
      />
    </div>
  );
}
