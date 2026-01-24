// services/emprestimo-service.ts
import { API_URL, defaultHeaders } from "./api";

export interface Emprestimo {
  id_emprestimo?: number;
  id_exemplar: number;
  id_pessoa: number;
  data_emprestimo: string;
  data_prevista: string;
  data_devolucao?: string | null;
  // Campos extras que seu PHP costuma retornar no JOIN
  nome_pessoa?: string;
  titulo_livro?: string;
}

class EmprestimoService {
  /**
   * Buscar todos os empréstimos
   */
  async getAll(): Promise<Emprestimo[]> {
    try {
      // Ajustado para o caminho do seu backend PHP
      const response = await fetch(`${API_URL}/emprestimos/index.php`, {
        method: "GET",
        headers: defaultHeaders(), // AJUSTE: Envia o Token JWT
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar empréstimos");
      }

      const result = await response.json();

      // O seu PHP usa 'dados', mas deixamos 'data' como fallback
      return (
        result.dados || result.data || (Array.isArray(result) ? result : [])
      );
    } catch (error) {
      console.error("Erro ao buscar empréstimos:", error);
      return [];
    }
  }

  /**
   * Buscar empréstimo por ID
   */
  async getById(id: number): Promise<Emprestimo | null> {
    try {
      const response = await fetch(`${API_URL}/emprestimos/show.php?id=${id}`, {
        method: "GET",
        headers: defaultHeaders(), // AJUSTE: Envia o Token JWT
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar empréstimo");
      }

      const result = await response.json();
      return result.dados || result.data || null;
    } catch (error) {
      console.error("Erro ao buscar empréstimo:", error);
      return null;
    }
  }

  /**
   * Criar novo empréstimo
   */
  async create(emprestimo: Omit<Emprestimo, "id_emprestimo">): Promise<any> {
    try {
      console.log("Enviando dados para empréstimo:", emprestimo);

      const response = await fetch(`${API_URL}/emprestimos/emprestar.php`, {
        method: "POST",
        headers: defaultHeaders(), // AJUSTE: Envia o Token JWT
        body: JSON.stringify(emprestimo),
      });

      const result = await response.json();
      console.log("Resposta do servidor:", result);

      // Verificamos o status 'erro' retornado pela sua função enviarResposta()
      if (!response.ok || result.status === "erro") {
        throw new Error(result.mensagem || "Erro ao criar empréstimo");
      }

      return result.dados || result;
    } catch (error) {
      console.error("Erro ao criar empréstimo:", error);
      throw error;
    }
  }

  /**
   * Registrar devolução
   */
  async devolver(id_emprestimo: number): Promise<void> {
    const response = await fetch(`${API_URL}/emprestimos/devolver.php`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify({ id_emprestimo }),
    });

    const result = await response.json();
    if (!response.ok || result.status === "erro") {
      throw new Error(result.mensagem || "Erro ao processar devolução");
    }
  }
}

export default new EmprestimoService();
