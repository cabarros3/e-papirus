import { API_URL, defaultHeaders } from './api';

export interface DashboardData {
  total_livros: number;
  total_exemplares: number;
  total_usuarios: number;
  emprestimos_ativos: number;
  emprestimos_atrasados: number;
  atividade_recente: {
    leitor: string;
    titulo: string;
    data_emprestimo: string;
  }[];
  top_livros: {
    titulo: string;
    total_saidas: number;
    capa: string;
  }[];
}

export class DashboardService {
  async getStats(): Promise<DashboardData | null> {
    try {
      // Verifique se a pasta no seu projeto PHP é 'dashboard' (singular)
      // O seu erro anterior mostrou que você tentou 'dashboards' (plural)
      const response = await fetch(`${API_URL}/dashboards/admin.php`, {
        method: 'GET',
        headers: defaultHeaders(),
        cache: 'no-store',
      });

      if (response.status === 403) {
        console.error(
          'ERRO 403: O usuário logado não tem permissão de funcionário.'
        );
        return null;
      }

      if (!response.ok) {
        console.error('Resposta do servidor não foi OK', response.status);
        return null;
      }

      const json = await response.json();

      // Como o PHP usa enviarResposta, os dados estão em 'dados'
      if (json.status === 'sucesso') {
        return json.dados;
      }

      return null;
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      return null;
    }
  }
}

// import { API_URL, defaultHeaders } from "./api";

// export interface DashboardData {
//   total_livros: number;
//   total_exemplares: number;
//   total_usuarios: number;
//   emprestimos_ativos: number;
//   emprestimos_atrasados: number;
//   atividade_recente: {
//     leitor: string;
//     titulo: string;
//     data_emprestimo: string;
//   }[];
//   top_livros: {
//     titulo: string;
//     total_saidas: number;
//   }[];
// }

// export class DashboardService {
//   async getStats(): Promise<DashboardData | null> {
//     try {
//       // Ajustado de 'dashboards' para 'dashboard' para bater com seu arquivo PHP
//       const response = await fetch(`${API_URL}/dashboards/admin.php`, {
//         method: "GET",
//         headers: defaultHeaders(),
//         cache: "no-store",
//       });

//       if (!response.ok) {
//         console.error("Resposta do servidor não foi OK", response.status);
//         return null;
//       }

//       const json = await response.json();

//       // Seu PHP usa enviarResposta, que coloca os dados na chave 'dados'
//       if (json.status === "sucesso") {
//         return json.dados;
//       }

//       console.warn("API retornou erro:", json.mensagem);
//       return null;
//     } catch (error) {
//       console.error("Erro ao carregar dashboard:", error);
//       return null;
//     }
//   }
// }
