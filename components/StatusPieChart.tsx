
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface StatusPieChartProps {
  data: StatusData[];
}

const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-slate-500 text-[10px] font-black uppercase tracking-widest border border-dashed border-slate-800 rounded-[2rem]">
        Aguardando dados...
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-black">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
        <span className="text-xl font-black text-white">{total}</span>
        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Total</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            innerRadius={60}
            paddingAngle={8}
            fill="#8884d8"
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
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
            formatter={(value: number) => [`${value} Unidades`, 'Quantidade']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusPieChart;
