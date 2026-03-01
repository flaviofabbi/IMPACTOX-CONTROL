
import React, { useState, useEffect } from 'react';
import { Save, X, DollarSign, MapPin, Briefcase, TrendingUp, Activity, FileText, Calendar, Timer, Hash, Pencil, AlertCircle, Loader2, Globe, CheckCircle2, XCircle } from 'lucide-react';
import { Capitacao, Empreendimento } from '../types';

interface Props {
  empreendimentos: Empreendimento[];
  capitacoes: Capitacao[];
  initialData?: Capitacao;
  onSave: (data: Omit<Capitacao, 'id' | 'data' | 'mes'>) => void;
  onCancel: () => void;
  logoUrl: string;
}

const NovaCapitacaoScreen: React.FC<Props> = ({ empreendimentos, capitacoes, initialData, onSave, onCancel, logoUrl }) => {
  const isEditing = !!initialData;
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    endereco: '',
    valorContratado: 0,
    valorRepassado: 0,
    valorContratado_display: '',
    valorRepassado_display: '',
    margem: 0,
    percentual: 0,
    empreendimentoId: empreendimentos.length > 0 ? empreendimentos[0].id : '',
    empreendimentoNome: empreendimentos.length > 0 ? empreendimentos[0].nome : '',
    status: 'ativo' as 'ativo' | 'vencendo' | 'vencido' | 'inativo',
    dataInicio: new Date().toISOString().split('T')[0],
    tempoContrato: 12, // meses padrão
    dataTermino: '',
    renovado: false,
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  });

  const [cnpjError, setCnpjError] = useState<string | null>(null);

  const maskCnpj = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const maskCep = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCnpjData = async () => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      showToast('Digite o CNPJ completo para buscar', 'error');
      return;
    }

    // Verificar duplicidade
    const isDuplicate = capitacoes.some(c => c.cnpj.replace(/\D/g, '') === cleanCnpj && c.id !== initialData?.id);
    if (isDuplicate) {
      showToast('Este CNPJ já está cadastrado no sistema!', 'error');
    }

    setIsFetchingCnpj(true);
    setCnpjError(null);

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!response.ok) throw new Error('CNPJ não encontrado');
      
      const data = await response.json();
      
      const fullAddress = `${data.logradouro || ''}, ${data.numero || 'S/N'} - ${data.bairro || ''}, ${data.municipio || ''} - ${data.uf || ''}`;
      
      setFormData(prev => ({
        ...prev,
        nome: data.nome_fantasia || data.razao_social || prev.nome,
        razaoSocial: data.razao_social || '',
        nomeFantasia: data.nome_fantasia || '',
        endereco: fullAddress,
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        bairro: data.bairro || '',
        cidade: data.municipio || '',
        uf: data.uf || '',
        cep: data.cep || '',
      }));
      
      showToast('Empresa carregada com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      setCnpjError('CNPJ não encontrado automaticamente.');
      showToast('Erro ao buscar CNPJ. Verifique os dados.', 'error');
    } finally {
      setIsFetchingCnpj(false);
    }
  };

  const handleCurrencyChange = (field: 'valorContratado' | 'valorRepassado', value: string) => {
    let cleanValue = value.replace(/\D/g, '');
    let numberValue = (Number(cleanValue) / 100);
    const masked = numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    setFormData(prev => ({
      ...prev,
      [`${field}_display`]: masked,
      [field]: numberValue
    }));
  };

  const calculateEndDate = (start: string, months: number) => {
    if (!start) return '';
    const date = new Date(start);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const calculateStatus = (endDate: string) => {
    if (!endDate) return 'ativo';
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'vencido';
    if (diffDays <= 30) return 'vencendo';
    return 'ativo';
  };

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        nome: initialData.nome,
        razaoSocial: initialData.razaoSocial || '',
        nomeFantasia: initialData.nomeFantasia || '',
        cnpj: initialData.cnpj,
        endereco: initialData.endereco || '',
        valorContratado: initialData.valorContratado,
        valorRepassado: initialData.valorRepassado,
        valorContratado_display: initialData.valorContratado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        valorRepassado_display: initialData.valorRepassado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        margem: initialData.margem,
        percentual: initialData.percentual || 0,
        empreendimentoId: initialData.empreendimentoId,
        empreendimentoNome: initialData.empreendimentoNome,
        status: initialData.status,
        dataInicio: initialData.dataInicio,
        tempoContrato: initialData.tempoContrato,
        dataTermino: initialData.dataTermino,
        renovado: initialData.renovado || false,
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
    const margem = formData.valorContratado - formData.valorRepassado;
    const percentual = formData.valorContratado > 0 ? (margem / formData.valorContratado) * 100 : 0;
    const dataTermino = calculateEndDate(formData.dataInicio, formData.tempoContrato);
    
    setFormData(prev => {
      // Só atualiza o status automaticamente se a data de término mudou
      // Isso permite que o usuário clique nos botões de status para sobrescrever manualmente
      const shouldUpdateStatus = prev.dataTermino !== dataTermino;
      const newStatus = shouldUpdateStatus ? calculateStatus(dataTermino) : prev.status;
      
      return { ...prev, margem, percentual, dataTermino, status: newStatus };
    });
  }, [formData.valorContratado, formData.valorRepassado, formData.dataInicio, formData.tempoContrato]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.nome || !formData.cnpj) {
      showToast('Preencha o Nome e CNPJ antes de salvar!', 'error');
      return;
    }

    onSave({
      nome: formData.nome,
      razaoSocial: formData.razaoSocial,
      nomeFantasia: formData.nomeFantasia,
      cnpj: formData.cnpj,
      endereco: formData.endereco || `${formData.logradouro}, ${formData.numero} - ${formData.bairro}, ${formData.cidade} - ${formData.uf}`,
      valorContratado: formData.valorContratado,
      valorRepassado: formData.valorRepassado,
      margem: formData.margem,
      percentual: formData.percentual,
      empreendimentoId: formData.empreendimentoId,
      empreendimentoNome: formData.empreendimentoNome,
      status: formData.status,
      dataInicio: formData.dataInicio,
      tempoContrato: formData.tempoContrato,
      dataTermino: formData.dataTermino,
      renovado: formData.renovado,
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
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-4 z-[300] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4 ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
            {isEditing ? <Pencil className="text-sky-500" /> : <Save className="text-sky-500" />}
            {isEditing ? 'Configuração de Ponto' : 'Novo Registro'}
          </h2>
          <div className="h-1 w-12 bg-sky-500 mt-2 rounded-full"></div>
        </div>
        <img src={logoUrl} className="w-12 h-12 rounded-xl object-cover border border-sky-500/20 shadow-lg" alt="Logo" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Box Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, status: 'ativo' }))}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              formData.status === 'ativo' ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-900/50 border-slate-800 opacity-40'
            }`}
          >
            <CheckCircle2 size={20} className={formData.status === 'ativo' ? 'text-emerald-500' : 'text-slate-500'} />
            <span className="text-[8px] font-black uppercase tracking-widest">Ativo</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, status: 'vencendo' }))}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              formData.status === 'vencendo' ? 'bg-amber-500/10 border-amber-500' : 'bg-slate-900/50 border-slate-800 opacity-40'
            }`}
          >
            <Timer size={20} className={formData.status === 'vencendo' ? 'text-amber-500' : 'text-slate-500'} />
            <span className="text-[8px] font-black uppercase tracking-widest">Vencendo</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, status: 'vencido' }))}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              formData.status === 'vencido' ? 'bg-rose-500/10 border-rose-500' : 'bg-slate-900/50 border-slate-800 opacity-40'
            }`}
          >
            <AlertCircle size={20} className={formData.status === 'vencido' ? 'text-rose-500' : 'text-slate-500'} />
            <span className="text-[8px] font-black uppercase tracking-widest">Vencido</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, status: 'inativo' }))}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              formData.status === 'inativo' ? 'bg-slate-700/20 border-slate-500' : 'bg-slate-900/50 border-slate-800 opacity-40'
            }`}
          >
            <XCircle size={20} className={formData.status === 'inativo' ? 'text-slate-300' : 'text-slate-500'} />
            <span className="text-[8px] font-black uppercase tracking-widest">Inativo</span>
          </button>
        </div>

        {/* Bloco 1: Identificação */}
        <div className="x-glass p-8 rounded-[2.5rem] border border-sky-500/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-sky-500" />
              <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Identificação Fiscal</span>
            </div>
            <button 
              type="button"
              onClick={() => handleSubmit()}
              className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-90 flex items-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer pointer-events-auto"
            >
              <Save size={14} />
              Salvar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">CNPJ do Ponto</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isFetchingCnpj ? 'text-sky-500 animate-spin' : 'text-slate-500'}`} />
                  <input 
                    required
                    type="text" 
                    placeholder="00.000.000/0000-00"
                    className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-sky-500/10 rounded-2xl text-white text-xs outline-none focus:ring-2 transition-all"
                    value={formData.cnpj}
                    onChange={(e) => {
                       const val = maskCnpj(e.target.value);
                       setFormData({...formData, cnpj: val});
                    }}
                  />
                </div>
                <button
                  type="button"
                  disabled={isFetchingCnpj || formData.cnpj.replace(/\D/g, '').length !== 14}
                  onClick={fetchCnpjData}
                  className={`px-4 rounded-2xl flex items-center justify-center transition-all ${
                    isFetchingCnpj || formData.cnpj.replace(/\D/g, '').length !== 14
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-900/20'
                  }`}
                >
                  {isFetchingCnpj ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                </button>
              </div>
              {cnpjError && <p className="text-[8px] text-red-400 mt-2 ml-2 font-bold uppercase tracking-tight">{cnpjError}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Nome do Ponto (Nome Fantasia)</label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Razão Social</label>
              <input 
                type="text" 
                className="w-full px-4 py-4 bg-slate-950/50 border border-sky-500/10 rounded-2xl text-white text-xs outline-none"
                value={formData.razaoSocial}
                onChange={(e) => setFormData({...formData, razaoSocial: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Endereço Completo</label>
              <input 
                type="text" 
                className="w-full px-4 py-4 bg-slate-950/50 border border-sky-500/10 rounded-2xl text-white text-xs outline-none"
                value={formData.endereco}
                onChange={(e) => setFormData({...formData, endereco: e.target.value})}
              />
            </div>
          </div>

          {/* Endereço Detalhado - Compacto */}
          <div className="pt-4 border-t border-sky-500/5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 ml-2">Logradouro & Número</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Rua..."
                    className="flex-[3] px-4 py-3 bg-slate-950/30 border border-sky-500/5 rounded-xl text-white text-[10px] outline-none"
                    value={formData.logradouro}
                    onChange={(e) => setFormData({...formData, logradouro: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Nº"
                    className="flex-1 px-4 py-3 bg-slate-950/30 border border-sky-500/5 rounded-xl text-white text-[10px] outline-none"
                    value={formData.numero}
                    onChange={(e) => setFormData({...formData, numero: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 ml-2">Bairro</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-950/30 border border-sky-500/5 rounded-xl text-white text-[10px] outline-none"
                  value={formData.bairro}
                  onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 ml-2">Cidade</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-950/30 border border-sky-500/5 rounded-xl text-white text-[10px] outline-none"
                    value={formData.cidade}
                    onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 ml-2">UF</label>
                  <input 
                    type="text" 
                    maxLength={2}
                    className="w-full px-4 py-3 bg-slate-950/30 border border-sky-500/5 rounded-xl text-white text-[10px] outline-none uppercase"
                    value={formData.uf}
                    onChange={(e) => setFormData({...formData, uf: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 ml-2">CEP</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-950/30 border border-sky-500/5 rounded-xl text-white text-[10px] outline-none"
                  value={formData.cep}
                  onChange={(e) => setFormData({...formData, cep: maskCep(e.target.value)})}
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
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Valor Contratado</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-sky-500">R$</span>
                <input 
                  required
                  type="text" 
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-950/50 border border-sky-500/10 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-sky-500/20"
                  value={formData.valorContratado_display}
                  onChange={(e) => handleCurrencyChange('valorContratado', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Valor Repassado</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R$</span>
                <input 
                  required
                  type="text" 
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-950/50 border border-sky-500/10 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-sky-500/20"
                  value={formData.valorRepassado_display}
                  onChange={(e) => handleCurrencyChange('valorRepassado', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Margem de Lucro</label>
              <div className={`w-full px-4 py-3.5 bg-slate-950/80 border border-sky-500/5 rounded-xl text-xs font-black flex items-center gap-2 ${formData.margem >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formData.margem >= 0 ? <TrendingUp size={14} /> : <AlertCircle size={14} />}
                R$ {formData.margem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Data Início</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required
                  type="date" 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-sky-500/10 rounded-xl text-white text-xs outline-none"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({...formData, dataInicio: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Tempo Contrato (Meses)</label>
              <div className="relative">
                <Timer size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required
                  type="number" 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-sky-500/10 rounded-xl text-white text-xs outline-none"
                  value={formData.tempoContrato}
                  onChange={(e) => setFormData({...formData, tempoContrato: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Data Término</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  readOnly
                  type="date" 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950/20 border border-sky-500/5 rounded-xl text-white/50 text-xs outline-none"
                  value={formData.dataTermino}
                />
              </div>
            </div>

            <div className="md:col-span-3 flex items-center gap-3 bg-slate-950/30 p-4 rounded-2xl border border-sky-500/5">
              <input 
                type="checkbox"
                id="renovado"
                className="w-5 h-5 rounded bg-slate-900 border-sky-500/20 text-sky-500 focus:ring-sky-500/20 cursor-pointer"
                checked={formData.renovado}
                onChange={(e) => setFormData({...formData, renovado: e.target.checked})}
              />
              <label htmlFor="renovado" className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-pointer select-none">
                Contrato Renovado / Prorrogado
              </label>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Empreendimento Associado</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <select 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-sky-500/10 rounded-xl text-white text-xs outline-none appearance-none cursor-pointer"
                  value={formData.empreendimentoId}
                  onChange={(e) => {
                    const emp = empreendimentos.find(emp => emp.id === e.target.value);
                    setFormData({...formData, empreendimentoId: e.target.value, empreendimentoNome: emp?.nome || ''});
                  }}
                >
                  {empreendimentos.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nome}</option>
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
