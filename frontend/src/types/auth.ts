// 1. Definição estrita dos tipos de usuário para evitar erros de digitação
export type UserRole = 'aluno' | 'professor' | 'funcionario';

export interface Usuario {
  id_usuario: number;
  id_pessoa: number;
  nome: string;
  email: string;
  tipo: UserRole; // Tipagem estrita em vez de string genérica
  matricula: string;
  cpf: string;
  telefone?: string; // Opcional, pois pode ser nulo no banco
}

// 2. DTOs (Data Transfer Objects)
export interface LoginDTO {
  email: string;
  senha: string;
}

export interface RegisterDTO {
  nome: string;
  matricula: string;
  cpf: string;
  email: string;
  senha: string;
  tipo: UserRole;
  telefone?: string;
}

// 3. Respostas da API (Baseadas na sua função enviarResposta do PHP)

// Resposta genérica para rotas que retornam o perfil ou sucesso de cadastro
export interface MeResponse {
  status: 'sucesso' | 'erro';
  mensagem: string; // Batendo com o PHP
  dados: Usuario; // Batendo com o PHP
}

// Resposta específica de Login que inclui o Token JWT
export interface AuthResponse {
  status: 'sucesso' | 'erro';
  mensagem: string;
  dados: {
    token: string;
    usuario: Usuario;
  };
}
