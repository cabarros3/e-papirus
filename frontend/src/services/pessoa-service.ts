import {
  CadastroPessoaDTO,
  Pessoa,
  PessoaResponse,
  // TipoPessoa,
} from "../types/pessoas";

const API_URL = "http://localhost:8000/api/pessoas";

export const pessoaService = {
  // Agora usamos o DTO para garantir os campos do banco
  async criar(dados: CadastroPessoaDTO): Promise<PessoaResponse> {
    try {
      const response = await fetch(`${API_URL}/create.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });

      const data = await response.json();

      if (!response.ok) {
        // O PHP retorna a mensagem no campo "mensagem" ou "message"
        throw new Error(
          data.mensagem || data.message || "Erro ao criar pessoa"
        );
      }

      return data;
    } catch (error) {
      console.error("Erro ao criar:", error);
      throw error;
    }
  },

  // Retorna uma lista de pessoas tipadas
  async listar(): Promise<Pessoa[]> {
    try {
      const response = await fetch(`${API_URL}/read.php`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || "Erro ao listar pessoas");
      }

      // Ajuste aqui dependendo se seu PHP retorna a lista direto ou dentro de data.dados
      return data.dados || data;
    } catch (error) {
      console.error("Erro ao listar:", error);
      throw error;
    }
  },

  // Partial permite enviar apenas os campos que mudaram
  async atualizar(
    id: number | string,
    dados: Partial<CadastroPessoaDTO>
  ): Promise<PessoaResponse> {
    try {
      const response = await fetch(`${API_URL}/update.php`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_pessoa: id, ...dados }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || "Erro ao atualizar pessoa");
      }

      return data;
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      throw error;
    }
  },

  async deletar(id: number | string): Promise<PessoaResponse> {
    try {
      const response = await fetch(`${API_URL}/delete.php`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_pessoa: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || "Erro ao deletar pessoa");
      }

      return data;
    } catch (error) {
      console.error("Erro ao deletar:", error);
      throw error;
    }
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
