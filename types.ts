
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
  valor_proposta: number; // valorFechado
  valor_pago: number;     // valorReal
  margem: number;
  percentual?: number;
  status: 'ativo' | 'inativo' | 'vencido' | 'pendente';
  empreendimento: string;
  mes: string;
  data: string;
  data_inicio: string;
  periodo: string;
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
  profissional: string;
  data: string;
  status: 'concluido' | 'agendado';
  userId?: string;
}

export type AppTab = 'Dashboard' | 'Capitações' | 'Empreendimentos' | 'Novo' | 'Config';
