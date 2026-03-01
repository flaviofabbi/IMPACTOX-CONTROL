
import React from 'react';
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface FinanceChartProps {
  data: ChartDataPoint[];
  onClick?: (data: any) => void;
}

const FinanceChart: React.FC<FinanceChartProps> = ({ data, onClick }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data}
          onClick={(e) => {
            if (onClick && e && e.activePayload && e.activePayload.length > 0) {
              onClick(e.activePayload[0].payload);
            }
          }}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => `R$ ${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a',
              borderRadius: '16px', 
              border: '1px solid #334155', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              padding: '12px 16px',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
            itemStyle={{ color: '#0ea5e9', padding: '4px 0' }}
            formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Margem de Lucro']}
            cursor={{ stroke: '#0ea5e9', strokeWidth: 1, strokeDasharray: '5 5' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#0ea5e9" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
