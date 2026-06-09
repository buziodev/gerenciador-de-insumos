/**
 * Protected Route Component
 * Protege rotas com autenticação e RBAC
 */

import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, canAccess, hasPermission } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredResource?: string;
  requiredAction?: 'create' | 'read' | 'update' | 'delete';
}

export function ProtectedRoute({
  children,
  requiredRoles,
  requiredResource,
  requiredAction,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Carregando
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Não autenticado
  if (!isAuthenticated || !user) {
    navigate('/auth/login', { replace: true });
    return null;
  }

  // Verificar roles obrigatórios
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    navigate('/403', { replace: true });
    return null;
  }

  // Verificar acesso a recurso
  if (requiredResource && !canAccess(user.role, requiredResource)) {
    navigate('/403', { replace: true });
    return null;
  }

  // Verificar permissão específica
  if (requiredResource && requiredAction) {
    if (!hasPermission(user.role, requiredResource, requiredAction)) {
      navigate('/403', { replace: true });
      return null;
    }
  }

  return <>{children}</>;
}

/**
 * Hook para verificar permissões
 */
export function useCanAccess(resource: string, action?: 'create' | 'read' | 'update' | 'delete') {
  const { user } = useAuth();

  if (!user) return false;

  if (action) {
    return hasPermission(user.role, resource, action);
  }

  return canAccess(user.role, resource);
}

/**
 * Hook para verificar se usuário tem role específico
 */
export function useHasRole(roles: UserRole[]) {
  const { user } = useAuth();

  if (!user) return false;

  return roles.includes(user.role);
}
