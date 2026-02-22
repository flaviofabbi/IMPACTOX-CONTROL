
import React, { useState, useEffect } from 'react';
import { Save, X, DollarSign, MapPin, Briefcase, TrendingUp, Activity, FileText, Calendar, Timer, Hash, Pencil, AlertCircle, Loader2, Globe, CheckCircle2, XCircle } from 'lucide-react';
import { Capitacao, Empreendimento } from '../types';

interface Props {
  empreendimentos: Empreendimento[];
  initialData?: Capitacao;
  onSave: (data: Omit<Capitacao, 'id' | 'data' | 'mes'>) => void;
  onCancel: () => void;
}

const NovaCapitacaoScreen: React.FC<Props> = ({ empreendimentos, initialData, onSave, onCancel }) => {
  const isEditing = !!initialData;
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    valor_proposta_display: '',
    valor_pago_display: '',
    valor_proposta: 0,
    valor_pago: 0,
    margem: 0,
    empreendimento: empreendimentos.length > 0 ? empreendimentos[0].nome : '',
    status: 'ativo' as 'ativo' | 'inativo' | 'vencido' | 'pendente',
    data_inicio: new Date().toISOString().split('T')[0],
    periodo: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  });

  const [cnpjError, setCnpjError] = useState<string | null>(null);

  const fetchCnpjData = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return;

    setIsFetchingCnpj(true);
    setCnpjError(null);

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!response.ok) throw new Error('CNPJ não encontrado');
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        nome: data.razao_social || data.nome_fantasia || prev.nome,
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        bairro: data.bairro || '',
        cidade: data.municipio || '',
        uf: data.uf || '',
        cep: data.cep || '',
      }));
    } catch (err) {
      console.error(err);
      setCnpjError('CNPJ não encontrado automaticamente.');
    } finally {
      setIsFetchingCnpj(false);
    }
  };

  const handleCurrencyChange = (field: 'valor_proposta' | 'valor_pago', value: string) => {
    let cleanValue = value.replace(/\D/g, '');
    let numberValue = (Number(cleanValue) / 100);
    const masked = numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    setFormData(prev => ({
      ...prev,
      [`${field}_display`]: masked,
      [field]: numberValue
    }));
  };

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        nome: initialData.nome,
        cnpj: initialData.cnpj,
        valor_proposta: initialData.valor_proposta,
        valor_pago: initialData.valor_pago,
        valor_proposta_display: initialData.valor_proposta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        valor_pago_display: initialData.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        margem: initialData.margem,
        empreendimento: initialData.empreendimento,
        status: initialData.status,
        data_inicio: initialData.data_inicio,
        periodo: initialData.periodo,
        logradouro: initialData.logradouro || '',
        numero: initialData.numero || '',
        bairro: initialData.bairro || '',
        cidade: initialData.cidade || '',
        uf: initialData.uf || '',
        cep: initialData.cep || ''
      });
    }
  }, [initialData, isEditing]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, margem: prev.valor_pago - prev.valor_proposta }));
  }, [formData.valor_proposta, formData.valor_pago]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nome: formData.nome,
      cnpj: formData.cnpj,
      valor_proposta: formData.valor_proposta,
      valor_pago: formData.valor_pago,
      margem: formData.margem,
      empreendimento: formData.empreendimento,
      status: formData.status,
      data_inicio: formData.data_inicio,
      periodo: formData.periodo,
      logradouro: formData.logradouro,
      numero: formData.numero,
      bairro: formData.bairro,
      cidade: formData.cidade,
      uf: formData.uf,
      cep: formData.cep
    });
  };

  const handleDiscard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('As informações preenchidas serão perdidas. Deseja realmente descartar este registro?')) {
      onCancel();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-40 px-2 relative z-10">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
          {isEditing ? <Pencil className="text-sky-500" /> : <Save className="text-sky-500" />}
          {isEditing ? 'Configuração de Ponto' : 'Novo Registro'}
        </h2>
        <div className="h-1 w-12 bg-sky-500 mt-2 rounded-full"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Box Selector - ATIVO / INATIVO */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, status: 'ativo' }))}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${
              formData.status === 'ativo' 
              ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.2)]' 
              : 'bg-slate-900/50 border-slate-800 opacity-40 grayscale'
            }`}
          >
            <div className={`p-3 rounded-2xl ${formData.status === 'ativo' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
              <CheckCircle2 size={24} />
            </div>
            <div className="text-center">
              <span className={`block text-[10px] font-black uppercase tracking-[0.2em] ${formData.status === 'ativo' ? 'text-white' : 'text-slate-500'}`}>Status: Ativo</span>
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1">Unidade Operando</span>
            </div>
            {formData.status === 'ativo' && <div className="absolute top-0 right-0 p-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div></div>}
          </button>

          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, status: 'inativo' }))}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${
              formData.status === 'inativo' 
              ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.2)]' 
              : 'bg-slate-900/50 border-slate-800 opacity-40 grayscale'
            }`}
          >
            <div className={`p-3 rounded-2xl ${formData.status === 'inativo' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
              <XCircle size={24} />
            </div>
            <div className="text-center">
              <span className={`block text-[10px] font-black uppercase tracking-[0.2em] ${formData.status === 'inativo' ? 'text-white' : 'text-slate-500'}`}>Status: Inativo</span>
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1">Unidade Pausada</span>
            </div>
          </button>
        </div>

        {/* Bloco 1: Identificação */}
        <div className="x-glass p-8 rounded-[2.5rem] border border-sky-500/10 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={16} className="text-sky-500" />
            <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Identificação Fiscal</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">CNPJ do Ponto</label>
              <div className="relative">
                <Hash size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isFetchingCnpj ? 'text-sky-500 animate-spin' : 'text-slate-500'}`} />
                <input 
                  required
                  type="text" 
                  placeholder="00.000.000/0000-00"
                  className="w-full pl-12 pr-10 py-4 bg-slate-950/50 border border-sky-500/10 rounded-2xl text-white text-xs outline-none focus:ring-2 transition-all"
                  value={formData.cnpj}
                  onChange={(e) => {
                     const val = e.target.value;
                     setFormData({...formData, cnpj: val});
                     if(val.replace(/\D/g, '').length === 14) fetchCnpjData(val);
                  }}
                />
              </div>
              {cnpjError && <p className="text-[8px] text-red-400 mt-2 ml-2 font-bold uppercase tracking-tight">{cnpjError}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Nome / Razão Social</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-sky-500/10 rounded-2xl text-white text-xs outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 2: Financeiro */}
        <div className="x-glass p-8 rounded-[2.5rem] border border-sky-500/10 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-amber-500" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Financeiro & Contrato</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Real Pago</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-sky-500">R$</span>
                <input 
                  required
                  type="text" 
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-950/50 border border-sky-500/10 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-sky-500/20"
                  value={formData.valor_pago_display}
                  onChange={(e) => handleCurrencyChange('valor_pago', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Valor Proposta</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R$</span>
                <input 
                  required
                  type="text" 
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-950/50 border border-sky-500/10 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-sky-500/20"
                  value={formData.valor_proposta_display}
                  onChange={(e) => handleCurrencyChange('valor_proposta', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Margem Prevista</label>
              <div className={`w-full px-4 py-3.5 bg-slate-950/80 border border-sky-500/5 rounded-xl text-xs font-black flex items-center gap-2 ${formData.margem >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formData.margem >= 0 ? <TrendingUp size={14} /> : <AlertCircle size={14} />}
                R$ {formData.margem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Empreendimento Associado</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <select 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-sky-500/10 rounded-xl text-white text-xs outline-none appearance-none cursor-pointer"
                  value={formData.empreendimento}
                  onChange={(e) => setFormData({...formData, empreendimento: e.target.value})}
                >
                  {empreendimentos.map(emp => (
                    <option key={emp.id} value={emp.nome}>{emp.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-[100] pb-10">
          <button 
            type="button"
            onClick={handleDiscard}
            className="flex-1 py-5 bg-slate-900 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] rounded-[2rem] border border-slate-800 hover:bg-slate-800 hover:text-white transition-all active:scale-[0.98] cursor-pointer shadow-lg relative pointer-events-auto z-[110]"
          >
            <X size={18} className="inline mr-2" /> Descartar
          </button>
          <button 
            type="submit"
            className="flex-[2] py-5 bg-sky-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl shadow-sky-900/40 hover:bg-sky-500 transition-all active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer relative pointer-events-auto z-[110]"
          >
            <Save size={18} /> {isEditing ? 'Atualizar Unidade' : 'Ativar Capitação'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NovaCapitacaoScreen;
