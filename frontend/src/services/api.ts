// src/services/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Transformamos em uma função para capturar o token no momento da chamada
export const defaultHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Verifica se estamos no navegador antes de acessar o sessionStorage
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("bib_token");
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};
