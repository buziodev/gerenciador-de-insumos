/**
 * Utilitários de Formatação
 */

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata data ISO para formato brasileiro
 */
export function formatDate(date: string | Date, formatStr = 'dd/MM/yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: ptBR });
  } catch {
    return '';
  }
}

/**
 * Formata data e hora ISO para formato brasileiro
 */
export function formatDateTime(date: string | Date, formatStr = 'dd/MM/yyyy HH:mm'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: ptBR });
  } catch {
    return '';
  }
}

/**
 * Formata hora ISO para formato brasileiro
 */
export function formatTime(date: string | Date, formatStr = 'HH:mm'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: ptBR });
  } catch {
    return '';
  }
}

/**
 * Formata moeda em Real
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata número com separadores de milhar
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formata percentual
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Formata tamanho de arquivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return formatNumber(bytes / Math.pow(k, i), 2) + ' ' + sizes[i];
}

/**
 * Formata duração em segundos para HH:mm:ss
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((val) => String(val).padStart(2, '0'))
    .join(':');
}

/**
 * Formata duração em dias para texto legível
 */
export function formatDurationDays(days: number): string {
  if (days < 1) return 'Menos de 1 dia';
  if (days === 1) return '1 dia';
  if (days < 30) return `${days} dias`;
  if (days < 365) return `${Math.floor(days / 30)} meses`;
  return `${Math.floor(days / 365)} anos`;
}

/**
 * Trunca texto com elipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Capitaliza primeira letra
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Converte camelCase para Title Case
 */
export function camelCaseToTitleCase(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Formata nome completo
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Formata email para exibição (trunca se muito longo)
 */
export function formatEmail(email: string): string {
  return truncateText(email, 50);
}

/**
 * Formata endereço IP
 */
export function formatIPAddress(ip: string): string {
  return ip;
}

/**
 * Formata hostname
 */
export function formatHostname(hostname: string): string {
  return hostname.toLowerCase();
}

/**
 * Formata modelo de impressora
 */
export function formatPrinterModel(manufacturer: string, model: string): string {
  return `${manufacturer} ${model}`.trim();
}

/**
 * Formata nível de toner com cor
 */
export function formatTonerLevel(level: number): string {
  if (level >= 75) return 'Bom';
  if (level >= 50) return 'Médio';
  if (level >= 25) return 'Baixo';
  return 'Crítico';
}

/**
 * Formata status com ícone
 */
export function getStatusIcon(status: string): string {
  const statusMap: Record<string, string> = {
    ONLINE: '✓',
    OFFLINE: '✗',
    MAINTENANCE: '⚙',
    ERROR: '!',
    PENDING: '⏳',
    IN_PROGRESS: '▶',
    COMPLETED: '✓',
    CANCELLED: '✗',
  };
  return statusMap[status] || '-';
}

/**
 * Converte booleano para texto
 */
export function formatBoolean(value: boolean): string {
  return value ? 'Sim' : 'Não';
}

/**
 * Formata array como string separada por vírgula
 */
export function formatArray(arr: string[]): string {
  return arr.join(', ');
}

/**
 * Formata JSON para exibição
 */
export function formatJSON(obj: any): string {
  return JSON.stringify(obj, null, 2);
}

/**
 * Extrai iniciais do nome
 */
export function getInitials(firstName: string, lastName: string): string {
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

/**
 * Formata telefone
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Formata CEP
 */
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return cep;
}

/**
 * Formata CPF
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  return cpf;
}

/**
 * Formata CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  return cnpj;
}
