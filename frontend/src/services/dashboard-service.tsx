import { API_URL, defaultHeaders } from "./api";

export interface DashboardData {
  total_livros: number;
  total_exemplares: number;
  total_usuarios: number;
  emprestimos_ativos: number;
  emprestimos_atrasados: number;
  atividade_recente: {
    leitor: string;
    titulo: string;
    data_emprestimo: string;
  }[];
  top_livros: {
    titulo: string;
    total_saidas: number;
  }[];
}

export class DashboardService {
  async getStats(): Promise<DashboardData | null> {
    try {
      const response = await fetch(`${API_URL}/dashboards/admin.php`, {
        method: "GET",
        headers: defaultHeaders,
        cache: "no-store",
      });

      if (!response.ok) return null;
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      return null;
    }
  }
}
