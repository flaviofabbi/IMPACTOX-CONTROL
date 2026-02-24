
export interface UserProfile {
  id: string;
  nome: string;
  email: string;
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
  id: string | number;
  nome: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  cnpj: string;
  endereco?: string;
  valorContratado: number;
  valorRepassado: number;
  margem: number;
  percentual?: number;
  status: 'ativo' | 'vencendo' | 'vencido' | 'inativo';
  empreendimentoId: string | number;
  empreendimentoNome: string;
  dataInicio: string;
  tempoContrato: number; // meses
  dataTermino: string;
  userId?: string;
  createdAt?: any;
  // Campos de endereço detalhados (mantidos para compatibilidade)
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}

export interface Empreendimento {
  id: string | number;
  nome: string;
  responsavel: string;
  telefone: string;
  email: string;
  status: 'ativo' | 'inativo';
  userId?: string;
  createdAt?: any;
}

export type AppTab = 'Dashboard' | 'Capitações' | 'Empreendimentos' | 'Novo' | 'Config';
