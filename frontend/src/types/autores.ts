import { ApiResponse } from "./api";

// O que vem do banco (GET)
export interface Autor {
  id_autor: number;
  nome_autor: string;
}

// O que você envia para criar (POST)
export interface CadastroAutorDTO {
  nome_autor: string;
}

// A resposta completa da API
export type AutorResponse = ApiResponse<Autor>;
