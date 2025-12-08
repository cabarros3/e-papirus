// app/page.tsx
"use client";

import { useEffect, useState } from "react"; // 1. Hooks necessários
import Header from "@/components/header";
import SearchBar from "@/components/search-bar";
import { BookSlider } from "@/components/sliders/book-slider";

// 2. Imports da nossa Arquitetura
import { BookService } from "@/services/book-service";
import { SearchBookCommand } from "@/commands/book-command";
import { Livro } from "@/types/livros"; // Confirme se o arquivo é 'livro.ts' ou 'livros.ts'

export default function Home() {
  // 3. Estado para armazenar os livros que vêm do PHP
  const [recentBooks, setRecentBooks] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);

  // 4. Busca os dados assim que a página carrega
  useEffect(() => {
    const fetchBooks = async () => {
      const service = new BookService();

      // Enviamos string vazia "" para trazer a listagem padrão (sem filtro)
      const command = new SearchBookCommand(service, "", (dados: Livro[]) => {
        setRecentBooks(dados);
        setLoading(false);
      });

      await command.execute();
    };

    fetchBooks();
  }, []);

  return (
    <main className="flex flex-col gap-16 px-4 md:px-8 lg:px-16 pb-10">
      <Header />

      <div className="flex flex-col gap-6 md:gap-10 justify-center items-center text-center max-w-3xl mx-auto mt-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          <span className="text-denin">e</span>-Papirus
        </h1>
        <p className="text-base sm:text-lg md:text-xl">
          Explore nosso acervo digital e descubra livros, artigos e conteúdos.
        </p>

        <div className="w-full sm:w-3/4 md:w-2/3">
          <SearchBar />
        </div>
      </div>

      <div>
        {/* 5. Renderização Condicional */}
        {loading ? (
          <div className="text-center py-10 opacity-50">
            <p>Carregando estante...</p>
          </div>
        ) : (
          /* Passamos o array do estado para o componente */
          <BookSlider livros={recentBooks} />
        )}
      </div>
    </main>
  );
}
