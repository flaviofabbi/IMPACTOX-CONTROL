
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface CategoryData {
  label: string;
  value: number;
}

interface CategoryBarChartProps {
  data: CategoryData[];
}

const COLORS = ['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-slate-500 text-[10px] font-black uppercase tracking-widest border border-dashed border-slate-800 rounded-[2rem]">
        Aguardando dados...
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.5} />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a',
              borderRadius: '16px', 
              border: '1px solid #334155', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              padding: '12px 16px',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
            itemStyle={{ padding: '4px 0' }}
            formatter={(value: number) => [`${value} Unidades`, 'Volume']}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Bar 
            dataKey="value" 
            radius={[6, 6, 0, 0]}
            barSize={32}
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBarChart;
