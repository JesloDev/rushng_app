'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type StatsColor = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'yellow' | 'emerald';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: StatsColor;
  trend?: {
    value: number;
    label?: string;
    direction?: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

const colorMap: Record<StatsColor, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-950/50', text: 'text-blue-600 dark:text-blue-400' },
  green: { bg: 'bg-green-100 dark:bg-green-950/50', text: 'text-green-600 dark:text-green-400' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-950/50', text: 'text-emerald-600 dark:text-emerald-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-950/50', text: 'text-orange-600 dark:text-orange-400' },
  red: { bg: 'bg-red-100 dark:bg-red-950/50', text: 'text-red-600 dark:text-red-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-950/50', text: 'text-purple-600 dark:text-purple-400' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-950/50', text: 'text-yellow-600 dark:text-yellow-400' },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'orange',
  trend,
  className,
}: StatsCardProps) {
  const colorStyles = colorMap[color] || colorMap.orange;

  // Determine trend direction if not explicitly supplied
  const direction = trend?.direction || (trend?.value ? (trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'neutral') : 'neutral');

  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className || ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl lg:text-3xl font-bold tracking-tight">{formattedValue}</p>

            {trend && (
              <div className="flex items-center gap-1 pt-0.5">
                {direction === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />}
                {direction === 'down' && <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
                {direction === 'neutral' && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}

                <span
                  className={`text-xs font-semibold ${
                    direction === 'up'
                      ? 'text-emerald-600'
                      : direction === 'down'
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  }`}
                >
                  {trend.value > 0 ? `+${trend.value}` : trend.value}%
                </span>

                {trend.label && (
                  <span className="text-xs text-muted-foreground font-normal">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className={`rounded-xl ${colorStyles.bg} ${colorStyles.text} p-3.5 shrink-0`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}