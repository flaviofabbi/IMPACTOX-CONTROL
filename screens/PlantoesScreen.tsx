
import React, { useState } from 'react';
import { Empreendimento } from '../types';
import { Briefcase, User, ChevronRight, Plus, Calendar, MoreVertical, Trash2, Edit, X, Save, Pencil } from 'lucide-react';

interface Props {
  empreendimentos: Empreendimento[];
  onAddRequest: () => void;
  onDelete: (id: string | number) => void;
  onUpdate: (updated: Empreendimento) => void;
}

const PlantoesScreen: React.FC<Props> = ({ empreendimentos, onAddRequest, onDelete, onUpdate }) => {
  const [showOptions, setShowOptions] = useState<string | number | null>(null);
  const [editingItem, setEditingItem] = useState<Empreendimento | null>(null);

  const handleEditClick = (item: Empreendimento) => {
    setEditingItem(item);
    setShowOptions(null);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onUpdate(editingItem);
      setEditingItem(null);
    }
  };

  const handleActionDelete = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
    setShowOptions(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Empreendimentos</h2>
          <p className="text-slate-400 mt-1 text-[10px] uppercase font-black tracking-widest">Escala de Unidades Operacionais</p>
        </div>
        <button 
          onClick={onAddRequest}
          className="md:hidden p-4 bg-sky-500 text-white rounded-full shadow-lg shadow-sky-900/40 active:scale-95 cursor-pointer z-50"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {empreendimentos.map((e) => (
          <div key={e.id} className="bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-800 hover:border-sky-500/30 transition-all group relative">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl ${e.status === 'concluido' ? 'bg-slate-800' : 'bg-sky-500/10'} text-sky-400`}>
                <Briefcase size={24} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase ${e.status === 'concluido' ? 'bg-slate-800 text-slate-400' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                  {e.status}
                </span>
                
                <div className="flex items-center gap-2 ml-2 z-50 pointer-events-auto">
                  <button 
                    onClick={(ev) => handleActionDelete(ev, e.id)}
                    className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all active:scale-90 cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleEditClick(e)}
                    className="p-2 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white border border-sky-500/20 rounded-xl transition-all active:scale-90 cursor-pointer"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <h4 className="text-xl font-black text-slate-100 mb-4 uppercase italic">{e.nome}</h4>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <User size={16} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">Responsável</p>
                  <p className="text-sm font-bold text-slate-200 mt-1">{e.profissional}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <Calendar size={16} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">Data Prevista</p>
                  <p className="text-sm font-bold text-slate-200 mt-1">{new Date(e.data).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleEditClick(e)}
              className="w-full py-4 bg-slate-800 group-hover:bg-sky-600/10 text-slate-300 group-hover:text-sky-400 font-black rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-700 group-hover:border-sky-500/30 text-[10px] uppercase tracking-widest cursor-pointer"
            >
              Configurar <ChevronRight size={18} />
            </button>
          </div>
        ))}

        <button 
          onClick={onAddRequest}
          className="border-2 border-dashed border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-slate-500 hover:border-sky-500/50 hover:text-sky-400 transition-all hover:bg-sky-500/5 cursor-pointer active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-3">
            <Plus size={24} />
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest">Novo Registro</span>
        </button>
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
                <Edit className="text-sky-400" /> Detalhes da Unidade
              </h3>
              <button onClick={() => setEditingItem(null)} className="p-3 text-slate-500 hover:text-white bg-slate-800 rounded-full transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nome do Empreendimento</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  value={editingItem.nome}
                  onChange={(e) => setEditingItem({...editingItem, nome: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Profissional Responsável</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                  value={editingItem.profissional}
                  onChange={(e) => setEditingItem({...editingItem, profissional: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Data Prevista</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                    value={editingItem.data}
                    onChange={(e) => setEditingItem({...editingItem, data: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Status</label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none transition-all appearance-none cursor-pointer"
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({...editingItem, status: e.target.value as any})}
                  >
                    <option value="agendado">Agendado</option>
                    <option value="concluido">Concluido</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-5 bg-slate-800 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-5 bg-sky-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-sky-900/30 hover:bg-sky-500 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Save size={18} /> Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantoesScreen;
