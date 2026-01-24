import { API_URL, defaultHeaders } from "./api";
import { LoginDTO, AuthResponse } from "@/types/auth";

export class AuthService {
  /**
   * Realiza o login, armazena o token e retorna os dados do usuário
   */
  async login(credenciais: LoginDTO): Promise<AuthResponse["dados"]> {
    // AJUSTE: Incluímos /auth/ no caminho para bater com seu backend-php/api/auth/login.php
    const response = await fetch(`${API_URL}/auth/login.php`, {
      method: "POST",
      headers: defaultHeaders(),
      body: JSON.stringify(credenciais),
    });

    const json = await response.json();

    // Verificamos o status retornado pela sua função enviarResposta no PHP
    if (!response.ok || json.status === "erro") {
      throw new Error(json.mensagem || "Credenciais inválidas");
    }

    // No seu PHP, você envia: "dados" => ["token" => $jwt, "usuario" => $usuario]
    const { token, usuario } = json.dados;

    // Salva o token e os dados do usuário para uso no DashboardLayout e Services
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
    if (typeof window !== "undefined") {
      localStorage.removeItem("bib_token");
      localStorage.removeItem("bib_user");
      window.location.href = "/login";
    }
  }

  /**
   * Retorna o token atual
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
