'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ChartWidgetProps {
  title: string;
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function ChartWidget({ 
  title, 
  data, 
  maxValue, 
  valuePrefix = '', 
  valueSuffix = '' 
}: ChartWidgetProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">
                {valuePrefix}{item.value}{valueSuffix}
              </span>
            </div>
            <Progress 
              value={(item.value / max) * 100} 
              className="h-2"
              indicatorClassName={item.color || 'bg-orange-500'}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}