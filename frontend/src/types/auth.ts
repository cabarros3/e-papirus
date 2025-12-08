// O objeto "Usuario" que vem dentro do "data" no /me
export interface Usuario {
  id_usuario: number;
  id_pessoa: number;
  nome: string;
  email: string;
  matricula: string;
  cpf: string;
  telefone: string;
  tipo: string; // "aluno" | "admin" etc.
}

// DTO para LOGIN (POST)
export interface LoginDTO {
  email: string;
  senha: string;
}

// DTO para REGISTER (POST)
export interface RegisterDTO {
  nome: string;
  matricula: string;
  cpf: string;
  email: string;
  senha: string;
  tipo: string;
  telefone: string;
}

// Resposta do endpoint "ME" (Perfil)
export interface MeResponse {
  status: string;
  message: string;
  data: Usuario; // Objeto único
}

// Resposta de Login/Register (Geralmente retorna token ou sucesso simples)
// Caso seu login retorne o mesmo formato do ME, pode reutilizar MeResponse.
export interface AuthResponse {
  status: string;
  message: string;
  // Se o login retornar token, adicione aqui.
  // Se retornar dados do usuário, use: data?: Usuario;
}
