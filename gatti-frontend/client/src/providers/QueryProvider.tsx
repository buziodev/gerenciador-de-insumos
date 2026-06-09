/**
 * TanStack Query Provider
 * Provedor de cache e sincronização de dados
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Criar instância do QueryClient com configurações otimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tempo que os dados são considerados frescos (não faz refetch)
      staleTime: 5 * 60 * 1000, // 5 minutos

      // Tempo que os dados permanecem em cache após não serem usados
      gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)

      // Número de tentativas em caso de erro
      retry: 2,

      // Delay entre tentativas (em ms)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Não refetch automaticamente quando a janela ganha foco
      refetchOnWindowFocus: false,

      // Não refetch quando o componente é remontado
      refetchOnMount: false,

      // Não refetch quando a conexão é reconectada
      refetchOnReconnect: true,
    },
    mutations: {
      // Número de tentativas em caso de erro
      retry: 1,

      // Delay entre tentativas
      retryDelay: 1000,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };
