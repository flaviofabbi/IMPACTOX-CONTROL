
import React, { useState, useMemo } from 'react';
import { Capitacao, Empreendimento } from '../types';
import { 
  FileSpreadsheet, 
  FileText, 
  Search, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Calendar,
  ArrowDownToLine,
  PieChart as PieChartIcon
} from 'lucide-react';
import { exportToExcel, exportTableToPDF } from '../src/utils/exportUtils';
import FinanceChart from '../components/FinanceChart';
import CategoryBarChart from '../components/CategoryBarChart';
import StatusPieChart from '../components/StatusPieChart';

interface Props {
  capitacoes: Capitacao[];
  empreendimentos: Empreendimento[];
  logoUrl: string;
}

const RelatoriosScreen: React.FC<Props> = ({ capitacoes, empreendimentos, logoUrl }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'vencendo' | 'vencido' | 'inativo'>('all');
  const [empFilter, setEmpFilter] = useState<string>('all');
  const [tipoEmpFilter, setTipoEmpFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = useMemo(() => {
    return capitacoes.filter(item => {
      const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.cnpj.includes(searchTerm) ||
                           item.empreendimentoNome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesEmp = empFilter === 'all' || String(item.empreendimentoId) === empFilter;
      
      const emp = empreendimentos.find(e => String(e.id) === String(item.empreendimentoId));
      const matchesTipo = tipoEmpFilter === 'all' || (emp && emp.tipo === tipoEmpFilter);

      const matchesDate = (startDate === '' || item.dataTermino >= startDate) && 
                         (endDate === '' || item.dataTermino <= endDate);

      return matchesSearch && matchesStatus && matchesEmp && matchesTipo && matchesDate;
    });
  }, [capitacoes, empreendimentos, searchTerm, statusFilter, empFilter, tipoEmpFilter, startDate, endDate]);

  const totals = useMemo(() => {
    const contratado = filteredItems.reduce((a, b) => a + (Number(b.valorContratado) || 0), 0);
    const repassado = filteredItems.reduce((a, b) => a + (Number(b.valorRepassado) || 0), 0);
    const margem = filteredItems.reduce((a, b) => a + (Number(b.margem) || 0), 0);
    return { contratado, repassado, margem };
  }, [filteredItems]);

  const chartData = useMemo(() => {
    // Top 8 points by margin for the chart
    return [...filteredItems]
      .sort((a, b) => b.margem - a.margem)
      .slice(0, 8)
      .map(item => ({
        label: item.nome.length > 12 ? item.nome.substring(0, 10) + '..' : item.nome,
        value: item.margem
      }));
  }, [filteredItems]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {
      'Residencial': 0,
      'Comercial': 0,
      'Misto': 0,
      'Loteamento': 0,
      'Hospitalar': 0,
      'Outros': 0
    };

    empreendimentos.forEach(emp => {
      if (emp.tipo && categories[emp.tipo] !== undefined) {
        categories[emp.tipo]++;
      } else {
        categories['Outros']++;
      }
    });

    return Object.entries(categories)
      .filter(([_, value]) => value > 0)
      .map(([label, value]) => ({ label, value }));
  }, [empreendimentos]);

  const statusData = useMemo(() => {
    const ativos = filteredItems.filter(c => c.status === 'ativo').length;
    const vencendo = filteredItems.filter(c => c.status === 'vencendo').length;
    const vencidos = filteredItems.filter(c => c.status === 'vencido').length;
    const inativos = filteredItems.filter(c => c.status === 'inativo').length;

    return [
      { name: 'Ativos', value: ativos, color: '#10b981' },
      { name: 'Vencendo', value: vencendo, color: '#f59e0b' },
      { name: 'Vencidos', value: vencidos, color: '#ef4444' },
      { name: 'Inativos', value: inativos, color: '#64748b' },
    ].filter(d => d.value > 0);
  }, [filteredItems]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleExportExcel = () => {
    const exportData = filteredItems.map(item => ({
      Nome: item.nome,
      CNPJ: item.cnpj,
      Empreendimento: item.empreendimentoNome,
      'Valor Contratado': item.valorContratado,
      'Valor Repassado': item.valorRepassado,
      Margem: item.margem,
      Status: item.status,
      Renovado: item.renovado ? 'Sim' : 'Não',
      'Data Término': item.dataTermino
    }));
    exportToExcel(exportData, `Relatorio_Detalhado_${new Date().toISOString().split('T')[0]}`, 'Relatório');
  };

  const handleExportPDF = () => {
    const headers = ['Nome', 'Empreendimento', 'Vencimento', 'Status', 'Renovado', 'Margem'];
    const rows = filteredItems.map(item => [
      item.nome,
      item.empreendimentoNome,
      item.dataTermino,
      item.status.toUpperCase(),
      item.renovado ? 'SIM' : 'NÃO',
      formatCurrency(item.margem)
    ]);
    exportTableToPDF(headers, rows, `Relatorio_Executivo_${new Date().toISOString().split('T')[0]}`, 'Relatório Executivo de Capitações');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Relatórios <span className="text-sky-500">Executivos</span></h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Extração de dados e análise de performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
          >
            <FileSpreadsheet size={16} /> Exportar Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"
          >
            <FileText size={16} /> Exportar PDF
          </button>
          <img src={logoUrl} className="w-12 h-12 rounded-xl object-cover border border-sky-500/20 ml-2" alt="Logo" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-500/20 p-8 rounded-[2.5rem] flex flex-col justify-between shadow-2xl shadow-emerald-900/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <TrendingUp size={120} />
           </div>
           <div>
             <p className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest mb-1">Margem de Lucro Total (Filtro)</p>
             <h3 className="text-4xl font-black text-white italic tracking-tighter">{formatCurrency(totals.margem)}</h3>
           </div>
           <div className="mt-8 flex items-center gap-4">
             <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
               <p className="text-[8px] font-black text-emerald-100 uppercase tracking-widest">Média por Ponto</p>
               <p className="text-sm font-bold text-white">{formatCurrency(filteredItems.length ? totals.margem / filteredItems.length : 0)}</p>
             </div>
             <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
               <p className="text-[8px] font-black text-emerald-100 uppercase tracking-widest">ROI Estimado</p>
               <p className="text-sm font-bold text-white">
                 {totals.repassado ? ((totals.margem / totals.repassado) * 100).toFixed(1) : 0}%
               </p>
             </div>
           </div>
        </div>
        
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] flex flex-col justify-center gap-2">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-2xl w-fit">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Contratado</p>
            <p className="text-xl font-black text-white italic">{formatCurrency(totals.contratado)}</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] flex flex-col justify-center gap-2">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl w-fit">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Pontos Ativos</p>
            <p className="text-xl font-black text-white italic">{filteredItems.length} Unidades</p>
          </div>
        </div>
      </div>

      {filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-500" />
                  Margem (Top 8)
                </h3>
              </div>
            </div>
            <div className="h-[180px]">
              <FinanceChart data={chartData} />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-sky-500" />
                  Categorias
                </h3>
              </div>
            </div>
            <div className="h-[180px]">
              <CategoryBarChart data={categoryData} />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <PieChartIcon size={14} className="text-purple-500" />
                  Status (%)
                </h3>
              </div>
            </div>
            <div className="h-[180px]">
              <StatusPieChart data={statusData} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, CNPJ ou unidade..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Filter size={18} /> Filtros {showFilters ? 'Ativos' : 'Avançados'}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-6 bg-slate-950/30 rounded-3xl border border-slate-800 animate-in slide-in-from-top-4 duration-300">
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="all">Todos Status</option>
                <option value="ativo">Ativo</option>
                <option value="vencendo">Vencendo</option>
                <option value="vencido">Vencido</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Empreendimento</label>
              <select 
                value={empFilter}
                onChange={(e) => setEmpFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="all">Todos</option>
                {empreendimentos.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Vencimento (De)</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Vencimento (Até)</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="pb-4 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Ponto / CNPJ</th>
                <th className="pb-4 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Unidade</th>
                <th className="pb-4 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Vencimento</th>
                <th className="pb-4 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Renovado</th>
                <th className="pb-4 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Margem</th>
                <th className="pb-4 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="group hover:bg-sky-500/5 transition-all">
                  <td className="py-5 px-4">
                    <p className="text-[11px] font-black text-white uppercase italic">{item.nome}</p>
                    <p className="text-[8px] text-slate-500 font-mono mt-1">{item.cnpj}</p>
                  </td>
                  <td className="py-5 px-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.empreendimentoNome}</span>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 font-mono">
                      <Calendar size={12} className="text-slate-500" />
                      {item.dataTermino}
                    </div>
                  </td>
                  <td className="py-5 px-4 text-center">
                    {item.renovado ? (
                      <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded text-[8px] font-black uppercase tracking-widest">Sim</span>
                    ) : (
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Não</span>
                    )}
                  </td>
                  <td className="py-5 px-4 text-right">
                    <p className="text-[11px] font-black text-emerald-400 font-mono italic">{formatCurrency(item.margem)}</p>
                    <p className="text-[8px] text-slate-500 font-mono mt-1">{item.percentual?.toFixed(1)}%</p>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                      item.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      item.status === 'vencendo' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      item.status === 'vencido' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <ArrowDownToLine size={40} className="mx-auto mb-4 text-slate-700 opacity-20" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nenhum dado encontrado para os filtros aplicados</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosScreen;
