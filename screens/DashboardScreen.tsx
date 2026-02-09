
import React, { useState, useRef } from 'react';
import FinanceChart from '../components/FinanceChart';
import StatCard from '../components/StatCard';
import { Capitacao } from '../types';
import { DollarSign, TrendingUp, Briefcase, Activity, Target, CheckCircle, UploadCloud, CloudCheck, CloudLightning } from 'lucide-react';

interface Props {
  capitacoes: Capitacao[];
  onImport: (data: any) => void;
  isSyncing: boolean;
}

const DashboardScreen: React.FC<Props> = ({ capitacoes, onImport, isSyncing }) => {
  const [filter, setFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MARGEM_META = 20;

  if (capitacoes.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-700">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".json" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => onImport(JSON.parse(ev.target?.result as string));
              reader.readAsText(file);
            }
            if (e.target) e.target.value = '';
          }} 
        />
        <div className="x-glass p-8 rounded-[2rem] border border-sky-500/10 text-center max-w-[280px]">
          <UploadCloud size={40} className="mx-auto text-sky-500 mb-4 animate-pulse" />
          <h2 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">Core Offline</h2>
          <p className="text-[10px] text-slate-400 mb-6 font-medium uppercase tracking-tight">Nenhum dado ativo no banco de dados local.</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase text-[9px] tracking-widest"
          >
            <UploadCloud size={14} /> Restaurar Nucleo
          </button>
        </div>
      </div>
    );
  }

  const filteredData = filter === 'all' ? capitacoes : capitacoes.slice(-6); 
  const totalReceita = filteredData.reduce((a, b) => a + b.valor_pago, 0);
  const totalMargem = filteredData.reduce((a, b) => a + b.margem, 0);
  const avgMargin = totalReceita > 0 ? (totalMargem / totalReceita) * 100 : 0;
  const projetosNaMeta = filteredData.filter(c => (c.margem / c.valor_pago) * 100 >= MARGEM_META).length;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const chartData = [...filteredData].reverse().map(c => ({
    label: c.mes,
    value: c.valor_pago
  }));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">
            Visão <span className="text-sky-500">Operacional</span>
          </h2>
          <p className="text-sky-500/50 mt-0.5 text-[8px] font-black uppercase tracking-wider">
            Target Global: <span className="text-emerald-400 font-black">{MARGEM_META}% ROI</span>
          </p>
        </div>
        
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border self-start md:self-center ${isSyncing ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' : 'bg-sky-500/5 border-sky-500/20 text-sky-400'}`}>
          {isSyncing ? <CloudLightning size={12} className="animate-spin" /> : <CloudCheck size={12} />}
          <span className="text-[8px] font-black uppercase tracking-widest">
            {isSyncing ? 'Syncing' : 'Link OK'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title="Faturamento" value={formatCurrency(totalReceita)} icon={<DollarSign />} color="bg-sky-600" />
        <StatCard title="Entregas" value={`${projetosNaMeta}/${filteredData.length}`} trendUp={avgMargin >= MARGEM_META} icon={<CheckCircle />} color="bg-emerald-600" />
        <StatCard title="ROI Médio" value={`${avgMargin.toFixed(1)}%`} trendUp={avgMargin >= MARGEM_META} icon={<Activity />} color="bg-indigo-600" />
        <StatCard title="Unidades" value={filteredData.length.toString()} icon={<Briefcase />} color="bg-slate-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="x-glass p-5 rounded-[2rem] border border-sky-500/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-tighter">Fluxo de Capital</h3>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-950/50 border border-sky-500/20 rounded-lg px-2 py-1 text-sky-400 text-[8px] font-black uppercase tracking-widest outline-none"
              >
                <option value="all">Full</option>
                <option value="recent">H2/24</option>
              </select>
            </div>
            <FinanceChart data={chartData} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="x-glass p-5 rounded-[2rem] border border-sky-500/10 h-full">
            <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-4">Performance Ativa</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {filteredData.map((projeto) => {
                const marginPercent = (projeto.margem / projeto.valor_pago) * 100;
                const hitTarget = marginPercent >= MARGEM_META;
                return (
                  <div key={projeto.id} className="p-3 bg-sky-500/5 border border-sky-500/10 rounded-xl group hover:border-sky-500/40 transition-all">
                    <div className="flex justify-between items-start mb-1.5 gap-2">
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-black text-slate-100 text-[8px] uppercase tracking-tight leading-none mb-0.5 truncate">{projeto.nome}</h4>
                        <p className="text-[7px] font-bold text-sky-500/60 uppercase">{projeto.mes}/24</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[9px] font-black text-white">{formatCurrency(projeto.valor_pago)}</p>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mt-2">
                      <div className={`h-full transition-all duration-1000 ${hitTarget ? 'bg-sky-400' : 'bg-amber-400'}`} style={{ width: `${Math.min(marginPercent, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
