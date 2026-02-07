import { ApiResponse } from './api';

// O que vem do banco (GET)
export interface Emprestimo {
  id_emprestimo: number;
  data_emprestimo: string; // Formato "YYYY-MM-DD"
  data_prevista: string; // Formato "YYYY-MM-DD"
  data_devolucao: string | null; // Pode ser null se ainda não devolveu

  titulo: string;
  id_livro: number;
  id_exemplar: number;

  nome_pessoa: string;
  tipo_pessoa: string; // Ex: 'aluno'
  email_pessoa: string;

  situacao: string; // Ex: 'Em dia', 'Finalizado'
  cor: string; // Ex: 'blue', 'green'
}

// O que você envia para criar (POST)
export interface CadastroEmprestimoDTO {
  id_exemplar: number;
  id_pessoa: number;
}

// A resposta completa da API
export type EmprestimoResponse = ApiResponse<Emprestimo>;
