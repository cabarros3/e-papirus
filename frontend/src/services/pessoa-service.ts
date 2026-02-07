import { CadastroPessoaDTO, Pessoa, PessoaResponse } from '../types/pessoas';
// Importamos as configurações globais que já estamos usando nos outros services
import { API_URL, defaultHeaders } from './api';

export const pessoaService = {
  /**
   * POST: Cria uma nova pessoa (Leitor ou Funcionário)
   */
  async criar(dados: CadastroPessoaDTO): Promise<PessoaResponse> {
    try {
      const response = await fetch(`${API_URL}/pessoas/create.php`, {
        method: 'POST',
        // AJUSTE: Agora usa a função para pegar o token logado
        headers: defaultHeaders(),
        body: JSON.stringify(dados),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'erro') {
        throw new Error(
          data.mensagem || data.message || 'Erro ao criar pessoa'
        );
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar:', error);
      throw error;
    }
  },

  /**
   * GET: Lista todas as pessoas cadastradas
   */
  async listar(): Promise<Pessoa[]> {
    try {
      const response = await fetch(`${API_URL}/pessoas/index.php`, {
        method: 'GET',
        headers: defaultHeaders(), // AJUSTE: Proteção JWT
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || 'Erro ao listar pessoas');
      }

      // Padronizado para seu PHP que retorna em data.dados
      return data.dados || data;
    } catch (error) {
      console.error('Erro ao listar:', error);
      return [];
    }
  },

  /**
   * PUT: Atualiza dados de uma pessoa
   */
  async atualizar(
    id: number | string,
    dados: Partial<CadastroPessoaDTO>
  ): Promise<PessoaResponse> {
    try {
      const response = await fetch(`${API_URL}/pessoas/update.php`, {
        method: 'PUT',
        headers: defaultHeaders(), // AJUSTE: Proteção JWT
        body: JSON.stringify({ id_pessoa: id, ...dados }),
      });

      const data = await response.json();

      if (!response.ok || data.status === 'erro') {
        throw new Error(data.mensagem || 'Erro ao atualizar pessoa');
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      throw error;
    }
  },

  /**
   * DELETE: Remove uma pessoa do sistema
   */
  // No seu arquivo pessoa-service.ts, ajuste o deletar:
  async deletar(id: number | string): Promise<PessoaResponse> {
    try {
      // Ajustado para enviar ?id= na URL conforme seu PHP espera
      const response = await fetch(`${API_URL}/pessoas/delete.php?id=${id}`, {
        method: 'DELETE',
        headers: defaultHeaders(),
      });

      const data = await response.json();
      if (!response.ok || data.status === 'erro') {
        throw new Error(data.mensagem || 'Erro ao deletar pessoa');
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  async buscarPorNome(nome: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/pessoas/index.php?nome=${nome}`);
    const result = await response.json();
    return result.dados || [];
  },
};

// const API_URL = 'http://localhost:8000/api/pessoas';

// interface Pessoa {
//   [key: string]: any;
// }

// export const pessoaService = {
//   async criar(dados: Pessoa) {
//     try {
//       const response = await fetch(`${API_URL}/create.php`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(dados)
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Erro ao criar pessoa');
//       }

//       return data;
//     } catch (error) {
//       console.error('Erro ao criar:', error);
//       throw error;
//     }
//   },

//   async listar() {
//     try {
//       const response = await fetch(`${API_URL}/read.php`);
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Erro ao listar pessoas');
//       }

//       return data;
//     } catch (error) {
//       console.error('Erro ao listar:', error);
//       throw error;
//     }
//   },

//   async atualizar(id: number | string, dados: Pessoa) {
//     try {
//       const response = await fetch(`${API_URL}/update.php`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ id, ...dados })
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Erro ao atualizar pessoa');
//       }

//       return data;
//     } catch (error) {
//       console.error('Erro ao atualizar:', error);
//       throw error;
//     }
//   },

//   async deletar(id: number | string) {
//     try {
//       const response = await fetch(`${API_URL}/delete.php`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ id })
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Erro ao deletar pessoa');
//       }

//       return data;
//     } catch (error) {
//       console.error('Erro ao deletar:', error);
//       throw error;
//     }
//   }
// };
