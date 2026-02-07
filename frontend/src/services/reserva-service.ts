import { Reserva, CreateReservaDTO, ApiResponse } from '@/types/reservas';
import { AuthService } from './auth-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

/**
 * Helper para gerar os headers com Token automaticamente
 */
const getAuthHeaders = () => {
  const token = AuthService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const reservaService = {
  /**
   * Lista reservas. O PHP decidirá se mostra tudo (staff)
   * ou só as do usuário (aluno/professor) baseado no Token.
   */
  async listarTodas(): Promise<ApiResponse<Reserva[]>> {
    const response = await fetch(`${API_URL}/reservas/index.php`, {
      method: 'GET',
      headers: getAuthHeaders(), // Agora envia o token
      cache: 'no-store',
    });
    return response.json();
  },

  /**
   * Cria uma reserva.
   * Nota: Para Alunos/Professores, o campo id_pessoa no DTO pode ir vazio
   * ou com qualquer valor, pois o PHP vai ignorar e usar o ID do Token.
   */
  async criar(
    dados: CreateReservaDTO
  ): Promise<ApiResponse<{ id_reserva: number }>> {
    const response = await fetch(`${API_URL}/reservas/create.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  async atualizarStatus(
    id: number,
    status: Reserva['status']
  ): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_URL}/reservas/update.php`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id_reserva: id, status }),
    });
    return response.json();
  },

  async cancelar(id: number): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_URL}/reservas/delete.php?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
