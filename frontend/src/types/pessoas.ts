import { ApiResponse } from './api';

// 1. Definição dos tipos permitidos no ENUM do banco
export type TipoPessoa = 'aluno' | 'professor' | 'funcionario';
export type CargoFuncionario = 'bibliotecario' | 'auxiliar' | 'estagiario';

// Interface para LISTAGEM (O que vem do GET)
export interface Pessoa {
  id_pessoa: number;
  nome: string;
  matricula: string;
  cpf: string;
  email: string;
  telefone: string | null;
  tipo: TipoPessoa;
  cargo: CargoFuncionario | null;
}

// Interface para CADASTRO (O que você manda no POST)
// Agora inclui a senha necessária para a tabela usuario_sistema
export interface CadastroPessoaDTO {
  nome: string;
  matricula: string;
  cpf: string;
  email: string;
  senha: string; // <-- ADICIONADO: Obrigatória para criar o login
  tipo: TipoPessoa;
  telefone?: string;
  cargo?: CargoFuncionario | null;
}

// Resposta para operações de uma única pessoa
export type PessoaResponse = ApiResponse<Pessoa>;

// Resposta para listagens de várias pessoas
export type PessoasResponse = ApiResponse<Pessoa[]>;
