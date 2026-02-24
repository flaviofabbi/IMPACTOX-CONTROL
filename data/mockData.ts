
import { Capitacao, Empreendimento } from '../types';

export const capitacoes: Capitacao[] = [
  {
    id: 1,
    nome: "Ponto Central",
    cnpj: "12.345.678/0001-90",
    valorContratado: 1700,
    valorRepassado: 2500,
    margem: 800,
    percentual: 47,
    status: "ativo",
    empreendimentoId: "1",
    empreendimentoNome: "Empreendimento A",
    dataInicio: "2024-01-01",
    tempoContrato: 12,
    dataTermino: "2025-01-01"
  },
  {
    id: 2,
    nome: "Zona Norte",
    cnpj: "98.765.432/0001-10",
    valorContratado: 1300,
    valorRepassado: 1800,
    margem: 500,
    percentual: 38,
    status: "vencido",
    empreendimentoId: "2",
    empreendimentoNome: "Empreendimento B",
    dataInicio: "2023-10-15",
    tempoContrato: 6,
    dataTermino: "2024-04-15"
  },
  {
    id: 3,
    nome: "Hospital Regional",
    cnpj: "45.123.890/0001-55",
    valorContratado: 3000,
    valorRepassado: 4200,
    margem: 1200,
    percentual: 40,
    status: "ativo",
    empreendimentoId: "3",
    empreendimentoNome: "Empreendimento C",
    dataInicio: "2024-03-01",
    tempoContrato: 12,
    dataTermino: "2025-03-01"
  }
];

export const empreendimentos: Empreendimento[] = [
  { id: "1", nome: "Empreendimento A", responsavel: "Dr. Silva", telefone: "(11) 99999-9999", email: "silva@emp.com", status: "ativo" },
  { id: "2", nome: "Empreendimento B", responsavel: "Dra. Maria", telefone: "(11) 88888-8888", email: "maria@emp.com", status: "ativo" },
  { id: "3", nome: "Empreendimento C", responsavel: "Dr. Ricardo", telefone: "(11) 77777-7777", email: "ricardo@emp.com", status: "ativo" },
];
