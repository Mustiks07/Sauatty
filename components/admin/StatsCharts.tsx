'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = {
  brand: '#2563EB',
  brandLight: '#DBEAFE',
  accent: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  gray: '#94A3B8',
};

const tooltipStyle = {
  background: '#0F172A',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 12,
  padding: '6px 10px',
};

export function LineDays({
  data,
  color = COLORS.brand,
  height = 220,
}: {
  data: { day: string; value: number }[];
  color?: string;
  height?: number;
}) {
  // Shorten day labels: keep last 5 chars (MM-DD)
  const formatted = data.map((d) => ({ ...d, short: d.day.slice(5) }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="short"
          tick={{ fontSize: 11, fill: '#64748B' }}
          interval="preserveStartEnd"
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
          width={28}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: '#fff', fontWeight: 600 }}
          cursor={{ stroke: color, strokeOpacity: 0.2 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill="url(#lg)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarBuckets({
  data,
  height = 220,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
          width={28}
          allowDecimals={false}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F1F5F9' }} />
        <Bar dataKey="value" fill={COLORS.brand} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ProgressLine({
  data,
  height = 200,
}: {
  data: { idx: number; score: number; total: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="idx"
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
          width={28}
          domain={[0, (dataMax: number) => Math.max(10, dataMax)]}
          allowDecimals={false}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: COLORS.brand, strokeOpacity: 0.2 }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke={COLORS.brand}
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#fff', stroke: COLORS.brand, strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Heatmap({
  data,
}: {
  data: { day: string; value: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const color = (v: number) => {
    if (v === 0) return '#F1F5F9';
    const intensity = Math.min(1, v / max);
    // Blend from light blue to brand blue
    const t = 0.2 + intensity * 0.8;
    const r = Math.round(219 + (37 - 219) * t);
    const g = Math.round(234 + (99 - 234) * t);
    const b = Math.round(254 + (235 - 254) * t);
    return `rgb(${r},${g},${b})`;
  };
  return (
    <div className="flex flex-wrap gap-1">
      {data.map((d) => (
        <div
          key={d.day}
          title={`${d.day}: ${d.value} тапсыру`}
          className="w-3 h-3 rounded-sm"
          style={{ background: color(d.value) }}
        />
      ))}
    </div>
  );
}
