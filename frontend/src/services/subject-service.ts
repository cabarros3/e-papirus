import { API_URL, defaultHeaders } from "./api";
import {
  Assunto,
  CadastroAssuntoDTO,
  UpdateAssuntoDTO,
} from "@/types/assuntos";

export class SubjectService {
  /**
   * GET: Lista todos os assuntos (tags/categorias)
   */
  async getAllSubjects(): Promise<Assunto[]> {
    try {
      const response = await fetch(`${API_URL}/assuntos/index.php`, {
        method: "GET",
        headers: defaultHeaders(), // AJUSTE: Adicionado () para enviar Token
        cache: "no-store",
      });

      if (!response.ok) return [];
      const json = await response.json();

      // AJUSTE: Seguindo seu padrão PHP de usar 'dados'
      return json.dados || json.data || (Array.isArray(json) ? json : []);
    } catch (error) {
      console.error("Erro ao buscar assuntos:", error);
      return [];
    }
  }

  /**
   * POST: Cadastra um novo assunto
   */
  async createSubject(dados: CadastroAssuntoDTO): Promise<void> {
    const response = await fetch(`${API_URL}/assuntos/create.php`, {
      method: "POST",
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
      body: JSON.stringify(dados),
    });

    const result = await response.json();

    if (!response.ok || result.status === "erro") {
      throw new Error(result.mensagem || "Erro ao cadastrar assunto");
    }
  }

  /**
   * PUT: Atualiza um assunto existente
   */
  async updateSubject(dados: UpdateAssuntoDTO): Promise<void> {
    const response = await fetch(`${API_URL}/assuntos/update.php`, {
      method: "PUT",
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
      body: JSON.stringify(dados),
    });

    const result = await response.json();

    if (!response.ok || result.status === "erro") {
      throw new Error(result.mensagem || "Erro ao atualizar assunto");
    }
  }

  /**
   * DELETE: Remove um assunto
   */
  async deleteSubject(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/assuntos/delete.php?id=${id}`, {
      method: "DELETE",
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.mensagem || "Erro ao excluir assunto");
    }
  }
}
