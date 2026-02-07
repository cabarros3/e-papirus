export interface Usuario {
  id_usuario: number;
  nome: string;
  tipo: 'funcionario' | 'aluno' | 'professor';
}

export const saveSession = (token: string, user: Usuario) => {
<<<<<<< Updated upstream
  localStorage.setItem('bib_token', token);
  localStorage.setItem('bib_user', JSON.stringify(user));
=======
  sessionStorage.setItem("bib_token", token);
  sessionStorage.setItem("bib_user", JSON.stringify(user));
>>>>>>> Stashed changes
};

export const getSession = () => {
  const user =
<<<<<<< Updated upstream
    typeof window !== 'undefined' ? localStorage.getItem('bib_user') : null;
=======
    typeof window !== "undefined" ? sessionStorage.getItem("bib_user") : null;
>>>>>>> Stashed changes
  return user ? (JSON.parse(user) as Usuario) : null;
};

export const logout = () => {
<<<<<<< Updated upstream
  localStorage.removeItem('bib_token');
  localStorage.removeItem('bib_user');
  window.location.href = '/';
=======
  sessionStorage.removeItem("bib_token");
  sessionStorage.removeItem("bib_user");
  window.location.href = "/";
>>>>>>> Stashed changes
};
