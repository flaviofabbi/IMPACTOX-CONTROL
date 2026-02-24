
import React, { useState, useMemo } from 'react';
import { Capitacao, Empreendimento } from '../types';
import { Search, Trash2, Hash, Briefcase, CheckCircle, CircleX, Filter, Activity, Pencil, Calendar } from 'lucide-react';

interface Props {
  capitacoes: Capitacao[];
  empreendimentos: Empreendimento[];
  onDelete: (id: string | number) => void;
  onDeleteInactive?: () => void;
  onUpdate: (item: Capitacao) => void;
  onImport: (data: any) => void;
  logoUrl: string;
}

const CapitacoesScreen: React.FC<Props> = ({ capitacoes, onDelete, onDeleteInactive, onUpdate, logoUrl }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'vencendo' | 'vencido' | 'inativo'>('all');

  const filteredItems = useMemo(() => {
    return capitacoes.filter(item => {
      const matchesSearch = 
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.cnpj && item.cnpj.includes(searchTerm));
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [capitacoes, searchTerm, statusFilter]);

  const hasInactive = useMemo(() => {
    return capitacoes.some(c => c.status === 'inativo');
  }, [capitacoes]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
        <img src={logoUrl} className="w-12 h-12 rounded-xl object-cover border border-sky-500/20 shadow-lg" alt="Logo" />
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
            <button onClick={() => setStatusFilter('all')} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Todos</button>
            <button onClick={() => setStatusFilter('ativo')} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'ativo' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-emerald-400'}`}>Ativos</button>
            <button onClick={() => setStatusFilter('vencendo')} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'vencendo' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-amber-400'}`}>Vencendo</button>
            <button onClick={() => setStatusFilter('vencido')} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'vencido' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-rose-400'}`}>Vencidos</button>
            <button onClick={() => setStatusFilter('inativo')} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === 'inativo' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-400'}`}>Inativos</button>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map((item) => {
          const isAtivo = item.status === 'ativo';
          const isVencendo = item.status === 'vencendo';
          const isVencido = item.status === 'vencido';

          return (
            <div 
              key={item.id} 
              className={`group bg-slate-900/40 backdrop-blur-md p-6 rounded-[2.5rem] border transition-all relative overflow-hidden ${
                isAtivo ? 'border-emerald-500/20 hover:border-emerald-500/40' : 
                isVencendo ? 'border-amber-500/20 hover:border-amber-500/40' :
                isVencido ? 'border-rose-500/20 hover:border-rose-500/40' :
                'border-slate-800 opacity-70'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 border-2 transition-transform group-hover:scale-105 ${
                  isAtivo ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                  isVencendo ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                  isVencido ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                  'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  {isAtivo ? <CheckCircle size={28} /> : isVencido ? <CircleX size={28} /> : <Activity size={28} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h4 className="font-black text-white text-lg tracking-tight truncate uppercase italic">{item.nome}</h4>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border-2 ${
                      isAtivo ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      isVencendo ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      isVencido ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Hash size={14} className="text-sky-500" /> {item.cnpj}</span>
                    <span className="flex items-center gap-2"><Briefcase size={14} className="text-sky-500" /> {item.empreendimentoNome}</span>
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-sky-500" /> Término: {item.dataTermino}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8 md:pl-8 md:border-l border-slate-800">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Valor Contratado</p>
                    <p className="text-xl font-black text-white">{formatCurrency(item.valorContratado)}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <div className={`w-2 h-2 rounded-full ${item.margem >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <p className={`text-[10px] font-black ${item.margem >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Margem: {formatCurrency(item.margem)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 relative z-[100] pointer-events-auto">
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpdate(item); }}
                      className="p-4 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white border-2 border-sky-500/20 rounded-2xl transition-all shadow-xl active:scale-90 cursor-pointer flex items-center justify-center"
                      title="Editar Unidade"
                    >
                      <Pencil size={22} />
                    </button>

                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item.id); }}
                      className="p-4 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border-2 border-rose-500/20 rounded-2xl transition-all shadow-xl active:scale-90 cursor-pointer flex items-center justify-center"
                      title="Excluir Definitivamente"
                    >
                      <Trash2 size={22} />
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
