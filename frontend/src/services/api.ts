// src/services/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const defaultHeaders = {
  "Content-Type": "application/json",
  // Futuramente, se tiver token JWT, adicione aqui
};
