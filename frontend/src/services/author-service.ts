import { API_URL, defaultHeaders } from "./api";
import { Autor, CadastroAutorDTO } from "@/types/autores";

export class AuthorService {
  /**
   * POST: Cadastra um novo autor
   */
  async createAuthor(dados: CadastroAutorDTO): Promise<void> {
    const response = await fetch(`${API_URL}/autores/create.php`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(dados),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.mensagem || "Erro ao cadastrar autor");
    }
  }

  /**
   * GET: Lista todos os autores
   */
  async getAllAuthors(): Promise<Autor[]> {
    try {
      const response = await fetch(`${API_URL}/autores/index.php`, {
        method: "GET",
        headers: defaultHeaders,
        cache: "no-store",
      });

      if (!response.ok) return [];

      const json = await response.json();

      // Tratando se a API retorna { data: [...] } ou direto o array [...]
      if (json.data && Array.isArray(json.data)) return json.data;
      if (Array.isArray(json)) return json;

      return [];
    } catch (error) {
      console.error("Erro ao buscar autores:", error);
      return [];
    }
  }

  /**
   * PUT: Atualiza um autor
   */
  async updateAuthor(dados: {
    id_autor: number;
    nome_autor: string;
  }): Promise<void> {
    const response = await fetch(`${API_URL}/autores/update.php`, {
      method: "PUT",
      headers: defaultHeaders,
      body: JSON.stringify(dados),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.mensagem || "Erro ao atualizar autor");
    }
  }

  /**
   * DELETE: Deleta um autor
   */
  async deleteAuthor(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/autores/delete.php?id=${id}`, {
      method: "DELETE",
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.mensagem || "Erro ao eliminar autor");
    }
  }
}