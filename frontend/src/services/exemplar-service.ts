import { API_URL, defaultHeaders } from "./api";

// Interface do exemplar básico
export interface Exemplar {
  id_exemplar?: number;
  id_livro: number;
  localizacao: string;
  disponibilidade: "disponivel" | "emprestado" | "reservado";
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
  disponibilidade: "disponivel" | "emprestado" | "reservado";
}

// Interface para livro com seus exemplares agrupados
export interface LivroComExemplares {
  id_livro: number;
  titulo: string;
  editora: string;
  exemplares: ExemplarAgrupado[];
}

export class ExemplaresService {
  /**
   * GET: Todos os exemplares (Geral)
   */
  static async getAllExemplares(): Promise<Exemplar[]> {
    const response = await fetch(`${API_URL}/exemplares/index.php`, {
      method: "GET",
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
      cache: "no-store",
    });

    if (!response.ok) return [];

    const json = await response.json();

    // AJUSTE: Seguindo seu padrão PHP de usar 'dados'
    return json.dados || json.data || (Array.isArray(json) ? json : []);
  }

  /**
   * Mantido para compatibilidade - retorna lista flat de exemplares
   */
  static async getExemplaresComLivro(): Promise<ExemplarComLivro[]> {
    const response = await fetch(`${API_URL}/exemplares/index.php`, {
      method: "GET",
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
      cache: "no-store",
    });

    if (!response.ok) return [];

    const result = await response.json();

    // Verificando se o status é 'sucesso' e acessando 'dados'
    if (result.status === "sucesso" && (result.dados || result.data)) {
      const data = result.dados || result.data;
      const exemplaresList: ExemplarComLivro[] = [];

      data.forEach((livro: LivroComExemplares) => {
        livro.exemplares.forEach((exemplar) => {
          exemplaresList.push({
            ...exemplar,
            id_livro: livro.id_livro,
            titulo: livro.titulo,
            editora: livro.editora,
          });
        });
      });
      return exemplaresList;
    }

    return [];
  }

  /**
   * Retorna livros com exemplares agrupados (Ideal para visualização por obra)
   */
  static async getLivrosComExemplares(): Promise<LivroComExemplares[]> {
    const response = await fetch(`${API_URL}/exemplares/index.php`, {
      method: "GET",
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
      cache: "no-store",
    });

    if (!response.ok) return [];

    const result = await response.json();

    if (result.status === "sucesso") {
      return result.dados || result.data || [];
    }

    return [];
  }

  /**
   * Buscar exemplares de um livro específico
   */
  static async getExemplaresPorLivro(
    idLivro: number,
  ): Promise<LivroComExemplares | null> {
    const response = await fetch(
      `${API_URL}/exemplares/index.php?id_livro=${idLivro}`,
      {
        method: "GET",
        headers: defaultHeaders(), // AJUSTE: Adicionado ()
        cache: "no-store",
      },
    );

    if (!response.ok) return null;

    const result = await response.json();
    const data = result.dados || result.data;

    if (result.status === "sucesso" && data && data.length > 0) {
      return data[0];
    }

    return null;
  }

  /**
   * POST: Criar novo exemplar
   */
  static async createExemplar(dados: Exemplar): Promise<void> {
    const response = await fetch(`${API_URL}/exemplares/create.php`, {
      method: "POST",
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
      body: JSON.stringify(dados),
    });

    const result = await response.json();
    if (!response.ok || result.status === "erro") {
      throw new Error(
        result.mensagem || result.message || "Erro ao cadastrar exemplar",
      );
    }
  }

  /**
   * PUT: Atualizar exemplar
   */
  static async updateExemplar(dados: Exemplar): Promise<void> {
    const response = await fetch(`${API_URL}/exemplares/update.php`, {
      method: "PUT",
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
      body: JSON.stringify(dados),
    });

    const result = await response.json();
    if (!response.ok || result.status === "erro") {
      throw new Error(
        result.mensagem || result.message || "Erro ao atualizar exemplar",
      );
    }
  }

  /**
   * DELETE: Remover exemplar
   */
  static async deleteExemplar(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/exemplares/delete.php?id=${id}`, {
      method: "DELETE",
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
    });

    const result = await response.json();
    if (!response.ok || result.status === "erro") {
      throw new Error(
        result.mensagem || result.message || "Erro ao excluir exemplar",
      );
    }
  }
}
