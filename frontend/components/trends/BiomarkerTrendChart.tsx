'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { BiomarkerTrendData } from '@/lib/hooks/useTrends';

interface BiomarkerTrendChartProps {
  trend: BiomarkerTrendData;
}

export function BiomarkerTrendChart({ trend }: BiomarkerTrendChartProps) {
  const chartData = trend.history.map(h => ({
    date: format(parseISO(h.date), 'MMM dd'),
    value: h.value,
    status: h.status,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#10b981';
      case 'borderline': return '#f59e0b';
      case 'high':
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const latestStatus = trend.history[trend.history.length - 1]?.status || 'normal';
  const lineColor = getStatusColor(latestStatus);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm text-foreground">{trend.displayName}</h3>
          <p className="text-xs text-muted-foreground">
            {trend.refRangeLow && trend.refRangeHigh 
              ? `Normal: ${trend.refRangeLow}-${trend.refRangeHigh} ${trend.unit}`
              : `Unit: ${trend.unit}`
            }
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">
            {trend.history[trend.history.length - 1]?.value} <span className="text-xs font-normal text-muted-foreground">{trend.unit}</span>
          </p>
          <p className="text-xs text-muted-foreground">{trend.history.length} readings</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            stroke="#d1d5db"
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            stroke="#d1d5db"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`${value} ${trend.unit}`, 'Value']}
          />
          {trend.refRangeLow && (
            <ReferenceLine 
              y={trend.refRangeLow} 
              stroke="#10b981" 
              strokeDasharray="3 3"
              label={{ value: 'Low', fontSize: 10, fill: '#6b7280' }}
            />
          )}
          {trend.refRangeHigh && (
            <ReferenceLine 
              y={trend.refRangeHigh} 
              stroke="#10b981" 
              strokeDasharray="3 3"
              label={{ value: 'High', fontSize: 10, fill: '#6b7280' }}
            />
          )}
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={lineColor}
            strokeWidth={2}
            dot={{ fill: lineColor, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
