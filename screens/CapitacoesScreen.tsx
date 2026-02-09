
import React, { useState, useMemo, useRef } from 'react';
import { Capitacao, Empreendimento } from '../types';
import { Search, Filter, Trash2, MoreVertical, Calendar, Target, ArrowUpRight, ArrowDownRight, Briefcase, Hash, UploadCloud, Edit, X, Save, DollarSign, Timer, MapPin, FileText, FileSpreadsheet, Plus, Download, Pencil } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  capitacoes: Capitacao[];
  empreendimentos: Empreendimento[];
  onDelete: (id: number) => void;
  onUpdate: (item: Capitacao) => void;
  onImport: (data: any) => void;
  onImportExcel?: (items: Capitacao[]) => void;
}

const CapitacoesScreen: React.FC<Props> = ({ capitacoes, empreendimentos, onDelete, onUpdate, onImport, onImportExcel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'vencido' | 'pendente'>('all');
  const [showOptions, setShowOptions] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelImportInputRef = useRef<HTMLInputElement>(null);

  const MARGEM_META = 20;

  const handleDownloadTemplate = () => {
    const templateData = [{
      'Nome do Ponto': 'Exemplo Hospital Central',
      'CNPJ': '00.000.000/0001-00',
      'Empreendimento': empreendimentos[0]?.nome || 'Empreendimento A',
      'Status': 'ativo',
      'REAL PAGO': 2200.00,
      'PROPOSTA': 1500.00,
      'Data Inicio': '2024-01-01',
      'Periodo': '12 meses'
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo");
    XLSX.writeFile(wb, "Modelo_Importacao_ImpactoX.xlsx");
  };

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = meses[new Date().getMonth()];

        const importedItems: Capitacao[] = jsonData.map((row, index) => {
          const vProposta = Number(row['PROPOSTA'] || row['Valor Proposta'] || row['valor_proposta'] || 0);
          const vPago = Number(row['REAL PAGO'] || row['Valor Pago'] || row['valor_pago'] || 0);
          
          return {
            id: Date.now() + index,
            nome: String(row['Nome do Ponto'] || row['nome'] || 'Novo Ponto'),
            cnpj: String(row['CNPJ'] || row['cnpj'] || ''),
            empreendimento: String(row['Empreendimento'] || row['empreendimento'] || (empreendimentos[0]?.nome || '')),
            status: (row['Status'] || row['status'] || 'ativo').toLowerCase() as any,
            valor_proposta: vProposta,
            valor_pago: vPago,
            margem: vPago - vProposta,
            data_inicio: String(row['Data Inicio'] || row['data_inicio'] || today),
            periodo: String(row['Periodo'] || row['periodo'] || 'Indeterminado'),
            mes: currentMonth,
            data: today
          };
        });

        if (onImportExcel) {
          onImportExcel(importedItems);
        }
      } catch (err) {
        alert('Erro ao processar planilha. Verifique se o formato está correto.');
      }
    };
    reader.readAsArrayBuffer(file);
    if (event.target) event.target.value = '';
  };

  const handleExportExcel = () => {
    const dataToExport = filteredItems.map(item => ({
      'Nome do Ponto': item.nome,
      'CNPJ': item.cnpj,
      'Empreendimento': item.empreendimento,
      'Status': item.status.toUpperCase(),
      'Data de Início': new Date(item.data_inicio).toLocaleDateString('pt-BR'),
      'Período': item.periodo,
      'REAL PAGO (R$)': item.valor_pago,
      'PROPOSTA (R$)': item.valor_proposta,
      'Margem Bruta (R$)': item.margem,
      'Margem (%)': item.valor_pago > 0 ? ((item.margem / item.valor_pago) * 100).toFixed(2) + '%' : '0%'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Capitacoes");
    XLSX.writeFile(workbook, `Relatorio_Capitacoes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredItems = useMemo(() => {
    return capitacoes.filter(item => {
      const matchesSearch = 
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.cnpj.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [capitacoes, searchTerm, statusFilter]);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          onImport(json);
        } catch (err) {
          alert('Erro ao ler arquivo de backup.');
        }
      };
      reader.readAsText(file);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'vencido': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const handleConfirmDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    onDelete(id);
    setShowOptions(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileImport} />
      <input type="file" ref={excelImportInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleExcelImport} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Capitações</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Gestão de carteira ativa</p>
        </div>
        <div className="flex flex-wrap md:flex-nowrap gap-2">
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg font-bold hover:bg-slate-700 transition-all text-[9px]"
          >
            <Download size={14} /> MODELO
          </button>
          <button 
            onClick={() => excelImportInputRef.current?.click()}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-sky-600/10 text-sky-400 border border-sky-500/20 rounded-lg font-bold hover:bg-sky-600 hover:text-white transition-all text-[9px]"
          >
            <UploadCloud size={14} /> IMPORT EXCEL
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold hover:bg-emerald-600 hover:text-white transition-all text-[9px]"
          >
            <FileSpreadsheet size={14} /> EXPORT
          </button>
          <div className="relative flex-1 md:w-40">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all text-[10px]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {filteredItems.length > 0 ? filteredItems.map((item) => {
          const margemReal = item.valor_pago > 0 ? (item.margem / item.valor_pago) * 100 : 0;
          const estaNaMeta = margemReal >= MARGEM_META;

          return (
            <div 
              key={item.id} 
              className={`group bg-slate-900 p-4 rounded-3xl shadow-sm border transition-all relative overflow-hidden ${
                estaNaMeta ? 'border-emerald-500/20' : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-100 text-sm tracking-tight truncate">{item.nome}</h4>
                    <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0 ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2 text-slate-500 overflow-hidden">
                    <Hash size={9} className="text-sky-500/50" />
                    <span className="text-[9px] font-mono truncate">{item.cnpj || 'Sem CNPJ'}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-400">
                    <span className="flex items-center gap-1"><Briefcase size={10} className="text-sky-500" /> {item.empreendimento}</span>
                    <span className="flex items-center gap-1"><Calendar size={10} className="text-amber-500" /> {formatDate(item.data_inicio)}</span>
                  </div>
                </div>

                <div className="w-full lg:w-48 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[7px] font-black uppercase tracking-tight text-slate-500">Performance ROI</span>
                    <span className={`text-[10px] font-black ${estaNaMeta ? 'text-emerald-400' : 'text-amber-400'}`}>{margemReal.toFixed(1)}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${estaNaMeta ? 'bg-gradient-to-r from-sky-500 to-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(margemReal, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-3 lg:pl-5 lg:border-l border-slate-800 shrink-0">
                  <div className="text-right">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-tighter mb-0.5">REAL PAGO</p>
                    <p className="text-sm font-black text-white">{formatCurrency(item.valor_pago)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onUpdate(item)}
                      className="p-2 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white border border-sky-500/20 rounded-xl transition-all shadow-lg shadow-sky-950/20"
                      title="Editar Dados Completos"
                    >
                      <Pencil size={16} />
                    </button>

                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowOptions(showOptions === item.id ? null : item.id); }}
                        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {showOptions === item.id && (
                        <div className="absolute right-0 top-full mt-1.5 w-32 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in zoom-in-95 duration-200">
                          <button 
                            onClick={() => onUpdate(item)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:bg-sky-500/10 hover:text-sky-400 text-[10px] font-bold transition-colors"
                          >
                            <Edit size={12} /> Editar
                          </button>
                          <button 
                            onClick={(e) => handleConfirmDelete(e, item.id)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-red-400 hover:bg-red-500/10 text-[10px] font-bold border-t border-slate-700/50 mt-1"
                          >
                            <Trash2 size={12} /> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-12 text-center bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-800 flex flex-col items-center">
            <UploadCloud size={32} className="text-slate-700 mb-3" />
            <p className="text-slate-400 font-bold mb-4 text-xs uppercase tracking-widest">Base de Dados Vazia</p>
            <div className="flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-[10px] uppercase tracking-widest"
              >
                <UploadCloud size={14} /> Restaurar Nucleo
              </button>
              <button 
                onClick={handleDownloadTemplate}
                className="px-5 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-700 transition-all text-[10px] uppercase tracking-widest"
              >
                Baixar Modelo Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapitacoesScreen;
