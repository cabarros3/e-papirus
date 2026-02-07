// src/types/livro.ts
import { ApiResponse } from './api';

// Interface para LISTAGEM (O que vem do GET)
export interface Livro {
  id_livro: number;
  titulo: string;
  editora: string;
  ano_publicacao: string;
  nome_assunto: string;
  nomes_autores: string;
  // Adicionei opcionais que vi no seu código PHP, caso precise no futuro:
  cidade_publicacao?: string;
  descricao_fisica?: string;
  nota_resumo?: string;
  capa: string;
}

// Interface para CADASTRO (O que você manda no POST)
export interface CadastroLivroDTO {
  titulo: string;
  id_assunto: number;
  editora: string;
  ano_publicacao: number;
  autores: number[];
  // Opcionais do cadastro (baseado no seu PHP):
  cidade_publicacao?: string;
  nota_resumo?: string;
  descricao_fisica?: string;
  capa?: string;
}

// Tipo para a resposta completa (se você padronizar o JSON de livros igual aos outros)
export type LivroResponse = ApiResponse<Livro>;
