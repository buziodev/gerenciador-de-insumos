import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAlerts } from '@/hooks/useQueries';
import { apiClient } from '@/config/api';

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: alerts = [], isLoading, refetch } = useAlerts();

  const handleAcknowledge = async (id: string) => {
    try {
      await apiClient.put(`/alerts/${id}/acknowledge`);
      toast.success('Alerta reconhecido');
      refetch();
    } catch (error) {
      toast.error('Erro ao reconhecer alerta');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await apiClient.put(`/alerts/${id}/resolve`);
      toast.success('Alerta resolvido');
      refetch();
    } catch (error) {
      toast.error('Erro ao resolver alerta');
    }
  };

  const filteredAlerts = (Array.isArray(alerts) ? alerts : alerts?.data || []).filter((alert: any) =>
    alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alertas</h1>
          <p className="text-muted-foreground">Monitore alertas do sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas Ativos</CardTitle>
          <CardDescription>Total: {filteredAlerts.length} alertas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar alertas..."
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
                  <TableHead>Título</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhum alerta encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map((alert: any) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={alert.resolved ? 'outline' : 'default'}>
                          {alert.resolved ? 'Resolvido' : 'Ativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(alert.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="flex gap-2">
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Reconhecer
                          </Button>
                        )}
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolve(alert.id)}
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Resolver
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
