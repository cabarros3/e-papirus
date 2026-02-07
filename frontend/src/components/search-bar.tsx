'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [filtro, setFiltro] = useState('Todos os campos');
  const router = useRouter();

  const handleSearch = () => {
    if (!query.trim()) return;
    // Adicionamos o parâmetro de filtro na URL também
    router.push(`/resultados?q=${encodeURIComponent(query)}&type=${filtro}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="flex w-full items-center gap-3">
      {/* Container Unificado da Barra */}
      <div className="flex flex-1 items-center bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-denin/10 focus-within:border-denin transition-all">
        {/* Seletor de Categoria/Filtro */}
        <div className="relative flex items-center shrink-0 border-r border-gray-100 bg-gray-50/50">
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="appearance-none bg-transparent pl-5 pr-10 py-3.5 text-sm font-bold text-denin cursor-pointer outline-none"
          >
            <option>Todos os campos</option>
            <option>Título</option>
            <option>Autor</option>
            <option>Editora</option>
            <option>Assunto</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-4 text-denin pointer-events-none"
          />
        </div>

        {/* Input de Texto */}
        <input
          type="text"
          placeholder="Busque por título, autor ou editora..."
          className="w-full px-5 py-3.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 font-medium"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Botão de Busca Ícone (Estilo do print) */}
      <button
        onClick={handleSearch}
        className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-xl text-denin hover:bg-denin hover:text-white hover:border-denin transition-all group"
      >
        <Search
          size={22}
          className="group-hover:scale-110 transition-transform"
        />
      </button>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation"; // Importante: use 'next/navigation' no App Router

// export default function SearchBar() {
//   const [query, setQuery] = useState("");
//   const router = useRouter();

//   const handleSearch = () => {
//     if (!query.trim()) return;

//     // Apenas redireciona. A lógica de busca fica na página de destino.
//     router.push(`/resultados?q=${encodeURIComponent(query)}`);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") handleSearch();
//   };

//   return (
//     <div className="flex w-full gap-2">
//       <input
//         type="text"
//         placeholder="Busque por título, autor ou editora..."
//         className="flex-1 p-3 rounded-lg border border-gray-300 text-black"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         onKeyDown={handleKeyDown}
//       />
//       <button
//         onClick={handleSearch}
//         className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
//       >
//         Buscar
//       </button>
//     </div>
//   );
// }
