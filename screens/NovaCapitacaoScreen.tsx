
import React, { useState, useEffect } from 'react';
import { Save, X, DollarSign, MapPin, Briefcase, TrendingUp, Activity, FileText, Calendar, Timer, Hash, Pencil, AlertCircle } from 'lucide-react';
import { Capitacao, Empreendimento } from '../types';

interface Props {
  empreendimentos: Empreendimento[];
  initialData?: Capitacao;
  onSave: (data: Omit<Capitacao, 'id' | 'data' | 'mes'>) => void;
  onCancel: () => void;
}

const NovaCapitacaoScreen: React.FC<Props> = ({ empreendimentos, initialData, onSave, onCancel }) => {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    valor_proposta_display: '',
    valor_pago_display: '',
    valor_proposta: 0,
    valor_pago: 0,
    margem: 0,
    empreendimento: empreendimentos.length > 0 ? empreendimentos[0].nome : '',
    status: 'ativo' as 'ativo' | 'vencido' | 'pendente',
    data_inicio: new Date().toISOString().split('T')[0],
    periodo: ''
  });

  const [cnpjError, setCnpjError] = useState<string | null>(null);

  const isValidCnpj = (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return false;
    
    // Elimina CNPJs conhecidos inválidos
    if (/^(\d)\1+$/.test(cleanCnpj)) return false;

    // Valida DVs
    let size = cleanCnpj.length - 2;
    let numbers = cleanCnpj.substring(0, size);
    const digits = cleanCnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cleanCnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  };

  const applyCnpjMask = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const applyCurrencyMask = (value: string) => {
    let cleanValue = value.replace(/\D/g, '');
    let numberValue = (Number(cleanValue) / 100);
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parseCurrencyToNumber = (value: string) => {
    if (!value) return 0;
    return Number(value.replace(/\./g, '').replace(',', '.'));
  };

  const handleCurrencyChange = (field: 'valor_proposta' | 'valor_pago', value: string) => {
    const masked = applyCurrencyMask(value);
    const numeric = parseCurrencyToNumber(masked);
    
    setFormData(prev => ({
      ...prev,
      [`${field}_display`]: masked,
      [field]: numeric
    }));
  };

  const handleCnpjChange = (value: string) => {
    const masked = applyCnpjMask(value);
    setFormData({ ...formData, cnpj: masked });
    
    // Validação em tempo real (limpa erro se estiver digitando)
    if (masked.length < 18) {
      setCnpjError(null);
    } else if (!isValidCnpj(masked)) {
      setCnpjError('CNPJ Inválido');
    } else {
      setCnpjError(null);
    }
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
        periodo: initialData.periodo
      });
    }
  }, [initialData, isEditing]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, margem: prev.valor_pago - prev.valor_proposta }));
  }, [formData.valor_proposta, formData.valor_pago]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidCnpj(formData.cnpj)) {
      setCnpjError('CNPJ Inválido ou incompleto');
      alert('Por favor, insira um CNPJ válido para prosseguir.');
      return;
    }

    if (!formData.nome || formData.valor_proposta === 0 || formData.valor_pago === 0 || !formData.periodo || !formData.empreendimento) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    onSave({
      nome: formData.nome,
      cnpj: formData.cnpj,
      valor_proposta: formData.valor_proposta,
      valor_pago: formData.valor_pago,
      margem: formData.margem,
      empreendimento: formData.empreendimento,
      status: formData.status,
      data_inicio: formData.data_inicio,
      periodo: formData.periodo
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto pb-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          {isEditing ? <Pencil className="text-sky-500" /> : <Save className="text-sky-500" />}
          {isEditing ? 'Gestão de Capitação' : 'Nova Capitação'}
        </h2>
        <p className="text-slate-400 mt-1">
          {isEditing ? 'Atualize os dados técnicos e financeiros deste ponto.' : 'Registre um novo ponto e defina o cronograma de trabalho.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-800 space-y-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-sky-400" /> Nome do Ponto
              </label>
              <input 
                required
                type="text" 
                placeholder="Ex: Hospital Municipal"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2"><Hash size={16} className="text-sky-400" /> CNPJ do Ponto</span>
                {cnpjError && <span className="text-[10px] text-red-400 flex items-center gap-1 font-black uppercase"><AlertCircle size={12} /> {cnpjError}</span>}
              </label>
              <input 
                required
                type="text" 
                placeholder="00.000.000/0000-00"
                className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${cnpjError ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:ring-sky-500'}`}
                value={formData.cnpj}
                onChange={(e) => handleCnpjChange(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-sky-400" /> Início dos Trabalhos
              </label>
              <input 
                required
                type="date" 
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                value={formData.data_inicio}
                onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                <Timer size={16} className="text-amber-400" /> Período / Duração
              </label>
              <input 
                required
                type="text" 
                placeholder="Ex: 12 meses, Indeterminado"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                value={formData.periodo}
                onChange={(e) => setFormData({...formData, periodo: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <DollarSign size={16} className="text-sky-400" /> REAL PAGO
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">R$</span>
                <input 
                  required
                  type="text" 
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  value={formData.valor_pago_display}
                  onChange={(e) => handleCurrencyChange('valor_pago', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <FileText size={16} className="text-slate-400" /> PROPOSTA
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">R$</span>
                <input 
                  required
                  type="text" 
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  value={formData.valor_proposta_display}
                  onChange={(e) => handleCurrencyChange('valor_proposta', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <TrendingUp size={16} className="text-emerald-400" /> Margem (Auto)
              </label>
              <div className="relative">
                <div className={`w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-bold ${formData.margem >= 0 ? 'text-emerald-400' : 'text-red-400'} transition-colors flex items-center`}>
                  <span className="text-slate-500 text-sm font-bold mr-2">R$</span>
                  {formData.margem.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                <Briefcase size={16} /> Empreendimento Relacionado
              </label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all appearance-none cursor-pointer"
                  value={formData.empreendimento}
                  onChange={(e) => setFormData({...formData, empreendimento: e.target.value})}
                >
                  {empreendimentos.map(emp => (
                    <option key={emp.id} value={emp.nome}>{emp.nome}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <Activity size={16} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                <Activity size={16} /> Status Inicial
              </label>
              <select 
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all appearance-none cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="ativo">Ativo</option>
                <option value="vencido">Vencido</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-4">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-800 text-slate-300 font-bold rounded-2xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <X size={20} /> Cancelar
          </button>
          <button 
            type="submit"
            className="flex-[2] py-4 bg-sky-600 text-white font-bold rounded-2xl shadow-lg shadow-sky-900/40 hover:bg-sky-500 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} /> {isEditing ? 'Atualizar Dados' : 'Salvar Capitação'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NovaCapitacaoScreen;
