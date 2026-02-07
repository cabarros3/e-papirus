// @/types/reservas.ts

export interface Reserva {
  id_reserva: number;
  id_livro: number;
  id_pessoa: number;
  titulo?: string;
  nome_pessoa?: string;
  data_reserva: string;
  data_expiracao: string;
  status: 'ativa' | 'concluida' | 'cancelada';
}

/**
 * DTO para criação de reserva.
 * O id_pessoa é opcional (?) porque o backend agora identifica
 * o usuário logado via Token JWT.
 */
export interface CreateReservaDTO {
  id_livro: number;
  id_pessoa?: number; // Adicionada a interrogação aqui
}

export interface ApiResponse<T> {
  status: 'sucesso' | 'erro';
  mensagem: string;
  dados: T | null;
}
