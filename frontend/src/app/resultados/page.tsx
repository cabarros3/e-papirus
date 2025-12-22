"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image"; // Importado para a logo
import Link from "next/link";
import { BookService } from "@/services/book-service";
import { SearchBookCommand } from "@/commands/book-command";
import { Livro } from "@/types/livros";
import SearchBar from "@/components/search-bar";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BackgroundShapes from "@/components/visual/background-shapes";
import BookDetailsModal from "../../components/modals/book-datails-modal";

function SearchContent() {
  const searchParams = useSearchParams();
  const termoBusca = searchParams.get("q") || "";

  const [loading, setLoading] = useState(true);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [selectedBook, setSelectedBook] = useState<Livro | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchLivros = async () => {
      setLoading(true);
      const service = new BookService();
      const command = new SearchBookCommand(service, termoBusca, (dados) => {
        setLivros(dados);
        setLoading(false);
      });
      await command.execute();
    };
    fetchLivros();
  }, [termoBusca]);

  const openDetails = (livro: Livro) => {
    setSelectedBook(livro);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 lg:px-16 py-12">
      {/* IDENTIDADE DO SISTEMA E BUSCA */}
      <div className="mb-16 flex flex-col items-center gap-8">
        <Link
          href="/"
          className="flex flex-col items-center gap-3 group transition-transform hover:scale-105"
        >
          <Image
            src="/img/logo.png"
            alt="Logo e-Papirus"
            width={80}
            height={80}
            className="drop-shadow-md"
          />
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            <span className="text-denin">e</span>-Papirus
          </h2>
        </Link>

        <div className="w-full max-w-2xl">
          <SearchBar />
        </div>
      </div>

      {/* CABEÇALHO DE RESULTADOS */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b pb-6 border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {termoBusca ? (
              <>
                Resultados para:{" "}
                <span className="text-denin">&quot;{termoBusca}&quot;</span>
              </>
            ) : (
              "Acervo Digital"
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            {livros.length}{" "}
            {livros.length === 1 ? "obra encontrada" : "obras encontradas"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-gray-400">
          <div className="w-10 h-10 border-4 border-denin border-t-transparent rounded-full animate-spin" />
          <p className="animate-pulse">Consultando acervo...</p>
        </div>
      ) : (
        <>
          {termoBusca ? (
            /* --- VISUAL DE LISTA (Para Pesquisa) --- */
            <div className="flex flex-col gap-4">
              {livros.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
                  Nenhum livro corresponde à sua busca.
                </div>
              ) : (
                livros.map((livro) => (
                  <div
                    key={livro.id_livro}
                    className="bg-white border border-gray-100 p-4 rounded-xl flex gap-6 hover:shadow-lg hover:border-denin/20 transition-all group cursor-pointer"
                    onClick={() => openDetails(livro)}
                  >
                    <div className="w-20 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                      {livro.capa ? (
                        <img
                          src={livro.capa}
                          alt={livro.titulo}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                          SEM CAPA
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center grow">
                      <span className="text-[10px] text-denin font-bold uppercase tracking-widest mb-1">
                        {livro.nome_assunto}
                      </span>
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-denin transition-colors leading-tight">
                        {livro.titulo}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 italic">
                        {livro.nomes_autores}
                      </p>
                    </div>
                    <div className="flex items-center pr-2">
                      <button className="text-xs font-bold text-denin border border-denin/20 px-5 py-2.5 rounded-full hover:bg-denin hover:text-white transition-all shadow-sm">
                        Detalhes
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* --- VISUAL DE GRADE (Para Acervo Geral) --- */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {livros.map((livro) => (
                <div
                  key={livro.id_livro}
                  className="flex flex-col group cursor-pointer"
                  onClick={() => openDetails(livro)}
                >
                  <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl group-hover:ring-4 ring-denin/5 transition-all duration-300">
                    <img
                      src={livro.capa || "/img/placeholder.png"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-denin transition-colors">
                    {livro.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1 italic">
                    {livro.nomes_autores}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <BookDetailsModal
        livro={selectedBook}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default function ResultadosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <BackgroundShapes />
      <Header />
      <main className="grow">
        <Suspense
          fallback={
            <div className="p-20 text-center text-gray-400 animate-pulse">
              Carregando acervo...
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

// // CAMINHO: src/app/resultados/page.tsx
// "use client";

// import { useEffect, useState, Suspense } from "react";
// import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { BookService } from "@/services/book-service";
// import { SearchBookCommand } from "@/commands/book-command";
// import { Livro } from "@/types/livros";

// // 1. O COMPONENTE INTERNO (SearchContent)
// // É aqui que a mágica acontece. Ele lê a URL e busca os dados.
// // Fica aqui mesmo, no topo do arquivo, não precisa criar outro arquivo.
// function SearchContent() {
//   const searchParams = useSearchParams();
//   const termoBusca = searchParams.get("q") || "";

//   // Inicializa o loading como TRUE se tiver busca, ou FALSE se estiver vazio
//   const [loading, setLoading] = useState(!!termoBusca);
//   const [livros, setLivros] = useState<Livro[]>([]);

//   useEffect(() => {
//     if (!termoBusca) return;

//     const fetchLivros = async () => {
//       setLoading(true);
//       const service = new BookService();
//       const command = new SearchBookCommand(
//         service,
//         termoBusca,
//         (dados: Livro[]) => {
//           setLivros(dados);
//           setLoading(false);
//         }
//       );
//       await command.execute();
//     };

//     fetchLivros();
//   }, [termoBusca]);

//   return (
//     <div className="max-w-5xl mx-auto w-full px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6">
//         Resultados para:{" "}
//         <span className="text-blue-600">&quot;{termoBusca}&quot;</span>
//       </h1>

//       {loading && <p className="text-center text-gray-500">Carregando...</p>}

//       {!loading && livros.length === 0 && termoBusca && (
//         <p className="text-gray-500">Nenhum livro encontrado.</p>
//       )}

//       {!loading && !termoBusca && (
//         <p className="text-gray-500">Digite algo para pesquisar.</p>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {Array.isArray(livros) &&
//           livros.map((livro) => (
//             <div
//               key={livro.id_livro}
//               className="border p-4 rounded-lg shadow bg-white text-black hover:shadow-lg transition"
//             >
//               <h3 className="font-bold text-lg text-blue-900">
//                 {livro.titulo}
//               </h3>
//               <p className="text-sm text-gray-600 mb-2">
//                 {livro.editora} - {livro.ano_publicacao}
//               </p>
//               <div className="text-xs bg-gray-100 p-2 rounded">
//                 <strong>Assunto:</strong> {livro.nome_assunto}
//               </div>
//               <div className="text-xs mt-2 text-gray-500">
//                 Autor(es): {livro.nomes_autores}
//               </div>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// }

// // 2. A PÁGINA PRINCIPAL (ResultadosPage)
// // É isso que o Next.js renderiza quando acessa /resultados.
// // Ela só serve para "envelopar" o SearchContent com o Suspense.

// export default function ResultadosPage() {
//   return (
//     <div className="min-h-screen flex flex-col">
//       <div className="bg-gray-100 p-4">
//         <Link href="/" className="text-blue-600 underline">
//           &larr; Voltar para Home
//         </Link>
//       </div>

//       {/* O Suspense é OBRIGATÓRIO para quem usa useSearchParams no Next App Router */}
//       <Suspense
//         fallback={<div className="p-10 text-center">Carregando busca...</div>}
//       >
//         <SearchContent />
//       </Suspense>
//     </div>
//   );
// }
