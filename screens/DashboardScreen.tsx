
import React, { useState, useRef, useMemo } from 'react';
import FinanceChart from '../components/FinanceChart';
import StatCard from '../components/StatCard';
import { Capitacao } from '../types';
import { 
  DollarSign, 
  Briefcase, 
  Activity, 
  CheckCircle, 
  UploadCloud, 
  CloudLightning, 
  TrendingUp, 
  Timer, 
  AlertCircle, 
  Calendar,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ArrowRight,
  Plus
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface Props {
  capitacoes: Capitacao[];
  onImport: (data: any) => void;
  isSyncing: boolean;
  onNavigate: (tab: string) => void;
  logoUrl: string;
}

const DashboardScreen: React.FC<Props> = ({ capitacoes, onImport, isSyncing, onNavigate, logoUrl }) => {
  const [filterEmp, setFilterEmp] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const filtered = filterEmp === 'all' ? capitacoes : capitacoes.filter(c => c.empreendimentoId === filterEmp);
    
    const totalContratado = filtered.reduce((a, b) => a + (b.valorContratado || 0), 0);
    const totalRepassado = filtered.reduce((a, b) => a + (b.valorRepassado || 0), 0);
    const totalMargem = filtered.reduce((a, b) => a + (b.margem || 0), 0);
    
    const ativos = filtered.filter(c => c.status === 'ativo').length;
    const vencendo = filtered.filter(c => c.status === 'vencendo').length;
    const vencidos = filtered.filter(c => c.status === 'vencido').length;
    const inativos = filtered.filter(c => c.status === 'inativo').length;

    const statusData = [
      { name: 'Ativos', value: ativos || 0, color: '#10b981' },
      { name: 'Vencendo', value: vencendo || 0, color: '#f59e0b' },
      { name: 'Vencidos', value: vencidos || 0, color: '#ef4444' },
      { name: 'Inativos', value: inativos || 0, color: '#64748b' },
    ];

    const hasStatusData = statusData.some(d => d.value > 0);

    const empreendimentosUnicos = Array.from(new Set(capitacoes.map(c => JSON.stringify({ id: c.empreendimentoId, nome: c.empreendimentoNome }))))
      .map((s: string) => JSON.parse(s) as { id: string, nome: string })
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    const marginByEmp = empreendimentosUnicos.map(emp => {
      const empCapitacoes = capitacoes.filter(c => c.empreendimentoId === emp.id);
      const margin = empCapitacoes.reduce((a, b) => a + (b.margem || 0), 0);
      return { name: emp.nome, margem: margin };
    }).sort((a, b) => b.margem - a.margem).slice(0, 5);

    const marginByPoint = filtered.map(p => ({
      name: p.nome,
      margem: p.margem
    })).sort((a, b) => b.margem - a.margem).slice(0, 10);

    const monthlyMargin = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const monthName = d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
      const monthYear = d.getFullYear();
      
      // Simple simulation for trend if no real historical data exists
      // In a real app, this would filter by createdAt or dataInicio
      const margin = filtered.reduce((acc, curr) => acc + (curr.margem || 0), 0) / (6 - i + 1);
      
      return { label: monthName, value: margin };
    });

    const globalTotalMargem = capitacoes.reduce((a, b) => a + (b.margem || 0), 0);

    return {
      totalContratado,
      totalRepassado,
      totalMargem,
      globalTotalMargem,
      ativos,
      vencendo,
      vencidos,
      count: filtered.length,
      empreendimentosUnicos,
      statusData,
      hasStatusData,
      marginByEmp,
      marginByPoint,
      monthlyMargin,
      displayData: filtered
    };
  }, [capitacoes, filterEmp]);

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
          <h2 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">Sistema Vazio</h2>
          <p className="text-[10px] text-slate-400 mb-6 font-medium uppercase tracking-tight">Nenhum ponto de captação cadastrado no sistema.</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase text-[9px] tracking-widest mb-2"
          >
            <UploadCloud size={14} /> Restaurar Backup
          </button>
          <button 
            onClick={() => {
              const demoData = {
                empreendimentos: [
                  { id: 'emp1', nome: 'Unidade Central', responsavel: 'Dr. Silva', status: 'ativo', email: 'contato@central.com', telefone: '11999999999' },
                  { id: 'emp2', nome: 'Unidade Norte', responsavel: 'Dra. Maria', status: 'ativo', email: 'contato@norte.com', telefone: '11888888888' }
                ],
                capitacoes: [
                  { id: 'cap1', nome: 'Ponto de Coleta A', cnpj: '12.345.678/0001-90', valorContratado: 50000, valorRepassado: 35000, margem: 15000, percentual: 30, status: 'ativo', empreendimentoId: 'emp1', empreendimentoNome: 'Unidade Central', dataInicio: '2024-01-01', tempoContrato: 12, dataTermino: '2025-01-01' },
                  { id: 'cap2', nome: 'Ponto de Coleta B', cnpj: '98.765.432/0001-10', valorContratado: 80000, valorRepassado: 60000, margem: 20000, percentual: 25, status: 'vencendo', empreendimentoId: 'emp2', empreendimentoNome: 'Unidade Norte', dataInicio: '2023-06-01', tempoContrato: 12, dataTermino: '2024-06-01' }
                ]
              };
              onImport(demoData);
            }}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 uppercase text-[9px] tracking-widest"
          >
            <Activity size={14} /> Carregar Dados Exemplo
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">
            Dashboard <span className="text-sky-500">Financeiro</span>
          </h2>
          <p className="text-sky-500/50 mt-0.5 text-[8px] font-black uppercase tracking-wider">
            Gestão de Contratos e Pontos de Captação
          </p>
        </div>
        <img src={logoUrl} className="w-10 h-10 md:w-14 md:h-14 rounded-xl object-cover border border-sky-500/20 shadow-lg" alt="Logo" />
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select 
            value={filterEmp}
            onChange={(e) => setFilterEmp(e.target.value)}
            className="bg-slate-900 border border-sky-500/20 rounded-xl px-4 py-2 text-white text-[10px] font-black uppercase tracking-widest outline-none"
          >
            <option value="all">Todos Empreendimentos</option>
            {stats.empreendimentosUnicos.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nome}</option>
            ))}
          </select>
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${isSyncing ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' : 'bg-sky-500/5 border-sky-500/20 text-sky-400'}`}>
            {isSyncing ? <CloudLightning size={12} className="animate-spin" /> : <CheckCircle size={12} />}
            <span className="text-[8px] font-black uppercase tracking-widest">
              {isSyncing ? 'Syncing' : 'Cloud OK'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Contratado" value={formatCurrency(stats.totalContratado)} icon={<DollarSign />} color="bg-sky-600" />
        <StatCard title="Margem (Filtro)" value={formatCurrency(stats.totalMargem)} icon={<TrendingUp />} color="bg-emerald-600" />
        <StatCard title="Margem Total Geral" value={formatCurrency(stats.globalTotalMargem)} icon={<Activity />} color="bg-indigo-600" />
        <StatCard title="Vencendo (30d)" value={stats.vencendo.toString()} icon={<Timer />} color="bg-amber-600" />
        <StatCard title="Vencidos" value={stats.vencidos.toString()} icon={<AlertCircle />} color="bg-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="x-glass p-6 rounded-[2.5rem] border border-sky-500/10 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <TrendingUp size={16} className="text-sky-500" />
              Evolução de Margem (Mensal)
            </h3>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            {stats.monthlyMargin.length > 0 ? (
              <FinanceChart data={stats.monthlyMargin} />
            ) : (
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sem dados históricos</div>
            )}
          </div>
        </div>

        <div className="x-glass p-6 rounded-[2.5rem] border border-sky-500/10 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <BarChartIcon size={16} className="text-sky-500" />
              Margem por Empreendimento (Top 5)
            </h3>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            {stats.marginByEmp.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.marginByEmp} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    width={80}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(14, 165, 233, 0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}
                    formatter={(value: number) => [formatCurrency(value), 'Margem']}
                  />
                  <Bar dataKey="margem" fill="#0ea5e9" radius={[0, 8, 8, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sem dados de margem</div>
            )}
          </div>
        </div>

        <div className="x-glass p-6 rounded-[2.5rem] border border-sky-500/10 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" />
              Top 10 Pontos por Margem
            </h3>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            {stats.marginByPoint.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.marginByPoint} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    width={80}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}
                    formatter={(value: number) => [formatCurrency(value), 'Margem']}
                  />
                  <Bar dataKey="margem" fill="#10b981" radius={[0, 8, 8, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sem dados de pontos</div>
            )}
          </div>
        </div>

        <div className="x-glass p-6 rounded-[2.5rem] border border-sky-500/10 h-full">
          <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
            <PieChartIcon size={16} className="text-sky-500" />
            Distribuição de Status
          </h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            {stats.hasStatusData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusData.filter(s => s.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.statusData.filter(s => s.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sem dados de status</div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {stats.statusData.filter(s => s.value > 0).map((s, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                <span className="text-[8px] font-black text-slate-400 uppercase">{s.name}: {s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="x-glass p-6 rounded-[2.5rem] border border-sky-500/10 h-full">
            <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Activity size={16} className="text-sky-500" />
              Maiores Margens por Ponto
            </h3>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-sky-500/10">
                    <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Ponto</th>
                    <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Margem</th>
                    <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">%</th>
                    <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-500/5">
                  {stats.marginByPoint.map((p, idx) => {
                    const original = stats.displayData.find(d => d.nome === p.name);
                    return (
                      <tr key={idx} className="group hover:bg-sky-500/5 transition-all">
                        <td className="py-3">
                          <p className="text-[10px] font-black text-white uppercase truncate max-w-[150px]">{p.name}</p>
                        </td>
                        <td className="py-3 text-[10px] font-bold text-emerald-400">{formatCurrency(p.margem)}</td>
                        <td className="py-3 text-[10px] font-bold text-slate-400">{original?.percentual?.toFixed(1)}%</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${
                            original?.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-500' :
                            original?.status === 'vencendo' ? 'bg-amber-500/10 text-amber-400' :
                            original?.status === 'vencido' ? 'bg-rose-500/10 text-rose-500' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {original?.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1">
          <div className="x-glass p-6 rounded-[2.5rem] border border-sky-500/10 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => onNavigate('NovaCapitacao')}
                  className="w-full p-4 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Plus size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Novo Ponto</span>
                  </div>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
                <button 
                  onClick={() => onNavigate('NovoEmpreendimento')}
                  className="w-full p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Novo Emp.</span>
                  </div>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              </div>
            </div>
            <div className="mt-6 p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
              <p className="text-[8px] font-black text-sky-500 uppercase mb-1">Dica do Sistema</p>
              <p className="text-[9px] text-slate-400 leading-relaxed font-medium">Mantenha seus contratos atualizados para evitar vencimentos não planejados.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="x-glass p-6 rounded-[2.5rem] border border-sky-500/10 h-full">
            <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Activity size={16} className="text-sky-500" />
              Lista de Pontos Associados
            </h3>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-sky-500/10">
                    <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Nome do Ponto</th>
                    <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Contratado</th>
                    <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Margem</th>
                    <th className="pb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-500/5">
                  {stats.displayData.slice(0, 5).map((p) => (
                    <tr key={p.id} className="group hover:bg-sky-500/5 transition-all">
                      <td className="py-4">
                        <p className="text-[10px] font-black text-white uppercase truncate max-w-[150px]">{p.nome}</p>
                        <p className="text-[8px] text-slate-500 font-bold">{p.cnpj}</p>
                      </td>
                      <td className="py-4 text-[10px] font-bold text-white">{formatCurrency(p.valorContratado)}</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-black ${p.margem >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatCurrency(p.margem)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-widest ${
                          p.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-500' :
                          p.status === 'vencendo' ? 'bg-amber-500/10 text-amber-400' :
                          p.status === 'vencido' ? 'bg-rose-500/10 text-rose-500' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stats.displayData.length > 5 && (
                <button 
                  onClick={() => onNavigate('Capitacoes')}
                  className="w-full py-3 mt-4 text-[9px] font-black text-sky-500 uppercase tracking-widest hover:text-sky-400 transition-colors"
                >
                  Ver todos os {stats.displayData.length} pontos
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="x-glass p-6 rounded-[2.5rem] border border-sky-500/10 h-full">
          <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
            <CloudLightning size={16} className="text-amber-500" />
            Alertas de Contrato Críticos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.displayData.filter(p => p.status === 'vencendo' || p.status === 'vencido').map(p => (
              <div key={p.id} className={`p-4 rounded-2xl border ${p.status === 'vencido' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-[10px] font-black text-white uppercase truncate flex-1">{p.nome}</h4>
                  <span className={`text-[8px] font-black uppercase ${p.status === 'vencido' ? 'text-rose-500' : 'text-amber-500'}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase">
                  <Calendar size={10} />
                  Término: {p.dataTermino}
                </div>
              </div>
            ))}
            {stats.displayData.filter(p => p.status === 'vencendo' || p.status === 'vencido').length === 0 && (
              <div className="col-span-full text-center py-10 opacity-30 grayscale">
                <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum alerta crítico</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;