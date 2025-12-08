"use client"; // Obrigatório porque usamos Hooks (useState, useEffect)

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// Imports da nossa arquitetura
import { AuthService } from "@/services/auth-service";
import { Usuario, LoginDTO } from "@/types/auth";

// Define o que estará disponível para qualquer componente do site
interface AuthContextType {
  user: Usuario | null; // O objeto do usuário (se logado)
  isAuthenticated: boolean; // Atalho para saber se está logado
  isLoading: boolean; // Para mostrar "Carregando..." enquanto checa o localStorage
  login: (dados: LoginDTO) => Promise<void>;
  logout: () => void;
}

// Cria o contexto vazio
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 1. EFEITO DE CARREGAMENTO (Executa 1 vez ao abrir o site)
  // Verifica se já existe um usuário salvo no navegador
  useEffect(() => {
    const userStored = localStorage.getItem("epapirus_user");

    if (userStored) {
      try {
        setUser(JSON.parse(userStored));
      } catch (error) {
        console.error("Erro ao ler dados do usuário", error);
        localStorage.removeItem("epapirus_user"); // Limpa se estiver corrompido
      }
    }

    setIsLoading(false); // Terminou de carregar
  }, []);

  // 2. FUNÇÃO DE LOGIN
  const login = async (dados: LoginDTO) => {
    const service = new AuthService();

    try {
      // Chama a API através do Service
      const response = await service.login(dados);

      // Se chegou aqui, a API retornou sucesso (200)
      // response.data contém o objeto Usuario vindo do PHP
      const usuarioLogado = response.data;

      // Atualiza o Estado Global
      setUser(usuarioLogado);

      // Salva no Navegador (Persistência)
      localStorage.setItem("epapirus_user", JSON.stringify(usuarioLogado));

      // Opcional: Salvar Token se sua API retornar um JWT futuramente
      // localStorage.setItem('epapirus_token', response.token);
    } catch (error) {
      // Repassa o erro para o Formulário de Login exibir o alert
      throw error;
    }
  };

  // 3. FUNÇÃO DE LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("epapirus_user");
    // localStorage.removeItem('epapirus_token');

    router.push("/login"); // Redireciona para login
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user, // Transforma o objeto em true/false
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para não precisar importar useContext e AuthContext toda vez
export const useAuth = () => useContext(AuthContext);
