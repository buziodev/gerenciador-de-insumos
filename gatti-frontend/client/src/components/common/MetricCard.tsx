/**
 * Metric Card Component
 * Card para exibir métricas e KPIs
 */

import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label: string;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  onClick?: () => void;
}

const colorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  green: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400',
  red: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
  yellow: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400',
  purple: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
};

export function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  color = 'blue',
  onClick,
}: MetricCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{value}</p>
              {unit && <p className="text-sm text-muted-foreground">{unit}</p>}
            </div>

            {trend && (
              <div className="flex items-center gap-1 mt-3">
                {trend.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend.value}% {trend.label}
                </span>
              </div>
            )}
          </div>

          {icon && (
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
