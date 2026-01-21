import { API_URL, defaultHeaders } from "./api";

export interface Exemplar {
  id_exemplar?: number;
  id_livro: number;
  localizacao: string;
  disponibilidade: 'disponivel' | 'emprestado' | 'reservado';
}

export interface ExemplarComLivro extends Exemplar {
  titulo: string;
  editora: string;
}

export class ExemplaresService {
  static async getAllExemplares(): Promise<Exemplar[]> {
    const response = await fetch(`${API_URL}/exemplares/index.php`, {
      method: "GET",
      headers: defaultHeaders,
      cache: "no-store"
    });

    if (!response.ok) return [];
    
    const json = await response.json();

    // Tratando retorno direto ou dentro de data
    return json.data || (Array.isArray(json) ? json : []);
  }

  static async getExemplaresComLivro(): Promise<ExemplarComLivro[]> {
    const response = await fetch(`${API_URL}/exemplares/index.php`, {
        method: "GET",
        headers: defaultHeaders,
        cache: "no-store"
    });

    if (!response.ok) return [];
    
    const result = await response.json();
    return result.data || []; // ✅ IMPORTANTE: retornar result.data
}

  static async createExemplar(dados: Exemplar): Promise<void> {
    const response = await fetch(`${API_URL}/exemplares/create.php`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Erro ao cadastrar exemplar");
    }
  }

  static async updateExemplar(dados: Exemplar): Promise<void> {
    const response = await fetch(`${API_URL}/exemplares/update.php`, {
      method: "PUT",
      headers: defaultHeaders,
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Erro ao atualizar exemplar");
    }
  }

  static async deleteExemplar(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/exemplares/delete.php?id=${id}`, {
      method: "DELETE",
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Erro ao excluir exemplar");
    }
  }
}