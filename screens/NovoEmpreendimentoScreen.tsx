
import React, { useState } from 'react';
import { Save, X, Briefcase, User, Calendar, Activity, CheckCircle, Clock } from 'lucide-react';
import { Empreendimento } from '../types';

interface Props {
  onSave: (data: Omit<Empreendimento, 'id'>) => void;
  onCancel: () => void;
}

const NovoEmpreendimentoScreen: React.FC<Props> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    profissional: '',
    data: new Date().toISOString().split('T')[0],
    status: 'agendado' as 'concluido' | 'agendado'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.profissional || !formData.data) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    onSave(formData);
  };

  const handleDiscard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('As informações preenchidas serão perdidas. Deseja realmente descartar este registro?')) {
      onCancel();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto pb-32 px-1">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Briefcase className="text-sky-500" size={20} /> Novo Empreendimento
        </h2>
        <p className="text-slate-400 mt-1 text-[10px] uppercase tracking-widest font-black">Registro de Unidade Operacional</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Identificação da Unidade</label>
            <div className="relative">
              <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500/50" />
              <input 
                required
                type="text" 
                placeholder="Ex: Unidade Sul / Hospital X"
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-600 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Profissional Responsável</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500/50" />
              <input 
                required
                type="text" 
                placeholder="Nome do gestor..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-600 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                value={formData.profissional}
                onChange={(e) => setFormData({...formData, profissional: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Data Prevista</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500/50" />
                <input 
                  required
                  type="date" 
                  className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-[10px] focus:ring-1 focus:ring-sky-500 outline-none"
                  value={formData.data}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Status Inicial</label>
              <div className="relative">
                <Activity size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500/50" />
                <select 
                  className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-[10px] focus:ring-1 focus:ring-sky-500 outline-none appearance-none cursor-pointer"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="agendado">Agendado</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="button"
            onClick={handleDiscard}
            className="flex-1 py-3 bg-slate-800 text-slate-400 font-bold rounded-xl text-[9px] uppercase tracking-widest hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Descartar
          </button>
          <button 
            type="submit"
            className="flex-[2] py-3 bg-sky-600 text-white font-bold rounded-xl text-[9px] uppercase tracking-widest shadow-lg shadow-sky-900/20 hover:bg-sky-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save size={14} /> Salvar Unidade
          </button>
        </div>
      </form>
    </div>
  );
};

export default NovoEmpreendimentoScreen;
