
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, color = 'bg-sky-500', icon }) => {
  return (
    <div className="x-glass p-5 rounded-3xl x-glow border border-sky-500/10 flex flex-col justify-between hover:border-sky-500/30 transition-all duration-500 group">
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div className={`${color} p-2.5 md:p-3 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform`}>
          {/* Casting to React.ReactElement<any> to resolve type error when passing 'size' prop to cloned element */}
          {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
        </div>
        {trend && (
          <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${trendUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sky-500/50 text-[8px] md:text-[9px] font-black mb-0.5 uppercase tracking-wider">{title}</p>
        <h3 className="text-lg md:text-xl font-black text-white tracking-tight break-all">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
