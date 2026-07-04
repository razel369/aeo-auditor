'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendPoint {
  week: string;
  mentionRate: number;
  weightedMentionRate: number;
  offlineMemoryRate: number;
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 16, right: 32, bottom: 16, left: 8 }}>
        <CartesianGrid stroke="#e6e4df" strokeDasharray="2 4" />
        <XAxis dataKey="week" tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fill: '#6b6660' }} />
        <YAxis domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fill: '#6b6660' }} />
        <Tooltip
          contentStyle={{ background: '#fbfaf6', border: '1px solid #1a1a1a', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
          formatter={(v: number) => `${Math.round(v * 100)}%`}
        />
        <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }} />
        <Line type="monotone" dataKey="mentionRate" name="Mention rate" stroke="#1a1a1a" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="weightedMentionRate" name="Weighted" stroke="#b04a30" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="offlineMemoryRate" name="Offline memory" stroke="#3a5a3a" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}