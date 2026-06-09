/**
 * useApi Hook
 * Hook customizado para chamadas à API com tratamento de erro e loading
 */

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: AxiosError | null;
}

interface UseApiOptions {
  showError?: boolean;
  showSuccess?: boolean;
  successMessage?: string;
}

export function useApi<T>(options: UseApiOptions = {}) {
  const { showError = true, showSuccess = false, successMessage = '' } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<T>) => {
      try {
        setState({ data: null, isLoading: true, error: null });
        const result = await apiCall();
        setState({ data: result, isLoading: false, error: null });
        
        if (showSuccess && successMessage) {
          toast.success(successMessage);
        }
        
        return result;
      } catch (error) {
        const axiosError = error as AxiosError;
        setState({ data: null, isLoading: false, error: axiosError });
        
        if (showError) {
          const message = (axiosError.response?.data as any)?.message || 'Erro ao processar requisição';
          toast.error(message);
        }
        
        throw error;
      }
    },
    [showError, showSuccess, successMessage]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * usePaginatedApi Hook
 * Hook para requisições paginadas
 */

interface UsePaginatedApiState<T> {
  data: T[];
  total: number;
  pages: number;
  isLoading: boolean;
  error: AxiosError | null;
}

interface UsePaginatedApiOptions {
  initialPage?: number;
  pageSize?: number;
  showError?: boolean;
}

export function usePaginatedApi<T>(
  apiCall: (skip: number, take: number) => Promise<{ data: T[]; pagination: { total: number; pages: number } }>,
  options: UsePaginatedApiOptions = {}
) {
  const { initialPage = 0, pageSize = 10, showError = true } = options;

  const [state, setState] = useState<UsePaginatedApiState<T>>({
    data: [],
    total: 0,
    pages: 0,
    isLoading: false,
    error: null,
  });

  const [currentPage, setCurrentPage] = useState(initialPage);

  const loadPage = useCallback(
    async (page: number) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const skip = page * pageSize;
        const result = await apiCall(skip, pageSize);
        
        setState({
          data: result.data,
          total: result.pagination.total,
          pages: result.pagination.pages,
          isLoading: false,
          error: null,
        });
        
        setCurrentPage(page);
      } catch (error) {
        const axiosError = error as AxiosError;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: axiosError,
        }));
        
        if (showError) {
          const message = (axiosError.response?.data as any)?.message || 'Erro ao carregar dados';
          toast.error(message);
        }
      }
    },
    [apiCall, pageSize, showError]
  );

  const nextPage = useCallback(() => {
    if (currentPage < state.pages - 1) {
      loadPage(currentPage + 1);
    }
  }, [currentPage, state.pages, loadPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      loadPage(currentPage - 1);
    }
  }, [currentPage, loadPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < state.pages) {
      loadPage(page);
    }
  }, [state.pages, loadPage]);

  return {
    ...state,
    currentPage,
    loadPage,
    nextPage,
    prevPage,
    goToPage,
  };
}

/**
 * useAsyncEffect Hook
 * Hook para executar efeitos assincronos com tratamento de erro
 */

import { useEffect, useRef } from 'react';

export function useAsyncEffect(
  effect: () => Promise<void>,
  deps?: React.DependencyList
) {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const executeEffect = async () => {
      try {
        if (isMountedRef.current) {
          await effect();
        }
      } catch (error) {
        if (isMountedRef.current) {
          console.error('Erro em useAsyncEffect:', error);
        }
      }
    };

    executeEffect();

    return () => {
      isMountedRef.current = false;
    };
  }, deps);
}

/**
 * useDebounce Hook
 * Hook para debounce de valores
 */

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useLocalStorage Hook
 * Hook para gerenciar dados no localStorage
 */

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Erro ao ler localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Erro ao escrever localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}
