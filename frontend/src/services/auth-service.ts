import { API_URL, defaultHeaders } from "./api";
import { LoginDTO, MeResponse, AuthResponse } from "@/types/auth";

export class AuthService {
  async login(credenciais: LoginDTO): Promise<MeResponse> {
    const response = await fetch(`${API_URL}/auth/login.php`, {
      // ajuste o caminho
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(credenciais),
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || "Erro no login");

    // Retorna o objeto completo { status, message, data: Usuario }
    return json;
  }
}
