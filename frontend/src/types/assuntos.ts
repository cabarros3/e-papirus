// src/types/assunto.ts
import { ApiResponse } from "./api";

// Interface para LISTAGEM (O que vem do GET)
export interface Assunto {
  id_assunto: number;
  nome_assunto: string;
}

// Interface para CADASTRO (O que você manda no POST)
export interface CadastroAssuntoDTO {
  nome_assunto: string;
}

// A resposta completa da API (Substitui o antigo AssuntoApiResponse manual)
export type AssuntoResponse = ApiResponse<Assunto>;
