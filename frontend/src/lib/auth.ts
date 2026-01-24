export interface Usuario {
  id_usuario: number;
  nome: string;
  tipo: "funcionario" | "aluno" | "professor";
}

export const saveSession = (token: string, user: Usuario) => {
  localStorage.setItem("bib_token", token);
  localStorage.setItem("bib_user", JSON.stringify(user));
};

export const getSession = () => {
  const user =
    typeof window !== "undefined" ? localStorage.getItem("bib_user") : null;
  return user ? (JSON.parse(user) as Usuario) : null;
};

export const logout = () => {
  localStorage.removeItem("bib_token");
  localStorage.removeItem("bib_user");
  window.location.href = "/";
};
