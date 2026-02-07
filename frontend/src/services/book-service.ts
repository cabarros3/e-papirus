import { API_URL, defaultHeaders } from './api';
import { Livro, CadastroLivroDTO } from '@/types/livros';

// Interface estendida para o Update
export interface UpdateLivroDTO extends CadastroLivroDTO {
  id_livro: number;
}

export class BookService {
  // GET: Buscar todos os livros (ou por busca)
  async getAllBooks(query?: string): Promise<Livro[]> {
    const url = query
      ? `${API_URL}/livros/index.php?q=${encodeURIComponent(query)}`
      : `${API_URL}/livros/index.php`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: defaultHeaders(), // AJUSTE: Adicionado ()
        cache: 'no-store',
      });

      if (!response.ok) return [];
      const json = await response.json();

      // AJUSTE: Tenta pegar de 'dados' (seu padrão PHP) ou 'data'
      return json.dados || json.data || (Array.isArray(json) ? json : []);
    } catch (error) {
      console.error('Erro no fetch:', error);
      return [];
    }
  }

  // GET: Buscar livros mais lidos (Ranking)
  async getMostBorrowed(limite: number = 10): Promise<Livro[]> {
    const url = `${API_URL}/emprestimos/mais-lidos.php?limite=${limite}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: defaultHeaders(), // AJUSTE: Adicionado ()
        cache: 'no-store',
      });
      if (!response.ok) return [];
      const json = await response.json();
      return json.dados || json.data || [];
    } catch (error) {
      return [];
    }
  }

  // POST: Criar livro
  async createBook(dados: CadastroLivroDTO): Promise<void> {
    const response = await fetch(`${API_URL}/livros/create.php`, {
      method: 'POST',
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
      body: JSON.stringify(dados),
    });

    const result = await response.json();
    if (!response.ok || result.status === 'erro') {
      throw new Error(result.mensagem || 'Erro ao cadastrar');
    }
  }

  // PUT: Atualizar livro
  async updateBook(dados: UpdateLivroDTO): Promise<void> {
    const response = await fetch(`${API_URL}/livros/update.php`, {
      method: 'PUT',
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
      body: JSON.stringify(dados),
    });

    const result = await response.json();
    if (!response.ok || result.status === 'erro') {
      throw new Error(result.mensagem || 'Erro ao atualizar livro');
    }
  }

  // DELETE: Excluir livro
  async deleteBook(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/livros/delete.php?id=${id}`, {
      method: 'DELETE',
      headers: defaultHeaders(), // AJUSTE: Adicionado ()
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.mensagem || 'Erro ao excluir livro');
    }
  }
}
