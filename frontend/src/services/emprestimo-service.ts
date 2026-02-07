// src/services/emprestimo-service.ts
import { API_URL, defaultHeaders } from './api';

export interface Emprestimo {
  id_emprestimo?: number;
  id_exemplar: number;
  id_pessoa: number;
  data_emprestimo: string;
  data_prevista: string;
  data_devolucao?: string | null;
  // Campos úteis para exibição em tabelas (JOINs do SQL)
  nome_pessoa?: string;
  titulo_livro?: string;
  numero_exemplar?: number;
}

class EmprestimoService {
  /**
   * GET: Lista todos os empréstimos registrados
   * Ideal para a tabela de gestão da biblioteca.
   */
  async getAll(): Promise<Emprestimo[]> {
    try {
      const response = await fetch(`${API_URL}/emprestimos/index.php`, {
        method: 'GET',
        headers: defaultHeaders(),
        cache: 'no-store',
      });

      if (!response.ok)
        throw new Error('Erro ao buscar histórico de empréstimos');

      const result = await response.json();
      // Retorna os dados do padrão enviarResposta do PHP
      return (
        result.dados || result.data || (Array.isArray(result) ? result : [])
      );
    } catch (error) {
      console.error('Erro no Service (getAll):', error);
      return [];
    }
  }

  /**
   * POST: Realiza um novo empréstimo
   */
  async create(dados: Omit<Emprestimo, 'id_emprestimo'>): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/emprestimos/emprestar.php`, {
        method: 'POST',
        headers: defaultHeaders(),
        body: JSON.stringify(dados),
      });

      const result = await response.json();

      if (!response.ok || result.status === 'erro') {
        throw new Error(
          result.mensagem || 'Erro ao processar empréstimo no servidor'
        );
      }

      return result.dados || result;
    } catch (error) {
      console.error('Erro no Service (create):', error);
      throw error;
    }
  }

  /**
   * POST: Regista a devolução de um livro
   * @param id_emprestimo ID do registo de empréstimo
   * @param data_devolucao Opcional, assume hoje se não enviado pelo PHP
   */
  async devolver(id_emprestimo: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/emprestimos/devolver.php`, {
        method: 'PUT',
        headers: defaultHeaders(),
        body: JSON.stringify({ id_emprestimo }),
      });

      const result = await response.json();

      if (!response.ok || result.status === 'erro') {
        throw new Error(result.mensagem || 'Erro ao registar devolução');
      }
    } catch (error) {
      console.error('Erro no Service (devolver):', error);
      throw error;
    }
  }

  /**
   * POST: Renova um empréstimo (estende a data prevista)
   */
  async renovar(id_emprestimo: number, nova_data: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/emprestimos/renovar.php`, {
        method: 'POST',
        headers: defaultHeaders(),
        body: JSON.stringify({
          id_emprestimo,
          nova_data_prevista: nova_data,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status === 'erro') {
        throw new Error(result.mensagem || 'Erro ao renovar empréstimo');
      }
    } catch (error) {
      console.error('Erro no Service (renovar):', error);
      throw error;
    }
  }

  /**
   * GET: Lista empréstimos de um usuário específico (Para o perfil do Milo/Elsa)
   */
  async getPorUsuario(idPessoa: number): Promise<Emprestimo[]> {
    try {
      const response = await fetch(
        `${API_URL}/emprestimos/usuario.php?id_pessoa=${idPessoa}`,
        {
          method: 'GET',
          headers: defaultHeaders(),
          cache: 'no-store',
        }
      );

      if (!response.ok) return [];
      const result = await response.json();
      return result.dados || [];
    } catch (error) {
      return [];
    }
  }

  // No arquivo emprestimo-service.ts

  /**
   * GET: Lista empréstimos com filtros (status e id_pessoa)
   * Integra com o seu PHP que usa conditions e params
   */
  async getFiltrado(
    idPessoa?: number,
    status: string = 'todos'
  ): Promise<Emprestimo[]> {
    try {
      // Monta a query string manualmente para garantir compatibilidade
      const params = new URLSearchParams();
      if (idPessoa) params.append('id_pessoa', idPessoa.toString());
      params.append('status', status);

      const response = await fetch(
        `${API_URL}/emprestimos/index.php?${params.toString()}`,
        {
          method: 'GET',
          headers: defaultHeaders(),
          cache: 'no-store',
        }
      );

      const result = await response.json();

      if (!response.ok || result.status === 'erro') {
        throw new Error(result.mensagem || 'Erro ao buscar empréstimos');
      }

      // O seu PHP retorna os dados dentro de result.dados
      return result.dados || [];
    } catch (error) {
      console.error('Erro no Service (getFiltrado):', error);
      throw error;
    }
  }
}

export default new EmprestimoService();
