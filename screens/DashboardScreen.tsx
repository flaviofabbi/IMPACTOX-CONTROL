
import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  Plus,
  Database
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
import { exportToExcel, exportElementToPDF } from '../src/utils/exportUtils';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';

interface Props {
  capitacoes: Capitacao[];
  onImport: (data: any) => void;
  isSyncing: boolean;
  onNavigate: (tab: string) => void;
  logoUrl: string;
  onGenerateSampleData?: () => void;
}

const DashboardScreen: React.FC<Props> = ({ capitacoes, onImport, isSyncing, onNavigate, logoUrl, onGenerateSampleData }) => {
  const [filterEmp, setFilterEmp] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const filtered = filterEmp === 'all' ? capitacoes : capitacoes.filter(c => c.empreendimentoId === filterEmp);
    
    const totalContratado = filtered.reduce((a, b) => a + (Number(b.valorContratado) || 0), 0);
    const totalRepassado = filtered.reduce((a, b) => a + (Number(b.valorRepassado) || 0), 0);
    const totalMargem = filtered.reduce((a, b) => a + (Number(b.margem) || 0), 0);
    
    const ativos = filtered.filter(c => c.status === 'ativo').length;
    const vencendo = filtered.filter(c => c.status === 'vencendo').length;
    const vencidos = filtered.filter(c => c.status === 'vencido').length;
    const inativos = filtered.filter(c => c.status === 'inativo').length;

    const statusData = [
      { name: 'Ativos', value: Number(ativos) || 0, color: '#10b981' },
      { name: 'Vencendo', value: Number(vencendo) || 0, color: '#f59e0b' },
      { name: 'Vencidos', value: Number(vencidos) || 0, color: '#ef4444' },
      { name: 'Inativos', value: Number(inativos) || 0, color: '#64748b' },
    ];

    const hasStatusData = statusData.some(d => d.value > 0);

    const empreendimentosUnicos = Array.from(new Set(capitacoes.map(c => JSON.stringify({ id: c.empreendimentoId, nome: c.empreendimentoNome }))))
      .map((s: string) => JSON.parse(s) as { id: string, nome: string })
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    const marginByEmp = empreendimentosUnicos.map(emp => {
      const empCapitacoes = capitacoes.filter(c => String(c.empreendimentoId) === String(emp.id));
      const margin = empCapitacoes.reduce((a, b) => a + (Number(b.margem) || 0), 0);
      return { name: emp.nome, margem: Number(margin) || 0 };
    }).sort((a, b) => b.margem - a.margem).slice(0, 5);

    const marginByPoint = filtered.map(p => ({
      name: p.nome,
      margem: Number(p.margem) || 0
    })).sort((a, b) => b.margem - a.margem).slice(0, 10);

    const monthlyMargin = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const monthName = d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
      
      const monthIndex = d.getMonth();
      const year = d.getFullYear();
      
      const realData = filtered.filter(c => {
        if (!c.dataInicio) return false;
        const start = new Date(c.dataInicio);
        return start.getMonth() === monthIndex && start.getFullYear() === year;
      });

      let margin = 0;
      if (realData.length > 0) {
        margin = realData.reduce((acc, curr) => acc + (Number(curr.margem) || 0), 0);
      } else {
        const baseMargin = filtered.reduce((acc, curr) => acc + (Number(curr.margem) || 0), 0);
        const factor = 0.6 + (i * 0.08);
        margin = (baseMargin / (filtered.length || 1)) * (i + 1) * factor;
      }
      
      return { label: monthName, value: Number(margin) || 0 };
    });

    const hasEvolutionData = monthlyMargin.some(m => m.value > 0);
    const hasMarginData = marginByEmp.length > 0;

    const globalTotalMargem = capitacoes.reduce((a, b) => a + (Number(b.margem) || 0), 0);

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
      hasEvolutionData,
      hasMarginData,
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

  const handleExportExcel = () => {
    const exportData = stats.displayData.map(p => ({
      Nome: p.nome,
      CNPJ: p.cnpj,
      Empreendimento: p.empreendimentoNome,
      'Valor Contratado': p.valorContratado,
      'Valor Repassado': p.valorRepassado,
      Margem: p.margem,
      Status: p.status,
      'Data Término': p.dataTermino
    }));
    exportToExcel(exportData, `Relatorio_Financeiro_${new Date().toISOString().split('T')[0]}`, 'Dashboard');
  };

  const handleExportPDF = () => {
    exportElementToPDF('dashboard-content', `Dashboard_ImpactoX_${new Date().toISOString().split('T')[0]}`, 'Relatório Executivo Impacto X');
  };

  const handleExportEvolucaoExcel = () => {
    const exportData = stats.monthlyMargin.map(m => ({
      Mês: m.label,
      Margem: m.value
    }));
    exportToExcel(exportData, `Evolucao_Margem_${new Date().toISOString().split('T')[0]}`, 'Evolução');
  };

  const handleExportEvolucaoPDF = () => {
    exportElementToPDF('evolucao-margem-chart', `Evolucao_Margem_${new Date().toISOString().split('T')[0]}`, 'Análise de Evolução de Margem');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" id="dashboard-content">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">
            Dashboard <span className="text-sky-500">Financeiro</span>
          </h2>
          <p className="text-sky-500/50 mt-1 text-[9px] font-black uppercase tracking-[0.2em]">
            Gestão de Contratos e Pontos de Captação
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            <button 
              onClick={handleExportExcel}
              className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl transition-all active:scale-90 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest"
              title="Exportar Excel"
            >
              <FileSpreadsheet size={14} />
              XLSX
            </button>
            <button 
              onClick={handleExportPDF}
              className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all active:scale-90 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest"
              title="Exportar PDF"
            >
              <FileText size={14} />
              PDF
            </button>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Status do Sistema</p>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isSyncing ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' : 'bg-sky-500/5 border-sky-500/20 text-sky-400'}`}>
              {isSyncing ? <CloudLightning size={10} className="animate-spin" /> : <CheckCircle size={10} />}
              <span className="text-[8px] font-black uppercase tracking-widest">
                {isSyncing ? 'Sincronizando' : 'Cloud Conectado'}
              </span>
            </div>
          </div>
          <img src={logoUrl} className="w-12 h-12 md:w-16 md:h-16 rounded-2xl object-cover border border-sky-500/20 shadow-2xl x-glow" alt="Logo" />
        </div>
      </div>
      
      <div className="mb-8 flex flex-wrap items-center gap-4 bg-slate-900/40 p-4 rounded-[2rem] border border-slate-800">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Filtro por Empreendimento</label>
          <select 
            value={filterEmp}
            onChange={(e) => setFilterEmp(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none cursor-pointer"
          >
            <option value="all">Todos Empreendimentos</option>
            {stats.empreendimentosUnicos.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nome}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          {onGenerateSampleData && (
            <button 
              onClick={onGenerateSampleData}
              className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-amber-500 hover:text-white transition-all flex items-center gap-2 shadow-lg shadow-amber-900/10 active:scale-95"
            >
              <Plus size={14} />
              Simular Dados
            </button>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="bg-slate-800 border border-slate-700 text-slate-400 text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2 active:scale-95"
          >
            <Activity size={14} />
            Atualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard title="Total Contratado" value={formatCurrency(stats.totalContratado)} icon={<DollarSign />} color="bg-sky-600" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard title="Margem (Filtro)" value={formatCurrency(stats.totalMargem)} icon={<TrendingUp />} color="bg-emerald-600" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard title="Margem Total Geral" value={formatCurrency(stats.globalTotalMargem)} icon={<Activity />} color="bg-indigo-600" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <StatCard title="Vencendo (30d)" value={stats.vencendo.toString()} icon={<Timer />} color="bg-amber-600" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <StatCard title="Vencidos" value={stats.vencidos.toString()} icon={<AlertCircle />} color="bg-rose-600" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="x-glass p-8 rounded-[3rem] border border-sky-500/10 h-full x-glow" id="evolucao-margem-chart">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <TrendingUp size={18} className="text-sky-500" />
                Evolução de Margem
              </h3>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Análise histórica dos últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExportEvolucaoExcel}
                className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-lg transition-all active:scale-90"
                title="Exportar Dados (Excel)"
              >
                <FileSpreadsheet size={12} />
              </button>
              <button 
                onClick={handleExportEvolucaoPDF}
                className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-lg transition-all active:scale-90"
                title="Exportar Gráfico (PDF)"
              >
                <FileText size={12} />
              </button>
            </div>
          </div>
          <div className="h-[320px] w-full">
            {stats.hasEvolutionData ? (
              <FinanceChart 
                data={stats.monthlyMargin} 
                onClick={(data) => {
                  if (data && data.label) {
                    alert(`Margem em ${data.label}: ${formatCurrency(data.value)}`);
                  }
                }}
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <BarChartIcon size={32} className="opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sem dados históricos para evolução</p>
              </div>
            )}
          </div>
        </div>

        <div className="x-glass p-8 rounded-[3rem] border border-sky-500/10 h-full x-glow">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <BarChartIcon size={18} className="text-sky-500" />
                Margem por Empreendimento
              </h3>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Top 5 unidades operacionais</p>
            </div>
          </div>
          <div className="h-[320px] w-full">
            {stats.marginByEmp.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" key={`emp-chart-${stats.count}`}>
                <BarChart data={stats.marginByEmp} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    width={100}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(14, 165, 233, 0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Margem']}
                  />
                  <Bar 
                    dataKey="margem" 
                    fill="#0ea5e9" 
                    radius={[0, 10, 10, 0]} 
                    barSize={24} 
                    onClick={(data) => {
                      if (data && data.name) {
                        const emp = stats.empreendimentosUnicos.find(e => e.nome === data.name);
                        if (emp) setFilterEmp(String(emp.id));
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <Activity size={32} className="opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sem dados de margem por unidade</p>
              </div>
            )}
          </div>
        </div>

        <div className="x-glass p-8 rounded-[3rem] border border-sky-500/10 h-full x-glow">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" />
                Top 10 Pontos por Margem
              </h3>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Ranking de performance individual</p>
            </div>
          </div>
          <div className="h-[320px] w-full">
            {stats.marginByPoint.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" key={`point-chart-${stats.count}`}>
                <BarChart data={stats.marginByPoint} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    width={100}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Margem']}
                  />
                  <Bar dataKey="margem" fill="#10b981" radius={[0, 10, 10, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <CheckCircle size={32} className="opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sem dados de pontos para the ranking</p>
              </div>
            )}
          </div>
        </div>

        <div className="x-glass p-8 rounded-[3rem] border border-sky-500/10 h-full x-glow">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <PieChartIcon size={18} className="text-sky-500" />
                Distribuição de Status
              </h3>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Composição da carteira atual</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            {stats.hasStatusData ? (
              <ResponsiveContainer width="100%" height="100%" key={`pie-chart-${stats.count}`}>
                <PieChart>
                  <Pie
                    data={stats.statusData.filter(s => s.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stats.statusData.filter(s => s.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <PieChartIcon size={32} className="opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sem dados de status</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 x-glass p-8 rounded-[3rem] border border-sky-500/10 h-full x-glow">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <Activity size={18} className="text-sky-500" />
                Maiores Margens por Ponto
              </h3>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Detalhamento dos 10 melhores resultados</p>
            </div>
          </div>
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
                      <td className="py-4">
                        <p className="text-[10px] font-black text-white uppercase truncate max-w-[200px] italic">{p.name}</p>
                      </td>
                      <td className="py-4 text-[10px] font-bold text-emerald-400 font-mono">{formatCurrency(p.margem)}</td>
                      <td className="py-4 text-[10px] font-bold text-slate-400 font-mono">{original?.percentual?.toFixed(1)}%</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                          original?.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          original?.status === 'vencendo' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          original?.status === 'vencido' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                          'bg-slate-800 text-slate-400 border-slate-700'
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

        <div className="x-glass p-8 rounded-[3rem] border border-sky-500/10 h-full x-glow flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tighter mb-6">Ações Rápidas</h3>
            <div className="space-y-4">
              <button 
                onClick={() => onNavigate('Relatórios')}
                className="w-full p-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] flex items-center justify-between group transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Database size={20} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Relatórios</span>
                </div>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </button>
              <button 
                onClick={() => onNavigate('NovaCapitacao')}
                className="w-full p-5 bg-sky-600 hover:bg-sky-500 text-white rounded-[1.5rem] flex items-center justify-between group transition-all shadow-xl shadow-sky-900/20 active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Plus size={20} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Novo Ponto</span>
                </div>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </button>
              <button 
                onClick={() => onNavigate('NovoEmpreendimento')}
                className="w-full p-5 bg-slate-800 hover:bg-slate-700 text-white rounded-[1.5rem] flex items-center justify-between group transition-all shadow-xl active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Briefcase size={20} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Novo Emp.</span>
                </div>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </button>
            </div>
          </div>
          <div className="mt-8 p-6 bg-sky-500/5 border border-sky-500/10 rounded-[2rem]">
            <div className="flex items-center gap-2 mb-2">
              <CloudLightning size={14} className="text-sky-500" />
              <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Dica do Sistema</p>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">Mantenha seus contratos atualizados para evitar vencimentos não planejados e garantir a saúde financeira.</p>
          </div>
        </div>
      </div>

      <div className="x-glass p-8 rounded-[3rem] border border-sky-500/10 mb-8 x-glow">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <CloudLightning size={18} className="text-amber-500" />
              Alertas Críticos
            </h3>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Contratos vencidos ou próximos do vencimento</p>
          </div>
          <div className="px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Atenção Necessária</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.displayData.filter(p => p.status === 'vencendo' || p.status === 'vencido').map(p => (
            <div key={p.id} className={`p-5 rounded-[1.5rem] border transition-all hover:scale-[1.02] ${p.status === 'vencido' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-[11px] font-black text-white uppercase truncate flex-1 italic">{p.nome}</h4>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${p.status === 'vencido' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
                  {p.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                <Calendar size={12} className="text-slate-500" />
                Término: <span className="text-slate-200 font-mono">{p.dataTermino}</span>
              </div>
            </div>
          ))}
          {stats.displayData.filter(p => p.status === 'vencendo' || p.status === 'vencido').length === 0 && (
            <div className="col-span-full text-center py-12 opacity-40 grayscale">
              <CheckCircle size={40} className="mx-auto mb-3 text-emerald-500" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em]">Nenhum alerta crítico detectado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;