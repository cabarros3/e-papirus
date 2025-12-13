import { ApiResponse } from "./api";

// O que vem do banco (GET)
export interface Exemplar {
  id_exemplar: number;
  localizacao: string;
  disponibilidade: string; // Ex: 'reservado' | 'disponivel'
  id_livro: number;
  titulo: string;
  editora: string;
}

// O que você envia para criar (POST)
export interface CadastroExemplarDTO {
  id_livro: number;
  localizacao: string;
}

// A resposta completa da API
export type ExemplarResponse = ApiResponse<Exemplar>;
