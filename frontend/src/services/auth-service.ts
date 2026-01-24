import { API_URL, defaultHeaders } from "./api";
import { LoginDTO, AuthResponse } from "@/types/auth";

export class AuthService {
  /**
   * Realiza o login, armazena o token e retorna os dados do usuário
   */
  async login(credenciais: LoginDTO): Promise<AuthResponse["dados"]> {
    const response = await fetch(`${API_URL}/auth/login.php`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(credenciais),
    });

    const json = await response.json();

    // No seu PHP, você usa enviarResposta("erro", ...),
    // então verificamos o campo 'status' do JSON além do response.ok
    if (!response.ok || json.status === "erro") {
      throw new Error(json.mensagem || "Credenciais inválidas");
    }

    // json.dados contém { token, usuario } conforme configuramos no PHP
    const { token, usuario } = json.dados;

    // Salva o token para uso em requisições futuras
    if (typeof window !== "undefined") {
      localStorage.setItem("bib_token", token);
      localStorage.setItem("bib_user", JSON.stringify(usuario));
    }

    return json.dados;
  }

  /**
   * Remove os dados de autenticação e redireciona
   */
  logout(): void {
    localStorage.removeItem("bib_token");
    localStorage.removeItem("bib_user");
    window.location.href = "/login";
  }

  /**
   * Retorna o token atual para ser usado nos headers de outras requisições
   */
  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("bib_token");
  }
}

// import { API_URL, defaultHeaders } from "./api";
// import { LoginDTO, MeResponse, AuthResponse } from "@/types/auth";

// export class AuthService {
//   async login(credenciais: LoginDTO): Promise<MeResponse> {
//     const response = await fetch(`${API_URL}/auth/login.php`, {
//       // ajuste o caminho
//       method: "POST",
//       headers: defaultHeaders,
//       body: JSON.stringify(credenciais),
//     });

//     const json = await response.json();
//     if (!response.ok) throw new Error(json.message || "Erro no login");

//     // Retorna o objeto completo { status, message, data: Usuario }
//     return json;
//   }
// }
