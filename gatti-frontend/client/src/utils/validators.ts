/**
 * Utilitários de Validação
 */

import { EMAIL_REGEX, HOSTNAME_REGEX, IP_ADDRESS_REGEX, PASSWORD_MIN_LENGTH } from '@/constants';

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Valida senha
 */
export function isValidPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH;
}

/**
 * Valida hostname
 */
export function isValidHostname(hostname: string): boolean {
  return HOSTNAME_REGEX.test(hostname);
}

/**
 * Valida endereço IP
 */
export function isValidIPAddress(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Valida URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida número positivo
 */
export function isPositiveNumber(value: any): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

/**
 * Valida número não-negativo
 */
export function isNonNegativeNumber(value: any): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Valida percentual (0-100)
 */
export function isValidPercent(value: any): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 100;
}

/**
 * Valida data ISO
 */
export function isValidISODate(date: string): boolean {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Valida data anterior a outra
 */
export function isDateBefore(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return d1 < d2;
}

/**
 * Valida data posterior a outra
 */
export function isDateAfter(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return d1 > d2;
}

/**
 * Valida data entre duas datas
 */
export function isDateBetween(date: string | Date, startDate: string | Date, endDate: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return d >= start && d <= end;
}

/**
 * Valida string não vazia
 */
export function isNotEmpty(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida comprimento de string
 */
export function isValidLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

/**
 * Valida array não vazio
 */
export function isNotEmptyArray(arr: any[]): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Valida objeto não vazio
 */
export function isNotEmptyObject(obj: any): boolean {
  return typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0;
}

/**
 * Valida CPF
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[9]) !== firstDigit) return false;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  return parseInt(cleaned[10]) === secondDigit;
}

/**
 * Valida CNPJ
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleaned)) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  let multiplier = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[12]) !== firstDigit) return false;

  // Calcula segundo dígito verificador
  sum = 0;
  multiplier = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  return parseInt(cleaned[13]) === secondDigit;
}

/**
 * Valida telefone
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Valida CEP
 */
export function isValidCEP(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
}

/**
 * Valida força de senha
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' | 'very-strong' {
  if (password.length < 8) return 'weak';

  let strength = 0;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  if (strength <= 1) return 'weak';
  if (strength === 2) return 'medium';
  if (strength === 3) return 'strong';
  return 'very-strong';
}

/**
 * Valida compatibilidade de modelo
 */
export function isCompatibleModel(model: string, compatibleModels: string[]): boolean {
  return compatibleModels.some((compatible) =>
    compatible.toLowerCase().includes(model.toLowerCase()) ||
    model.toLowerCase().includes(compatible.toLowerCase())
  );
}

/**
 * Valida quantidade de estoque
 */
export function isValidStockQuantity(quantity: number, minimumLevel: number, maximumLevel: number): boolean {
  return quantity >= minimumLevel && quantity <= maximumLevel;
}

/**
 * Valida nível crítico de estoque
 */
export function isCriticalStock(quantity: number, minimumLevel: number): boolean {
  return quantity <= minimumLevel;
}
