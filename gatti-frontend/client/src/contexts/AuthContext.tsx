/**
 * Auth Context
 * Gerencia estado de autenticação da aplicação
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthResponse, AuthTokens, LoginRequest, User } from '@/types';
import { STORAGE_KEYS } from '@/config/api';
import { apiClient } from '@/config/api';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedTokens = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedTokens && storedUser) {
          setTokens({
            accessToken: storedTokens,
            refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || '',
          });
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erro ao carregar autenticação armazenada:', error);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const { accessToken, refreshToken, user: userData } = response.data;

      // Armazenar tokens e usuário
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      // Atualizar estado
      setTokens({ accessToken, refreshToken });
      setUser(userData);

      toast.success('Login realizado com sucesso');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Fazer logout na API
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Ignorar erros de logout na API
        console.error('Erro ao fazer logout na API:', error);
      }

      // Limpar localStorage
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      // Limpar estado
      setTokens(null);
      setUser(null);

      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      if (!tokens?.refreshToken) {
        throw new Error('Refresh token não disponível');
      }

      const response = await apiClient.post<AuthResponse>('/auth/refresh', {
        refreshToken: tokens.refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken, user: userData } = response.data;

      // Atualizar tokens
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      setTokens({ accessToken, refreshToken: newRefreshToken });
      setUser(userData);
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      // Se refresh falhar, fazer logout
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens,
    isLoading,
    login,
    logout,
    refreshToken,
    setUser,
    setTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
