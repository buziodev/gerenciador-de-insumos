/**
 * 403 Forbidden Page
 */

import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Lock className="w-16 h-16 text-red-500" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">403</h1>
          <p className="text-xl text-muted-foreground mb-4">Acesso Negado</p>
          <p className="text-muted-foreground max-w-md mx-auto">
            Você não tem permissão para acessar este recurso. Entre em contato com o administrador se acredita que isso é um erro.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => window.history.back()}>Voltar</Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Ir para Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
