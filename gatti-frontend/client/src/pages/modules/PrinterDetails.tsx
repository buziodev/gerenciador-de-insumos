/**
 * Printer Details Page
 * Página de detalhes de uma impressora específica com histórico e métricas
 */
import { useParams, useLocation } from 'wouter';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit2, Trash2, AlertCircle, Activity, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function PrinterDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - será substituído por dados reais da API
  const printer = {
    id: id || '1',
    name: 'Impressora HP LaserJet Pro M404n',
    model: 'M404n',
    manufacturer: 'HP',
    ipAddress: '192.168.1.100',
    serialNumber: 'SN123456789',
    hostname: 'printer-01',
    group: 'Administrativo',
    status: 'ONLINE',
    lastSeen: '2024-06-11T12:30:00Z',
    pageCount: 125432,
    tonerLevel: 75,
    paperLevel: 90,
    errorCount: 2,
  };

  const handleEdit = () => {
    toast.info('Edição de impressora em desenvolvimento');
  };

  const handleDelete = () => {
    toast.error('Exclusão de impressora em desenvolvimento');
  };

  const handleBack = () => {
    setLocation('/printers');
  };

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{printer.name}</h1>
          <p className="text-muted-foreground">Detalhes e métricas da impressora</p>
        </div>
      </div>

      {/* Status e Ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={printer.status === 'ONLINE' ? 'default' : 'destructive'}>
            {printer.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Última atualização: {new Date(printer.lastSeen).toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Deletar
          </Button>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Modelo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{printer.model}</div>
            <p className="text-xs text-muted-foreground">{printer.manufacturer}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">IP Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{printer.ipAddress}</div>
            <p className="text-xs text-muted-foreground">{printer.hostname}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Páginas Impressas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{printer.pageCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total histórico</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Erros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{printer.errorCount}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="supplies" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Suprimentos
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Técnicas</CardTitle>
              <CardDescription>Dados técnicos da impressora</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                  <p className="text-lg font-mono">{printer.serialNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hostname</p>
                  <p className="text-lg">{printer.hostname}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Grupo</p>
                  <p className="text-lg">{printer.group}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={printer.status === 'ONLINE' ? 'default' : 'destructive'}>
                    {printer.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplies Tab */}
        <TabsContent value="supplies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nível de Suprimentos</CardTitle>
              <CardDescription>Status dos consumíveis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Toner</span>
                  <span className="text-sm text-muted-foreground">{printer.tonerLevel}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${printer.tonerLevel}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Papel</span>
                  <span className="text-sm text-muted-foreground">{printer.paperLevel}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${printer.paperLevel}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Eventos</CardTitle>
              <CardDescription>Últimos eventos da impressora</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Histórico em desenvolvimento</p>
                <p className="text-sm">Timeline de eventos será exibida aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
