import { Reserva, CreateReservaDTO, ApiResponse } from "@/types/reservas";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api";

export const reservaService = {
  /**
   * Retorna todas as reservas cadastradas no sistema.
   * Geralmente utilizado pelo perfil administrador/bibliotecário.
   */
  async listarTodas(): Promise<ApiResponse<Reserva[]>> {
    const response = await fetch(`${API_URL}/reservas/index.php`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    return response.json();
  },

  /**
   * Retorna as reservas de um usuário específico.
   * Utilizado no dashboard do aluno/professor.
   */
  async listarPorUsuario(idPessoa: number): Promise<ApiResponse<Reserva[]>> {
    const response = await fetch(
      `${API_URL}/reservas/index.php?id_pessoa=${idPessoa}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );
    return response.json();
  },

  /**
   * Cria uma nova reserva vinculando uma pessoa a um livro.
   */
  async criar(
    dados: CreateReservaDTO,
  ): Promise<ApiResponse<{ id_reserva: number }>> {
    const response = await fetch(`${API_URL}/reservas/create.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  /**
   * Atualiza o status de uma reserva (ex: 'concluida' ou 'cancelada').
   */
  async atualizarStatus(
    id: number,
    status: Reserva["status"],
  ): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_URL}/reservas/update.php`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_reserva: id, status }),
    });
    return response.json();
  },

  /**
   * Remove uma reserva e libera o exemplar para 'disponivel'.
   */
  async cancelar(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_URL}/reservas/delete.php?id=${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  },
};
