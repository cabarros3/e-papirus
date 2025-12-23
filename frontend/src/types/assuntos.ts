import { ApiResponse } from "./api";

export interface Assunto {
  id_assunto: number;
  nome_assunto: string;
}

export interface CadastroAssuntoDTO {
  nome_assunto: string;
}

// Adicionando para garantir que o Update siga o seu padrão de backend
export interface UpdateAssuntoDTO {
  id_assunto: number;
  nome_assunto: string;
}

export type AssuntoResponse = ApiResponse<Assunto>;
