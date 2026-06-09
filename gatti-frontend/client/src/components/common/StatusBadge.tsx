/**
 * Status Badge Component
 * Badge para exibir status com cores
 */

import { Badge } from '@/components/ui/badge';
import {
  AlertSeverity,
  AlertType,
  MaintenanceStatus,
  MaintenanceType,
  MovementType,
  PrinterStatus,
  SupplyType,
  TonerColor,
} from '@/types';
import {
  ALERT_SEVERITY_COLORS,
  ALERT_SEVERITY_LABELS,
  ALERT_TYPE_LABELS,
  MAINTENANCE_STATUS_COLORS,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_TYPE_LABELS,
  MOVEMENT_TYPE_COLORS,
  MOVEMENT_TYPE_LABELS,
  PRINTER_STATUS_COLORS,
  PRINTER_STATUS_LABELS,
  SUPPLY_TYPE_LABELS,
  TONER_COLOR_LABELS,
} from '@/constants';

interface StatusBadgeProps {
  type: 'printer' | 'alert' | 'maintenance' | 'movement' | 'supply' | 'toner' | 'severity';
  value: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function StatusBadge({ type, value, variant = 'default' }: StatusBadgeProps) {
  let label = value;
  let className = '';

  switch (type) {
    case 'printer':
      label = PRINTER_STATUS_LABELS[value as PrinterStatus] || value;
      className = PRINTER_STATUS_COLORS[value as PrinterStatus] || '';
      break;

    case 'alert':
      label = ALERT_TYPE_LABELS[value as AlertType] || value;
      break;

    case 'severity':
      label = ALERT_SEVERITY_LABELS[value as AlertSeverity] || value;
      className = ALERT_SEVERITY_COLORS[value as AlertSeverity] || '';
      break;

    case 'maintenance':
      label = MAINTENANCE_STATUS_LABELS[value as MaintenanceStatus] || value;
      className = MAINTENANCE_STATUS_COLORS[value as MaintenanceStatus] || '';
      break;

    case 'movement':
      label = MOVEMENT_TYPE_LABELS[value as MovementType] || value;
      className = MOVEMENT_TYPE_COLORS[value as MovementType] || '';
      break;

    case 'supply':
      label = SUPPLY_TYPE_LABELS[value as SupplyType] || value;
      break;

    case 'toner':
      label = TONER_COLOR_LABELS[value as TonerColor] || value;
      break;
  }

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}

/**
 * Inline Status Component
 * Exibe status com ícone e cor
 */

import { Circle } from 'lucide-react';

interface InlineStatusProps {
  status: PrinterStatus | AlertSeverity | MaintenanceStatus;
  label?: string;
}

const statusColorMap: Record<string, string> = {
  ONLINE: 'text-green-600',
  OFFLINE: 'text-red-600',
  MAINTENANCE: 'text-yellow-600',
  ERROR: 'text-red-600',
  INFO: 'text-blue-600',
  WARNING: 'text-yellow-600',
  CRITICAL: 'text-red-600',
  PENDING: 'text-yellow-600',
  IN_PROGRESS: 'text-blue-600',
  COMPLETED: 'text-green-600',
  CANCELLED: 'text-gray-600',
};

export function InlineStatus({ status, label }: InlineStatusProps) {
  const color = statusColorMap[status] || 'text-gray-600';

  return (
    <div className="flex items-center gap-2">
      <Circle className={`w-2 h-2 fill-current ${color}`} />
      <span className="text-sm font-medium">{label || status}</span>
    </div>
  );
}
