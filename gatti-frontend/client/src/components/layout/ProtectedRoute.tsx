/** Proteção de rota baseada em autenticação, papel e permissão. */
import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, canAccess, hasPermission } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredResource?: string;
  requiredAction?: 'create' | 'read' | 'update' | 'delete';
}

export function ProtectedRoute({ children, requiredRoles, requiredResource, requiredAction }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }
  if (!isAuthenticated || !user) return <Redirect to="/auth/login" replace />;
  if (requiredRoles && !requiredRoles.includes(user.role)) return <Redirect to="/403" replace />;
  if (requiredResource && !canAccess(user.role, requiredResource)) return <Redirect to="/403" replace />;
  if (requiredResource && requiredAction && !hasPermission(user.role, requiredResource, requiredAction)) return <Redirect to="/403" replace />;

  return <>{children}</>;
}

export function useCanAccess(resource: string, action?: 'create' | 'read' | 'update' | 'delete') {
  const { user } = useAuth();
  if (!user) return false;
  return action ? hasPermission(user.role, resource, action) : canAccess(user.role, resource);
}

export function useHasRole(roles: UserRole[]) {
  const { user } = useAuth();
  return Boolean(user && roles.includes(user.role));
}
