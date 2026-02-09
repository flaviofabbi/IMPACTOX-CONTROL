
import { Capitacao, Empreendimento } from '../types';

export const capitacoes: Capitacao[] = [
  {
    id: 1,
    nome: "Ponto Central",
    cnpj: "12.345.678/0001-90",
    valor_proposta: 1700,
    valor_pago: 2500,
    margem: 800,
    status: "ativo",
    empreendimento: "Empreendimento A",
    mes: "Jan",
    data: "2024-01-15",
    data_inicio: "2024-01-01",
    periodo: "12 meses"
  },
  {
    id: 2,
    nome: "Zona Norte",
    cnpj: "98.765.432/0001-10",
    valor_proposta: 1300,
    valor_pago: 1800,
    margem: 500,
    status: "vencido",
    empreendimento: "Empreendimento B",
    mes: "Fev",
    data: "2024-02-10",
    data_inicio: "2023-10-15",
    periodo: "6 meses"
  },
  {
    id: 3,
    nome: "Hospital Regional",
    cnpj: "45.123.890/0001-55",
    valor_proposta: 3000,
    valor_pago: 4200,
    margem: 1200,
    status: "ativo",
    empreendimento: "Empreendimento C",
    mes: "Mar",
    data: "2024-03-20",
    data_inicio: "2024-03-01",
    periodo: "Indeterminado"
  }
];

export const empreendimentos: Empreendimento[] = [
  { id: 1, nome: "Empreendimento A", profissional: "Dr. Silva", data: "2024-06-01", status: "agendado" },
  { id: 2, nome: "Empreendimento B", profissional: "Dra. Maria", data: "2024-05-30", status: "concluido" },
  { id: 3, nome: "Empreendimento C", profissional: "Dr. Ricardo", data: "2024-06-05", status: "agendado" },
];
