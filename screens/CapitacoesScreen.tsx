
import React, { useState, useMemo, useEffect } from 'react';
import { Capitacao, Empreendimento } from '../types';
import { Search, Trash2, Hash, Briefcase, CheckCircle, CircleX, Filter, Activity, Pencil, Calendar, Send, FileSpreadsheet, FileText, RotateCcw, Globe } from 'lucide-react';
import { exportToExcel, exportTableToPDF } from '../src/utils/exportUtils';
import { formatCurrency, calculateStatus } from '../lib/importUtils';
import { usePersistentFilters } from '../src/hooks/usePersistentFilters';

interface Props {
  capitacoes: Capitacao[];
  empreendimentos: Empreendimento[];
  onDelete: (id: string | number) => void;
  onDeleteInactive?: () => void;
  onUpdate: (item: Capitacao) => void;
  onImport: (data: any) => void;
  onImportFile?: (file: File) => void;
  logoUrl: string;
}

const CapitacoesScreen: React.FC<Props> = ({ capitacoes, empreendimentos, onDelete, onDeleteInactive, onUpdate, logoUrl }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters, resetFilters] = usePersistentFilters('capitacoes_filters', {
    status: 'all' as 'all' | 'ativo' | 'vencendo' | 'vencido' | 'inativo',
    empId: 'all',
    tipoEmp: 'all',
    startDate: '',
    endDate: '',
    minValor: '',
    maxValor: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-show advanced if any advanced filter is active
  useEffect(() => {
    if (filters.empId !== 'all' || filters.tipoEmp !== 'all' || filters.startDate || filters.endDate || filters.minValor || filters.maxValor) {
      setShowAdvanced(true);
    }
  }, []);

  const filteredItems = useMemo(() => {
    return capitacoes.filter(item => {
      const matchesSearch = 
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.cnpj && item.cnpj.includes(searchTerm));
      const matchesStatus = filters.status === 'all' || item.status === filters.status;
      const matchesEmp = filters.empId === 'all' || String(item.empreendimentoId) === filters.empId;
      
      const emp = empreendimentos.find(e => String(e.id) === String(item.empreendimentoId));
      const matchesTipo = filters.tipoEmp === 'all' || (emp && emp.tipo === filters.tipoEmp);

      const matchesDate = (filters.startDate === '' || item.dataTermino >= filters.startDate) && 
                         (filters.endDate === '' || item.dataTermino <= filters.endDate);
      
      const val = Number(item.valorContratado) || 0;
      const matchesMin = filters.minValor === '' || val >= Number(filters.minValor);
      const matchesMax = filters.maxValor === '' || val <= Number(filters.maxValor);

      return matchesSearch && matchesStatus && matchesEmp && matchesTipo && matchesDate && matchesMin && matchesMax;
    });
  }, [capitacoes, empreendimentos, searchTerm, filters]);

  const hasInactive = useMemo(() => {
    return capitacoes.some(c => c.status === 'inativo');
  }, [capitacoes]);


  const handleExportExcel = () => {
    const exportData = filteredItems.map(item => ({
      Nome: item.nome,
      CNPJ: item.cnpj,
      Empreendimento: item.empreendimentoNome,
      'Valor Repassado': item.valorContratado,
      'Valor Pago': item.valorRepassado,
      Margem: item.margem,
      Status: item.status,
      'Data Término': item.dataTermino
    }));
    exportToExcel(exportData, `Capitacoes_${new Date().toISOString().split('T')[0]}`, 'Capitacoes');
  };

  const handleExportPDF = () => {
    const headers = ['Nome', 'CNPJ', 'Empreendimento', 'Vencimento', 'Status', 'Margem'];
    const rows = filteredItems.map(item => [
      item.nome,
      item.cnpj,
      item.empreendimentoNome,
      item.dataTermino,
      item.status,
      formatCurrency(item.margem)
    ]);
    exportTableToPDF(headers, rows, `Relatorio_Capitacoes_${new Date().toISOString().split('T')[0]}`, 'Relatório de Pontos de Captação');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Carteira de Pontos</h2>
          <p className="text-[10px] text-sky-500/60 font-black uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
            <Activity size={12} /> {capitacoes.length} Unidades Mapeadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportExcel}
            className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl transition-all active:scale-90 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest"
            title="Exportar Excel"
          >
            <FileSpreadsheet size={14} />
            Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all active:scale-90 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest"
            title="Exportar PDF"
          >
            <FileText size={14} />
            PDF
          </button>
          <img src={logoUrl} className="w-16 h-16 rounded-2xl object-cover ml-2" alt="Logo" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2 items-center">
          {hasInactive && onDeleteInactive && (
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteInactive(); }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl font-black hover:bg-rose-600 hover:text-white transition-all text-[9px] uppercase tracking-widest shadow-lg shadow-rose-900/20 active:scale-95 cursor-pointer relative z-50 pointer-events-auto"
            >
              <Trash2 size={14} /> Limpar Inativos
            </button>
          )}

          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
            <button onClick={() => setFilters({ status: 'all' })} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filters.status === 'all' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Todos</button>
            <button onClick={() => setFilters({ status: 'ativo' })} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filters.status === 'ativo' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-emerald-400'}`}>Ativos</button>
            <button onClick={() => setFilters({ status: 'vencendo' })} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filters.status === 'vencendo' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-amber-400'}`}>Vencendo</button>
            <button onClick={() => setFilters({ status: 'vencido' })} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filters.status === 'vencido' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-rose-400'}`}>Vencidos</button>
            <button onClick={() => setFilters({ status: 'inativo' })} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filters.status === 'inativo' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-400'}`}>Inativos</button>
          </div>

          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black transition-all text-[9px] uppercase tracking-widest border ${showAdvanced ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-sky-500/30'}`}
          >
            <Filter size={14} /> {showAdvanced ? 'Ocultar Filtros' : 'Filtros Avançados'}
          </button>

          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-black transition-all text-[9px] uppercase tracking-widest border bg-slate-900/50 text-slate-400 border-slate-800 hover:text-rose-400 hover:border-rose-500/30"
            title="Resetar Filtros"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-slate-900/40 rounded-[2rem] border border-slate-800 animate-in slide-in-from-top-4 duration-300">
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Empreendimento</label>
            <select 
              value={filters.empId}
              onChange={(e) => setFilters({ empId: e.target.value })}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="all">Todos</option>
              {empreendimentos.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Tipo de Empreendimento</label>
            <select 
              value={filters.tipoEmp}
              onChange={(e) => setFilters({ tipoEmp: e.target.value })}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="all">Todos</option>
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
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Vencimento (Até)</label>
            <input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => setFilters({ endDate: e.target.value })}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Valor Mínimo</label>
            <input 
              type="number" 
              placeholder="R$ 0,00"
              value={filters.minValor}
              onChange={(e) => setFilters({ minValor: e.target.value })}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Valor Máximo</label>
            <input 
              type="number" 
              placeholder="R$ 1.000.000,00"
              value={filters.maxValor}
              onChange={(e) => setFilters({ maxValor: e.target.value })}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
          type="text" 
          placeholder="Busca rápida..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-[1.5rem] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all text-xs font-medium"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredItems.map((item) => {
          const currentStatus = calculateStatus(item.dataTermino);
          const isAtivo = currentStatus === 'ativo';
          const isVencendo = currentStatus === 'vencendo';
          const isVencido = currentStatus === 'vencido';

          const statusColor = isAtivo ? 'bg-emerald-500' : 
                             isVencendo ? 'bg-amber-500' :
                             isVencido ? 'bg-rose-500' : 'bg-slate-600';

          return (
            <div 
              key={item.id} 
              className="group relative bg-slate-900/30 hover:bg-slate-900/60 border border-slate-800/50 hover:border-sky-500/30 p-4 md:p-5 rounded-2xl transition-all duration-300 backdrop-blur-sm"
            >
              {/* Left Status Accent */}
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full ${statusColor} opacity-50 group-hover:opacity-100 transition-opacity`} />

              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                {/* Main Info Section */}
                <div className="flex-1 min-w-0 ml-2">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-white text-base tracking-tight truncate uppercase italic">{item.nome}</h4>
                    <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                      isAtivo ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      isVencendo ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      isVencido ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {currentStatus}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Hash size={12} className="text-sky-500/70" /> {item.cnpj}</span>
                    <span className="flex items-center gap-1.5"><Briefcase size={12} className="text-sky-500/70" /> {item.empreendimentoNome}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-sky-500/70" /> {item.dataTermino}</span>
                    {item.telefone && (
                      <span className="flex items-center gap-1.5" title="WhatsApp 1"><Globe size={12} className="text-emerald-500/70" /> {item.telefone}</span>
                    )}
                    {item.telefone2 && (
                      <span className="flex items-center gap-1.5" title={`WhatsApp 2 (${item.nomeResponsavel2 || 'Responsável 2'})`}><Globe size={12} className="text-emerald-500/70" /> {item.telefone2}</span>
                    )}
                    {item.renovado && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
                        <Activity size={8} /> Renovado
                      </span>
                    )}
                    {item.aviso5DiasEnviado && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
                        <Send size={8} /> Aviso 5D Enviado
                      </span>
                    )}
                  </div>
                </div>

                {/* Values Section */}
                <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 border-t md:border-t-0 md:border-l border-slate-800/50 pt-3 md:pt-0 md:pl-6">
                  <div className="text-left md:text-right">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Valor Repassado</p>
                    <p className="text-sm font-black text-white tracking-tight">{formatCurrency(item.valorContratado)}</p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Valor Pago</p>
                    <p className="text-sm font-black text-white tracking-tight">{formatCurrency(item.valorRepassado)}</p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Margem</p>
                    <p className={`text-sm font-black tracking-tight ${item.margem >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(item.margem)}
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpdate(item); }}
                      className="p-2.5 bg-sky-500/5 text-sky-400 hover:bg-sky-500 hover:text-white border border-sky-500/20 rounded-xl transition-all active:scale-90 cursor-pointer"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>

                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item.id); }}
                      className="p-2.5 bg-rose-500/5 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all active:scale-90 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="py-24 text-center bg-slate-900/40 rounded-[3rem] border-4 border-dashed border-slate-800 flex flex-col items-center">
            <Filter size={48} className="text-slate-800 mb-6" />
            <p className="text-slate-500 font-black text-xs uppercase tracking-[0.4em]">Filtro sem correspondência</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapitacoesScreen;
