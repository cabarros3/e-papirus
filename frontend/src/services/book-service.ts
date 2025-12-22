import { API_URL, defaultHeaders } from "./api";
import { Livro, CadastroLivroDTO } from "@/types/livros";

export class BookService {
  // GET: Buscar todos os livros (ou por busca)
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

      if (json.data && Array.isArray(json.data)) {
        return json.data;
      }

      if (Array.isArray(json)) {
        return json;
      }

      console.warn("API retornou formato inesperado:", json);
      return [];
    } catch (error) {
      console.error("Erro no fetch:", error);
      return [];
    }
  }

  // NOVO MÉTODO - GET: Buscar livros mais lidos (Ranking)
  async getMostBorrowed(limite: number = 10): Promise<Livro[]> {
    // Ajuste o caminho aqui de '/livros/' para '/emprestimo/' (ou o nome da sua pasta)
    const url = `${API_URL}/emprestimos/mais-lidos.php?limite=${limite}`;

    console.log("Tentando acessar:", url); // Debug para confirmar a rota no console

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: defaultHeaders,
        cache: "no-store",
      });

      if (!response.ok) {
        console.error("Erro HTTP ao buscar mais lidos:", response.status);
        return [];
      }

      const json = await response.json();

      if (json.data && Array.isArray(json.data)) {
        return json.data;
      }

      return [];
    } catch (error) {
      console.error("Erro no fetch de mais lidos:", error);
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

// import { API_URL, defaultHeaders } from "./api";
// import { Livro, CadastroLivroDTO } from "@/types/livros";

// export class BookService {
//   // GET: Buscar livros
//   async getAllBooks(query?: string): Promise<Livro[]> {
//     const url = query
//       ? `${API_URL}/livros/index.php?q=${encodeURIComponent(query)}`
//       : `${API_URL}/livros/index.php`;

//     try {
//       const response = await fetch(url, {
//         method: "GET",
//         headers: defaultHeaders,
//         cache: "no-store",
//       });

//       if (!response.ok) {
//         console.error("Erro HTTP:", response.status);
//         return [];
//       }

//       const json = await response.json();

//       // --- AQUI ESTÁ A CORREÇÃO MÁGICA ---

//       // 1. Se o PHP retornou { status: "sucesso", data: [...] }
//       if (json.data && Array.isArray(json.data)) {
//         return json.data;
//       }

//       // 2. Se o PHP retornou o array direto [...] (caso mude o backend)
//       if (Array.isArray(json)) {
//         return json;
//       }

//       // 3. Se não for array, retorna vazio para não quebrar o .map na tela
//       console.warn("API retornou formato inesperado:", json);
//       return [];
//     } catch (error) {
//       console.error("Erro no fetch:", error);
//       return [];
//     }
//   }

//   // POST: Criar livro
//   async createBook(dados: CadastroLivroDTO): Promise<void> {
//     const response = await fetch(`${API_URL}/livros/index.php`, {
//       method: "POST",
//       headers: defaultHeaders,
//       body: JSON.stringify(dados),
//     });

//     const result = await response.json();
//     if (!response.ok) throw new Error(result.mensagem || "Erro ao cadastrar");
//   }
// }
