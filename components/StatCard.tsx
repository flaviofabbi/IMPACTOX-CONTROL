
import React from 'react';
import Sparkline from './Sparkline';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  icon: React.ReactNode;
  chartData?: { value: number }[];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, color = 'bg-sky-500', icon, chartData }) => {
  const chartColor = color.includes('sky') ? '#0ea5e9' : color.includes('emerald') ? '#10b981' : color.includes('amber') ? '#f59e0b' : color.includes('rose') ? '#ef4444' : '#6366f1';

  return (
    <div className="x-glass p-4 md:p-5 rounded-3xl x-glow border border-sky-500/10 flex flex-col justify-between hover:border-sky-500/30 transition-all duration-500 group h-full">
      <div className="flex justify-between items-start mb-2">
        <div className={`${color} p-2 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform`}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
        </div>
        {trend && (
          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${trendUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sky-500/50 text-[8px] font-black mb-0.5 uppercase tracking-wider">{title}</p>
        <h3 className="text-sm md:text-base lg:text-lg font-black text-white tracking-tight truncate">{value}</h3>
        {chartData && <Sparkline data={chartData} color={chartColor} />}
      </div>
    </div>
  );
};

export default StatCard;
