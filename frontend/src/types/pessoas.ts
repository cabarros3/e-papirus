import { ApiResponse } from "./api";

// Interface para LISTAGEM (O que vem do GET)
export interface Pessoa {
  id_pessoa: number;
  nome: string;
  matricula: string;
  cpf: string;
  email: string;
  telefone: string;
  // No JSON de GET veio "aluno" e no POST "Aluno".
  // Mantive string, mas futuramente pode ser um Union Type: 'aluno' | 'professor'
  tipo: string;
}

// Interface para CADASTRO (O que você manda no POST)
export interface CadastroPessoaDTO {
  nome: string;
  matricula: string;
  cpf: string;
  email: string;
  telefone: string;
  tipo: string;
}

// A resposta completa da API
export type PessoaResponse = ApiResponse<Pessoa>;
