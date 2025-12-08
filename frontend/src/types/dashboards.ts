import { ApiResponse } from "./api";
import { Emprestimo } from "./emprestimos"; // <--- Importamos a tipagem correta

// ... (Interfaces do Admin continuam iguais)

// O Objeto de dados do Usuário
export interface DashboardUserData {
  ativos: number;
  atrasados: number;
  historico_lidos: number;

  // CORREÇÃO: Usamos Emprestimo[] ao invés de any[].
  // Isso garante que você consiga acessar .data_prevista, .titulo, etc.
  meus_livros: Emprestimo[];
}

export type DashboardUserResponse = ApiResponse<DashboardUserData>; // Se o backend retornar { data: ... }
// OU se o backend retornar objeto direto no data igual o Admin:
export interface DashboardUserResponseDirect {
  status: string;
  message: string;
  data: DashboardUserData;
}
