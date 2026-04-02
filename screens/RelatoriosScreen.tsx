
import React, { useState, useMemo, useEffect } from 'react';
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
  PieChart as PieChartIcon,
  RotateCcw
} from 'lucide-react';
import { exportToExcel, exportTableToPDF } from '../src/utils/exportUtils';
import { formatCurrency, calculateStatus } from '../lib/importUtils';
import FinanceChart from '../components/FinanceChart';
import CategoryBarChart from '../components/CategoryBarChart';
import StatusPieChart from '../components/StatusPieChart';
import { usePersistentFilters } from '../src/hooks/usePersistentFilters';

interface Props {
  capitacoes: Capitacao[];
  empreendimentos: Empreendimento[];
  logoUrl: string;
}

const RelatoriosScreen: React.FC<Props> = ({ capitacoes, empreendimentos, logoUrl }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters, resetFilters] = usePersistentFilters('relatorios_filters', {
    status: 'all' as 'all' | 'ativo' | 'vencendo' | 'vencido' | 'inativo',
    empId: 'all',
    tipoEmp: 'all',
    startDate: '',
    endDate: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  // Auto-show filters if any filter is active
  useEffect(() => {
    if (filters.status !== 'all' || filters.empId !== 'all' || filters.tipoEmp !== 'all' || filters.startDate || filters.endDate) {
      setShowFilters(true);
    }
  }, []);

  const filteredItems = useMemo(() => {
    return capitacoes.filter(item => {
      const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.cnpj.includes(searchTerm) ||
                           item.empreendimentoNome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || item.status === filters.status;
      const matchesEmp = filters.empId === 'all' || String(item.empreendimentoId) === filters.empId;
      
      const emp = empreendimentos.find(e => String(e.id) === String(item.empreendimentoId));
      const matchesTipo = filters.tipoEmp === 'all' || (emp && emp.tipo === filters.tipoEmp);

      const matchesDate = (filters.startDate === '' || item.dataTermino >= filters.startDate) && 
                         (filters.endDate === '' || item.dataTermino <= filters.endDate);

      return matchesSearch && matchesStatus && matchesEmp && matchesTipo && matchesDate;
    });
  }, [capitacoes, empreendimentos, searchTerm, filters]);

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
    const ativos = filteredItems.filter(c => calculateStatus(c.dataTermino) === 'ativo').length;
    const vencendo = filteredItems.filter(c => calculateStatus(c.dataTermino) === 'vencendo').length;
    const vencidos = filteredItems.filter(c => calculateStatus(c.dataTermino) === 'vencido').length;
    const inativos = filteredItems.filter(c => c.status === 'inativo').length;

    return [
      { name: 'Ativos', value: ativos, color: '#10b981' },
      { name: 'Vencendo', value: vencendo, color: '#f59e0b' },
      { name: 'Vencidos', value: vencidos, color: '#ef4444' },
      { name: 'Inativos', value: inativos, color: '#64748b' },
    ].filter(d => d.value > 0);
  }, [filteredItems]);


  const handleExportExcel = () => {
    const exportData = filteredItems.map(item => ({
      Nome: item.nome,
      CNPJ: item.cnpj,
      Empreendimento: item.empreendimentoNome,
      'Valor Repassado': item.valorContratado,
      'Valor Pago': item.valorRepassado,
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
          <img src={logoUrl} className="w-16 h-16 rounded-2xl object-cover ml-2" alt="Logo" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-500/20 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center text-center justify-between shadow-2xl shadow-emerald-900/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-5 md:p-8 opacity-10 group-hover:scale-110 transition-transform">
             <TrendingUp size={80} className="md:w-[120px] md:h-[120px]" />
           </div>
           <div className="w-full">
             <p className="text-[8px] md:text-[10px] font-black text-emerald-100/60 uppercase tracking-widest mb-1">Margem de Lucro Total (Filtro)</p>
             <h3 className="text-xl md:text-2xl lg:text-4xl font-black text-white italic tracking-tighter break-words">{formatCurrency(totals.margem)}</h3>
           </div>
           <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4 w-full">
             <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
               <p className="text-[7px] md:text-[8px] font-black text-emerald-100 uppercase tracking-widest">Média por Ponto</p>
               <p className="text-xs md:text-sm font-bold text-white">{formatCurrency(filteredItems.length ? totals.margem / filteredItems.length : 0)}</p>
             </div>
             <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
               <p className="text-[7px] md:text-[8px] font-black text-emerald-100 uppercase tracking-widest">ROI Estimado</p>
               <p className="text-xs md:text-sm font-bold text-white">
                 {totals.contratado ? ((totals.margem / totals.contratado) * 100).toFixed(1) : 0}%
               </p>
             </div>
           </div>
        </div>
        
        <div className="bg-slate-900/40 border border-slate-800 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center text-center justify-center gap-2">
          <div className="p-2 md:p-3 bg-sky-500/10 text-sky-500 rounded-xl md:rounded-2xl w-fit">
            <DollarSign size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="w-full">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Repassado</p>
            <p className="text-sm md:text-base lg:text-xl font-black text-white italic break-words">{formatCurrency(totals.contratado)}</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center text-center justify-center gap-2">
          <div className="p-2 md:p-3 bg-indigo-500/10 text-indigo-500 rounded-xl md:rounded-2xl w-fit">
            <Activity size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="w-full">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Pontos Ativos</p>
            <p className="text-sm md:text-base lg:text-xl font-black text-white italic">{filteredItems.length} Unidades</p>
          </div>
        </div>
      </div>

      {filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6">
            <div className="flex items-center justify-center mb-4">
              <div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-500" />
                  Margem (Top 8)
                </h3>
              </div>
            </div>
            <div className="h-[200px]">
              <FinanceChart data={chartData} />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6">
            <div className="flex items-center justify-center mb-4">
              <div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-sky-500" />
                  Categorias
                </h3>
              </div>
            </div>
            <div className="h-[200px]">
              <CategoryBarChart data={categoryData} />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6">
            <div className="flex items-center justify-center mb-4">
              <div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <PieChartIcon size={14} className="text-purple-500" />
                  Status (%)
                </h3>
              </div>
            </div>
            <div className="h-[200px]">
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
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                <Filter size={18} /> Filtros {showFilters ? 'Ativos' : 'Avançados'}
              </button>
              <button 
                onClick={resetFilters}
                className="p-4 bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 rounded-2xl transition-all active:scale-95"
                title="Resetar Filtros"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 p-6 bg-slate-950/30 rounded-3xl border border-slate-800 animate-in slide-in-from-top-4 duration-300">
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({ status: e.target.value as any })}
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
                value={filters.empId}
                onChange={(e) => setFilters({ empId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="all">Todos</option>
                {empreendimentos.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Tipo</label>
              <select 
                value={filters.tipoEmp}
                onChange={(e) => setFilters({ tipoEmp: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="all">Todos Tipos</option>
                <option value="Residencial">Residencial</option>
                <option value="Comercial">Comercial</option>
                <option value="Misto">Misto</option>
                <option value="Loteamento">Loteamento</option>
                <option value="Hospitalar">Hospitalar</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Vencimento (De)</label>
              <input 
                type="date" 
                value={filters.startDate}
                onChange={(e) => setFilters({ startDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Vencimento (Até)</label>
              <input 
                type="date" 
                value={filters.endDate}
                onChange={(e) => setFilters({ endDate: e.target.value })}
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
                <th className="pb-4 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Unidade / Categoria</th>
                <th className="pb-4 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Vencimento</th>
                <th className="pb-4 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Renovado</th>
                <th className="pb-4 px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Margem</th>
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
                  <td className="py-5 px-4 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.empreendimentoNome}</span>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-300 font-mono">
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
                  <td className="py-5 px-4 text-center">
                    <p className="text-[11px] font-black text-emerald-400 font-mono italic">{formatCurrency(item.margem)}</p>
                    <p className="text-[8px] text-slate-500 font-mono mt-1">{item.percentual?.toFixed(1)}%</p>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                      calculateStatus(item.dataTermino) === 'ativo' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      calculateStatus(item.dataTermino) === 'vencendo' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      calculateStatus(item.dataTermino) === 'vencido' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {calculateStatus(item.dataTermino)}
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
