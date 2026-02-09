export interface Usuario {
  id_usuario: number;
  nome: string;
  tipo: 'funcionario' | 'aluno' | 'professor';
}

export const saveSession = (token: string, user: Usuario) => {
  sessionStorage.setItem("bib_token", token);
  sessionStorage.setItem("bib_user", JSON.stringify(user));
};

export const getSession = () => {
  const user =
    typeof window !== "undefined" ? sessionStorage.getItem("bib_user") : null;
  return user ? (JSON.parse(user) as Usuario) : null;
};

export const logout = () => {
  sessionStorage.removeItem("bib_token");
  sessionStorage.removeItem("bib_user");
  window.location.href = "/";
};
