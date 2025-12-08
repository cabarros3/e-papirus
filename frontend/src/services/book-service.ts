import { API_URL, defaultHeaders } from "./api";
import { Livro, CadastroLivroDTO } from "@/types/livros";

export class BookService {
  // GET: Buscar livros
  async getAllBooks(query?: string): Promise<Livro[]> {
    const url = query
      ? `${API_URL}/livros/index.php?q=${encodeURIComponent(query)}`
      : `${API_URL}/livros/index.php`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: defaultHeaders,
        cache: "no-store",
      });

      if (!response.ok) {
        console.error("Erro HTTP:", response.status);
        return [];
      }

      const json = await response.json();

      // --- AQUI ESTÁ A CORREÇÃO MÁGICA ---

      // 1. Se o PHP retornou { status: "sucesso", data: [...] }
      if (json.data && Array.isArray(json.data)) {
        return json.data;
      }

      // 2. Se o PHP retornou o array direto [...] (caso mude o backend)
      if (Array.isArray(json)) {
        return json;
      }

      // 3. Se não for array, retorna vazio para não quebrar o .map na tela
      console.warn("API retornou formato inesperado:", json);
      return [];
    } catch (error) {
      console.error("Erro no fetch:", error);
      return [];
    }
  }

  // POST: Criar livro
  async createBook(dados: CadastroLivroDTO): Promise<void> {
    const response = await fetch(`${API_URL}/livros/index.php`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(dados),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.mensagem || "Erro ao cadastrar");
  }
}
