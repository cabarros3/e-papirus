import { API_URL, defaultHeaders } from "./api";
import { Autor, CadastroAutorDTO } from "@/types/autores";

export class AuthorService {
  /**
   * POST: Cadastra um novo autor
   */
  async createAuthor(dados: CadastroAutorDTO): Promise<void> {
    const response = await fetch(`${API_URL}/autores/create.php`, {
      method: "POST",
      // AJUSTE: Adicionado () para pegar o token do usuário logado
      headers: defaultHeaders(),
      body: JSON.stringify(dados),
    });

    const result = await response.json();
    if (!response.ok || result.status === "erro") {
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
        // AJUSTE: Adicionado () para autorizar a listagem
        headers: defaultHeaders(),
        cache: "no-store",
      });

      if (!response.ok) return [];

      const json = await response.json();

      // Ajustado para o padrão do seu PHP que usa a chave 'dados'
      if (json.dados && Array.isArray(json.dados)) return json.dados;
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
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
      body: JSON.stringify(dados),
    });

    const result = await response.json();

    if (!response.ok || result.status === "erro") {
      throw new Error(result.mensagem || "Erro ao atualizar autor");
    }
  }

  /**
   * DELETE: Deleta um autor
   */
  async deleteAuthor(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/autores/delete.php?id=${id}`, {
      method: "DELETE",
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
    });

    const result = await response.json();

    if (!response.ok || result.status === "erro") {
      throw new Error(result.mensagem || "Erro ao eliminar autor");
    }
  }
}
