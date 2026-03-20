
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
    <div className="x-glass p-3 md:p-5 rounded-2xl md:rounded-3xl x-glow border border-sky-500/10 flex flex-col justify-between hover:border-sky-500/30 transition-all duration-500 group h-full">
      <div className="flex justify-between items-start mb-1.5 md:mb-2">
        <div className={`${color} p-1.5 md:p-2 rounded-lg md:rounded-xl text-white shadow-md group-hover:scale-105 transition-transform`}>
          {React.cloneElement(icon as React.ReactElement<any>, { size: 14 })}
        </div>
        {trend && (
          <span className={`text-[6px] md:text-[7px] font-black px-1 md:px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${trendUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sky-500/50 text-[7px] md:text-[8px] font-black mb-0.5 uppercase tracking-wider">{title}</p>
        <h3 className="text-[10px] sm:text-xs md:text-sm lg:text-base font-black text-white tracking-tight break-words">{value}</h3>
        {chartData && <Sparkline data={chartData} color={chartColor} />}
      </div>
    </div>
  );
};

export default StatCard;
