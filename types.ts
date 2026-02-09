
export interface UserProfile {
  id: string;
  nome: string;
  cargo: string;
  avatar: string;
  cor: string;
}

export interface AccessLog {
  id: string;
  timestamp: string;
  acao: string;
  detalhes: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  operador?: string;
}

export interface Capitacao {
  id: number;
  nome: string;
  cnpj: string;
  valor_proposta: number;
  valor_pago: number;
  margem: number;
  status: 'ativo' | 'vencido' | 'pendente';
  empreendimento: string;
  mes: string;
  data: string;
  data_inicio: string;
  periodo: string;
}

export interface Empreendimento {
  id: number;
  nome: string;
  profissional: string;
  data: string;
  status: 'concluido' | 'agendado';
}

export type AppTab = 'Dashboard' | 'Capitações' | 'Empreendimentos' | 'Novo' | 'Config';
