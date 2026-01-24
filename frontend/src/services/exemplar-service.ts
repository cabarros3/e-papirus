import { API_URL, defaultHeaders } from "./api";

// Interface do exemplar básico
export interface Exemplar {
  id_exemplar?: number;
  id_livro: number;
  localizacao: string;
  disponibilidade: 'disponivel' | 'emprestado' | 'reservado';
  numero_exemplar?: number;
}

// Interface para exemplar com dados do livro (lista flat)
export interface ExemplarComLivro extends Exemplar {
  titulo: string;
  editora: string;
}

// Interface para exemplar dentro do agrupamento
export interface ExemplarAgrupado {
  id_exemplar: number;
  numero_exemplar: number;
  localizacao: string;
  disponibilidade: 'disponivel' | 'emprestado' | 'reservado';
}

// Interface para livro com seus exemplares agrupados
export interface LivroComExemplares {
  id_livro: number;
  titulo: string;
  editora: string;
  exemplares: ExemplarAgrupado[];
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

  // Mantido para compatibilidade - retorna lista flat
  static async getExemplaresComLivro(): Promise<ExemplarComLivro[]> {
    const response = await fetch(`${API_URL}/exemplares/index.php`, {
      method: "GET",
      headers: defaultHeaders,
      cache: "no-store"
    });

    if (!response.ok) return [];
    
    const result = await response.json();
    
    if (result.status === 'sucesso' && result.data) {
      // Achatar a estrutura agrupada para o formato antigo (compatibilidade)
      const exemplaresList: ExemplarComLivro[] = [];
      result.data.forEach((livro: LivroComExemplares) => {
        livro.exemplares.forEach((exemplar) => {
          exemplaresList.push({
            ...exemplar,
            id_livro: livro.id_livro,
            titulo: livro.titulo,
            editora: livro.editora
          });
        });
      });
      return exemplaresList;
    }
    
    return [];
  }

  // Novo método - retorna livros com exemplares agrupados
  static async getLivrosComExemplares(): Promise<LivroComExemplares[]> {
    const response = await fetch(`${API_URL}/exemplares/index.php`, {
      method: "GET",
      headers: defaultHeaders,
      cache: "no-store"
    });

    if (!response.ok) return [];
    
    const result = await response.json();
    
    if (result.status === 'sucesso') {
      return result.data || [];
    }
    
    return [];
  }

  // Buscar exemplares de um livro específico
  static async getExemplaresPorLivro(idLivro: number): Promise<LivroComExemplares | null> {
    const response = await fetch(`${API_URL}/exemplares/index.php?id_livro=${idLivro}`, {
      method: "GET",
      headers: defaultHeaders,
      cache: "no-store"
    });

    if (!response.ok) return null;
    
    const result = await response.json();
    
    if (result.status === 'sucesso' && result.data && result.data.length > 0) {
      return result.data[0];
    }
    
    return null;
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