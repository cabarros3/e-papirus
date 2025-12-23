import { API_URL, defaultHeaders } from "./api";
import {
  Assunto,
  CadastroAssuntoDTO,
  UpdateAssuntoDTO,
} from "@/types/assuntos";

export class SubjectService {
  async getAllSubjects(): Promise<Assunto[]> {
    try {
      const response = await fetch(`${API_URL}/assuntos/index.php`, {
        method: "GET",
        headers: defaultHeaders,
        cache: "no-store",
      });

      if (!response.ok) return [];
      const json = await response.json();

      // Tratando retorno direto ou dentro de .data
      return json.data || (Array.isArray(json) ? json : []);
    } catch (error) {
      console.error("Erro ao buscar assuntos:", error);
      return [];
    }
  }

  async createSubject(dados: CadastroAssuntoDTO): Promise<void> {
    const response = await fetch(`${API_URL}/assuntos/create.php`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.mensagem || "Erro ao cadastrar assunto");
    }
  }

  async updateSubject(dados: UpdateAssuntoDTO): Promise<void> {
    const response = await fetch(`${API_URL}/assuntos/update.php`, {
      method: "PUT", // Ou POST se o PHP não aceitar PUT
      headers: defaultHeaders,
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.mensagem || "Erro ao atualizar assunto");
    }
  }

  async deleteSubject(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/assuntos/delete.php?id=${id}`, {
      method: "DELETE",
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.mensagem || "Erro ao excluir assunto");
    }
  }
}
