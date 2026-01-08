import { ApiResponse } from "./api";

// 1. Definição dos tipos permitidos no ENUM do banco
export type TipoPessoa = "aluno" | "professor" | "funcionario";
export type CargoFuncionario = "bibliotecario" | "auxiliar" | "estagiario";

// Interface para LISTAGEM (O que vem do GET)
export interface Pessoa {
  id_pessoa: number;
  nome: string;
  matricula: string;
  cpf: string;
  email: string;
  telefone: string | null; // Pode vir nulo do banco
  tipo: TipoPessoa;
  cargo: CargoFuncionario | null; // Alunos e professores terão isso como null
}

// Interface para CADASTRO (O que você manda no POST)
export interface CadastroPessoaDTO {
  nome: string;
  matricula: string;
  cpf: string;
  email: string;
  telefone?: string; // Interrogação torna opcional no objeto
  tipo: TipoPessoa;
  cargo?: CargoFuncionario | null; // Opcional ou nulo
}

// A resposta completa da API
export type PessoaResponse = ApiResponse<Pessoa>;
