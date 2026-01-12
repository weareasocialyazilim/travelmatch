'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

// TravelMatch Chart Color Palette
export const CHART_COLORS = {
  primary: '#F59E0B', // Amber - Primary metric
  secondary: '#EC4899', // Magenta - Comparison
  accent: '#14B8A6', // Seafoam/Teal - Complementary
  trust: '#10B981', // Emerald - Positive values
  info: '#3B82F6', // Blue - Info
  purple: '#8B5CF6', // Purple - Additional
  destructive: '#EF4444', // Red - Negative values
  muted: '#94A3B8', // Slate - Muted data
  amber: '#F59E0B', // Amber - Same as primary for compatibility
};

// Color array for multi-series charts
export const CHART_COLOR_ARRAY = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.accent,
  CHART_COLORS.trust,
  CHART_COLORS.info,
  CHART_COLORS.purple,
];

// Gradient definitions for area charts
export const ChartGradients = () => (
  <defs>
    <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="gradientSecondary" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
      <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="gradientAccent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.3} />
      <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="gradientTrust" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={CHART_COLORS.trust} stopOpacity={0.3} />
      <stop offset="95%" stopColor={CHART_COLORS.trust} stopOpacity={0} />
    </linearGradient>
    <linearGradient id="gradientInfo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={CHART_COLORS.info} stopOpacity={0.3} />
      <stop offset="95%" stopColor={CHART_COLORS.info} stopOpacity={0} />
    </linearGradient>
  </defs>
);

// Custom tooltip component
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; color?: string }>;
  label?: string;
  formatter?: (value: number, name: string) => [string, string];
}

export function CustomTooltip({
  active,
  payload,
  label,
  formatter,
}: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md">
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map(
          (
            entry: { value?: number; name?: string; color?: string },
            index: number,
          ) => {
            const [formattedValue, formattedName] = formatter
              ? formatter(entry.value as number, entry.name as string)
              : [String(entry.value), entry.name as string];

            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{formattedName}:</span>
                <span className="font-medium">{formattedValue}</span>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

// Chart container wrapper
interface ChartContainerProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  height?: number;
  className?: string;
  action?: React.ReactNode;
  loading?: boolean;
}

export function ChartContainer({
  title,
  description,
  children,
  height = 300,
  className,
  action,
  loading = false,
}: ChartContainerProps) {
  return (
    <Card className={cn('chart-container', className)}>
      {(title || description || action) && (
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            {title && (
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
            )}
            {description && (
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            )}
          </div>
          {action}
        </CardHeader>
      )}
      <CardContent className={cn(!title && !description && 'pt-4')}>
        {loading ? (
          <div
            className="flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div style={{ height: `${height}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              {children}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Legend component
interface ChartLegendProps {
  items: { label: string; color: string; value?: string | number }[];
  className?: string;
}

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {items.map((item, index) => (
        <div key={index} className="chart-legend-item">
          <div
            className="chart-legend-dot"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
          {item.value !== undefined && (
            <span className="font-medium text-foreground">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Pre-configured Line Chart
interface AdminLineChartProps {
  data: Record<string, unknown>[];
  xAxisKey: string;
  lines: {
    dataKey: string;
    name: string;
    color?: string;
    strokeWidth?: number;
    dot?: boolean;
  }[];
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  formatter?: (value: number, name: string) => [string, string];
  yAxisFormatter?: (value: number) => string;
  className?: string;
}

export function AdminLineChart({
  data,
  xAxisKey,
  lines,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = true,
  formatter,
  yAxisFormatter,
  className,
}: AdminLineChartProps) {
  return (
    <ChartContainer
      title={title}
      description={description}
      height={height}
      className={className}
    >
      <LineChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={yAxisFormatter}
          className="text-muted-foreground"
        />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {showLegend && <Legend />}
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={
              line.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
            }
            strokeWidth={line.strokeWidth || 2}
            dot={
              line.dot !== false
                ? { fill: line.color || CHART_COLOR_ARRAY[index] }
                : false
            }
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

// Pre-configured Area Chart
interface AdminAreaChartProps {
  data: Record<string, unknown>[];
  xAxisKey: string;
  areas: {
    dataKey: string;
    name: string;
    color?: string;
    gradientId?: string;
  }[];
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  formatter?: (value: number, name: string) => [string, string];
  yAxisFormatter?: (value: number) => string;
  className?: string;
}

export function AdminAreaChart({
  data,
  xAxisKey,
  areas,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  formatter,
  yAxisFormatter,
  className,
}: AdminAreaChartProps) {
  return (
    <ChartContainer
      title={title}
      description={description}
      height={height}
      className={className}
    >
      <AreaChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        <ChartGradients />
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={yAxisFormatter}
          className="text-muted-foreground"
        />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {showLegend && <Legend />}
        {areas.map((area, index) => {
          const color =
            area.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length];
          const gradientId =
            area.gradientId ||
            `gradient${['Primary', 'Secondary', 'Accent', 'Trust', 'Info'][index % 5]}`;

          return (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              stackId={stacked ? 'stack' : undefined}
            />
          );
        })}
      </AreaChart>
    </ChartContainer>
  );
}

// Pre-configured Bar Chart
interface AdminBarChartProps {
  data: Record<string, unknown>[];
  xAxisKey: string;
  bars: {
    dataKey: string;
    name: string;
    color?: string;
    radius?: number;
  }[];
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  layout?: 'horizontal' | 'vertical';
  formatter?: (value: number, name: string) => [string, string];
  yAxisFormatter?: (value: number) => string;
  className?: string;
}

export function AdminBarChart({
  data,
  xAxisKey,
  bars,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  layout = 'horizontal',
  formatter,
  yAxisFormatter,
  className,
}: AdminBarChartProps) {
  return (
    <ChartContainer
      title={title}
      description={description}
      height={height}
      className={className}
    >
      <BarChart
        data={data}
        layout={layout === 'vertical' ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        )}
        <XAxis
          dataKey={layout === 'vertical' ? undefined : xAxisKey}
          type={layout === 'vertical' ? 'number' : 'category'}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={layout === 'vertical' ? yAxisFormatter : undefined}
          className="text-muted-foreground"
        />
        <YAxis
          dataKey={layout === 'vertical' ? xAxisKey : undefined}
          type={layout === 'vertical' ? 'category' : 'number'}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={layout === 'vertical' ? undefined : yAxisFormatter}
          className="text-muted-foreground"
        />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {showLegend && <Legend />}
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={
              bar.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
            }
            radius={bar.radius ?? 4}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

// Pre-configured Pie/Donut Chart
interface AdminPieChartProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
  description?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  formatter?: (value: number) => string;
  className?: string;
}

export function AdminPieChart({
  data,
  title,
  description,
  height = 300,
  innerRadius = 0,
  outerRadius = 100,
  showLegend = true,
  showLabels = false,
  formatter,
  className,
}: AdminPieChartProps) {
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length],
  }));

  return (
    <ChartContainer
      title={title}
      description={description}
      height={height}
      className={className}
    >
      <PieChart>
        <Pie
          data={dataWithColors}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          label={
            showLabels
              ? ((({ name, percent }: { name: string; percent?: number }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`) as any)
              : undefined
          }
        >
          {dataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | undefined) => [
            formatter && value !== undefined ? formatter(value) : (value ?? 0),
            '',
          ]}
        />
        {showLegend && <Legend />}
      </PieChart>
    </ChartContainer>
  );
}

// Export all chart types
export {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
};
