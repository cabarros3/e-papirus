"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Importante: use 'next/navigation' no App Router

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (!query.trim()) return;

    // Apenas redireciona. A lógica de busca fica na página de destino.
    router.push(`/resultados?q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex w-full gap-2">
      <input
        type="text"
        placeholder="Busque por título, autor ou editora..."
        className="flex-1 p-3 rounded-lg border border-gray-300 text-black"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
      >
        Buscar
      </button>
    </div>
  );
}
