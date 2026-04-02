
import Papa from 'papaparse';
import { Capitacao, Empreendimento } from '../types';

export interface ImportResult {
  capitacoes: Partial<Capitacao>[];
  empreendimentos: Partial<Empreendimento>[];
  errors: string[];
}

export const parseCSV = (file: File): Promise<ImportResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const capitacoes: Partial<Capitacao>[] = [];
        const empreendimentos: Partial<Empreendimento>[] = [];
        const errors: string[] = [];

        // Simple heuristic to detect if it's a Capitacao or Empreendimento
        // If it has 'valorContratado' or 'cnpj', it's likely a Capitacao
        // If it has 'responsavel', it's likely an Empreendimento
        
        data.forEach((row, index) => {
          try {
            if (row.valorRepassado !== undefined || row.valorContratado !== undefined || row.cnpj !== undefined || row.empreendimentoNome !== undefined) {
              // Map CSV fields to Capitacao object
              // Note: CSV headers are now 'valorRepassado' (old valorContratado) and 'valorPago' (old valorRepassado)
              capitacoes.push({
                nome: row.nome || row.Nome || 'Ponto Sem Nome',
                cnpj: row.cnpj || row.CNPJ || '',
                valorContratado: parseFloat(row.valorRepassado || row.valorContratado || row.ValorRepassado || row.ValorContratado || '0'),
                valorRepassado: parseFloat(row.valorPago || row.valorRepassado_old || row.ValorPago || row.ValorRepassado || '0'),
                margem: parseFloat(row.margem || row.Margem || '0'),
                status: (row.status || row.Status || 'ativo').toLowerCase(),
                empreendimentoId: row.empreendimentoId || row.EmpreendimentoID || '',
                empreendimentoNome: row.empreendimentoNome || row.EmpreendimentoNome || '',
                dataInicio: row.dataInicio || row.DataInicio || new Date().toISOString().split('T')[0],
                tempoContrato: parseInt(row.tempoContrato || row.TempoContrato || '12'),
                dataTermino: row.dataTermino || row.DataTermino || '',
                userId: row.userId || ''
              });
            } else if (row.responsavel !== undefined || row.tipo !== undefined) {
              // Map CSV fields to Empreendimento object
              empreendimentos.push({
                nome: row.nome || row.Nome || 'Empreendimento Sem Nome',
                responsavel: row.responsavel || row.Responsavel || '',
                status: (row.status || row.Status || 'ativo').toLowerCase(),
                email: row.email || row.Email || '',
                telefone: row.telefone || row.Telefone || '',
                tipo: row.tipo || row.Tipo || 'Unidade'
              });
            }
          } catch (e) {
            errors.push(`Erro na linha ${index + 1}: ${e}`);
          }
        });

        resolve({ capitacoes, empreendimentos, errors });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const generateCSVTemplate = (type: 'capitacao' | 'empreendimento'): string => {
  if (type === 'capitacao') {
    const headers = ['nome', 'cnpj', 'valorRepassado', 'valorPago', 'margem', 'status', 'empreendimentoNome', 'dataInicio', 'tempoContrato', 'dataTermino'];
    const sample = ['Ponto Exemplo', '12.345.678/0001-90', '50000', '35000', '15000', 'ativo', 'Unidade Central', '2025-01-01', '12', '2026-01-01'];
    return Papa.unparse([headers, sample]);
  } else {
    const headers = ['nome', 'responsavel', 'status', 'email', 'telefone', 'tipo'];
    const sample = ['Unidade Central', 'Dr. Silva', 'ativo', 'contato@central.com', '11999999999', 'Unidade'];
    return Papa.unparse([headers, sample]);
  }
};

export const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const calculateStatus = (endDate: string): 'ativo' | 'vencendo' | 'vencido' => {
  if (!endDate) return 'ativo';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate + 'T00:00:00');
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'vencido';
  if (diffDays <= 5) return 'vencendo';
  return 'ativo';
};
