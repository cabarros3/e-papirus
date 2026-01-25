export interface Reserva {
  id_reserva: number;
  id_livro: number;
  id_pessoa: number;
  titulo?: string; // Retornado pelo JOIN no index.php
  nome_pessoa?: string; // Retornado pelo JOIN no index.php
  data_reserva: string;
  data_expiracao: string;
  status: "ativa" | "concluida" | "cancelada";
}

export interface CreateReservaDTO {
  id_livro: number;
  id_pessoa: number;
}

export interface ApiResponse<T> {
  status: "sucesso" | "erro";
  mensagem: string;
  dados: T | null;
}
