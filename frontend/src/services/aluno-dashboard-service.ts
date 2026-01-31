import { API_URL, defaultHeaders } from "./api";

export interface AlunoDashboardData {
  ativos: number;
  atrasados: number;
  historico_lidos: number;
  meus_livros: {
    id_emprestimo: number;
    data_emprestimo: string;
    data_prevista: string;
    titulo: string;
    capa: string | null;
    status_texto: string;
    cor: "red" | "orange" | "blue";
  }[];
}

export class AlunoDashboardService {
  async getStats(
    idPessoa: number | string,
  ): Promise<AlunoDashboardData | null> {
    if (!idPessoa) {
      console.error("AlunoDashboardService: idPessoa não fornecido.");
      return null;
    }

    try {
      const response = await fetch(
        `${API_URL}/dashboards/user.php?id_pessoa=${idPessoa}`,
        {
          method: "GET",
          headers: defaultHeaders(),
          cache: "no-store",
        },
      );

      // Log para debug rápido no console do navegador
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erro ${response.status}:`, errorText);
        return null;
      }

      const json = await response.json();

      if (json.status === "sucesso") {
        return json.dados;
      }

      console.warn("Backend retornou erro:", json.mensagem);
      return null;
    } catch (error) {
      console.error("Erro de conexão/parsing:", error);
      return null;
    }
  }
}
