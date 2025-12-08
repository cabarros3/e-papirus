// CAMINHO: src/app/resultados/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookService } from "@/services/book-service";
import { SearchBookCommand } from "@/commands/book-command";
import { Livro } from "@/types/livros";

// 1. O COMPONENTE INTERNO (SearchContent)
// É aqui que a mágica acontece. Ele lê a URL e busca os dados.
// Fica aqui mesmo, no topo do arquivo, não precisa criar outro arquivo.
function SearchContent() {
  const searchParams = useSearchParams();
  const termoBusca = searchParams.get("q") || "";

  // Inicializa o loading como TRUE se tiver busca, ou FALSE se estiver vazio
  const [loading, setLoading] = useState(!!termoBusca);
  const [livros, setLivros] = useState<Livro[]>([]);

  useEffect(() => {
    if (!termoBusca) return;

    const fetchLivros = async () => {
      setLoading(true);
      const service = new BookService();
      const command = new SearchBookCommand(
        service,
        termoBusca,
        (dados: Livro[]) => {
          setLivros(dados);
          setLoading(false);
        }
      );
      await command.execute();
    };

    fetchLivros();
  }, [termoBusca]);

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Resultados para:{" "}
        <span className="text-blue-600">&quot;{termoBusca}&quot;</span>
      </h1>

      {loading && <p className="text-center text-gray-500">Carregando...</p>}

      {!loading && livros.length === 0 && termoBusca && (
        <p className="text-gray-500">Nenhum livro encontrado.</p>
      )}

      {!loading && !termoBusca && (
        <p className="text-gray-500">Digite algo para pesquisar.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(livros) &&
          livros.map((livro) => (
            <div
              key={livro.id_livro}
              className="border p-4 rounded-lg shadow bg-white text-black hover:shadow-lg transition"
            >
              <h3 className="font-bold text-lg text-blue-900">
                {livro.titulo}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {livro.editora} - {livro.ano_publicacao}
              </p>
              <div className="text-xs bg-gray-100 p-2 rounded">
                <strong>Assunto:</strong> {livro.nome_assunto}
              </div>
              <div className="text-xs mt-2 text-gray-500">
                Autor(es): {livro.nomes_autores}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// 2. A PÁGINA PRINCIPAL (ResultadosPage)
// É isso que o Next.js renderiza quando acessa /resultados.
// Ela só serve para "envelopar" o SearchContent com o Suspense.

export default function ResultadosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gray-100 p-4">
        <Link href="/" className="text-blue-600 underline">
          &larr; Voltar para Home
        </Link>
      </div>

      {/* O Suspense é OBRIGATÓRIO para quem usa useSearchParams no Next App Router */}
      <Suspense
        fallback={<div className="p-10 text-center">Carregando busca...</div>}
      >
        <SearchContent />
      </Suspense>
    </div>
  );
}
