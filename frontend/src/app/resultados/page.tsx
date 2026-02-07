'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BookService } from '@/services/book-service';
import { SearchBookCommand } from '@/commands/book-command';
import { Livro } from '@/types/livros';
import SearchBar from '@/components/search-bar';
import Header from '@/components/header';
import Footer from '@/components/footer';
import BackgroundShapes from '@/components/visual/background-shapes';
import BookDetailsModal from '../../components/modals/book-datails-modal';
import FilterList from '@/components/visual/filter-list';
import {
  Filter,
  Calendar,
  User,
  Tag,
  RotateCcw,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const termoBusca = searchParams.get('q') || '';

  const [loading, setLoading] = useState(true);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [selectedBook, setSelectedBook] = useState<Livro | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filtroAssunto, setFiltroAssunto] = useState('');
  const [filtroAutor, setFiltroAutor] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [showAllAssuntos, setShowAllAssuntos] = useState(false);
  const [showAllAutores, setShowAllAutores] = useState(false);

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

  const opcoesFiltros = useMemo(() => {
    const assuntos = new Set<string>();
    const autores = new Set<string>();
    const anos = new Set<string>();
    livros.forEach((l) => {
      if (l.nome_assunto) assuntos.add(l.nome_assunto);
      if (l.nomes_autores) autores.add(l.nomes_autores);
      if (l.ano_publicacao) anos.add(l.ano_publicacao.toString());
    });
    return {
      assuntos: Array.from(assuntos).sort(),
      autores: Array.from(autores).sort(),
      anos: Array.from(anos).sort((a, b) => Number(b) - Number(a)),
    };
  }, [livros]);

  const livrosFiltrados = useMemo(() => {
    return livros.filter((livro) => {
      const matchAssunto =
        !filtroAssunto || livro.nome_assunto === filtroAssunto;
      const matchAutor = !filtroAutor || livro.nomes_autores === filtroAutor;
      const matchAno =
        !filtroAno || livro.ano_publicacao?.toString() === filtroAno;
      return matchAssunto && matchAutor && matchAno;
    });
  }, [livros, filtroAssunto, filtroAutor, filtroAno]);

  const openDetails = (livro: Livro) => {
    setSelectedBook(livro);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8 lg:px-12">
      {/* BARRA DE BUSCA STICKY */}
      <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="w-full max-w-xl">
          <SearchBar />
        </div>

        <div className="hidden md:block shrink-0 text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
            Resultados
          </p>
          <div className="flex items-center gap-2 justify-end">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-black text-denin">
              {livrosFiltrados.length} encontrados
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 py-8 items-start">
        {/* SIDEBAR STICKY */}
        <aside className="hidden lg:flex w-72 flex-col flex-shrink-0 sticky top-32 pb-10 h-fit">
          <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Filter size={18} className="text-denin" /> Filtros
              </h3>
              {(filtroAssunto || filtroAutor || filtroAno) && (
                <button
                  onClick={() => {
                    setFiltroAssunto('');
                    setFiltroAutor('');
                    setFiltroAno('');
                  }}
                  className="text-[10px] font-black text-red-500 uppercase"
                >
                  Limpar
                </button>
              )}
            </div>

            {opcoesFiltros.assuntos.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                  <Tag size={12} /> Assuntos
                </h4>
                <FilterList
                  items={opcoesFiltros.assuntos}
                  selectedValue={filtroAssunto}
                  onSelect={setFiltroAssunto}
                  showAll={showAllAssuntos}
                  onToggleShowAll={() => setShowAllAssuntos(!showAllAssuntos)}
                />
              </div>
            )}

            {opcoesFiltros.autores.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                  <User size={12} /> Autores
                </h4>
                <FilterList
                  items={opcoesFiltros.autores}
                  selectedValue={filtroAutor}
                  onSelect={setFiltroAutor}
                  showAll={showAllAutores}
                  onToggleShowAll={() => setShowAllAutores(!showAllAutores)}
                />
              </div>
            )}

            {opcoesFiltros.anos.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                  <Calendar size={12} /> Ano
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {opcoesFiltros.anos.slice(0, 10).map((ano) => (
                    <button
                      key={ano}
                      onClick={() => setFiltroAno(filtroAno === ano ? '' : ano)}
                      className={`text-xs py-2 rounded-xl border transition-all ${filtroAno === ano ? 'bg-denin border-denin text-white font-bold' : 'border-gray-100 text-gray-500 hover:border-denin bg-white'}`}
                    >
                      {ano}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* LISTA DE RESULTADOS */}
        <div className="grow pb-20">
          <div className="mb-8 mt-2">
            <h2 className="text-2xl font-black text-gray-900">
              {termoBusca ? (
                <>
                  Resultados para:{' '}
                  <span className="text-denin italic">
                    &quot;{termoBusca}&quot;
                  </span>
                </>
              ) : (
                'Acervo Completo'
              )}
            </h2>
            <div className="h-1 w-20 bg-denin mt-4 rounded-full" />
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
              <div className="w-10 h-10 border-4 border-denin border-t-transparent rounded-full animate-spin" />
              <p className="font-bold animate-pulse">Sincronizando acervo...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {livrosFiltrados.length === 0 ? (
                <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                  <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-bold">
                    Nenhum livro encontrado.
                  </p>
                </div>
              ) : (
                livrosFiltrados.map((livro) => (
                  <div
                    key={livro.id_livro}
                    className="group bg-white border border-gray-100 p-6 rounded-[28px] flex flex-col sm:flex-row gap-6 hover:shadow-2xl hover:shadow-denin/10 hover:border-denin/20 transition-all cursor-pointer relative"
                    onClick={() => openDetails(livro)}
                  >
                    <div className="w-24 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50 shadow-sm">
                      <img
                        src={livro.capa || '/img/placeholder.png'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="flex flex-col justify-center grow overflow-hidden text-left">
                      <span className="text-[9px] font-black text-denin uppercase tracking-widest mb-1">
                        {livro.nome_assunto}
                      </span>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-denin truncate">
                        {livro.titulo}
                      </h3>
                      <p className="text-gray-500 text-sm flex items-center gap-2 mb-2 font-medium">
                        <User size={14} className="text-denin" />{' '}
                        {livro.nomes_autores}
                      </p>
                      <p className="text-[11px] text-gray-400 line-clamp-2 italic">
                        {livro.nota_resumo || 'Descrição não disponível.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-center sm:pl-6 sm:border-l border-gray-50">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-denin group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={24} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
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
    <div className="min-h-screen flex flex-col bg-white font-sans overflow-x-hidden">
      <BackgroundShapes />
      <Header />
      <main className="grow">
        <Suspense fallback={null}>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

// "use client";

// import { useEffect, useState, Suspense, useMemo } from "react";
// import { useSearchParams } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { BookService } from "@/services/book-service";
// import { SearchBookCommand } from "@/commands/book-command";
// import { Livro } from "@/types/livros";
// import SearchBar from "@/components/search-bar";
// import Header from "@/components/header";
// import BackgroundShapes from "@/components/visual/background-shapes";
// import BookDetailsModal from "../../components/modals/book-datails-modal";
// import FilterList from "@/components/visual/filter-list";
// import {
//   Filter,
//   Calendar,
//   User,
//   Tag,
//   RotateCcw,
//   ChevronRight,
//   BookOpen,
// } from "lucide-react";
// import Footer from "@/components/footer";

// function SearchContent() {
//   const searchParams = useSearchParams();
//   const termoBusca = searchParams.get("q") || "";

//   const [loading, setLoading] = useState(true);
//   const [livros, setLivros] = useState<Livro[]>([]);
//   const [selectedBook, setSelectedBook] = useState<Livro | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Estados de Filtro
//   const [filtroAssunto, setFiltroAssunto] = useState("");
//   const [filtroAutor, setFiltroAutor] = useState("");
//   const [filtroAno, setFiltroAno] = useState("");

//   // UI Filtros
//   const [showAllAssuntos, setShowAllAssuntos] = useState(false);
//   const [showAllAutores, setShowAllAutores] = useState(false);

//   useEffect(() => {
//     const fetchLivros = async () => {
//       setLoading(true);
//       const service = new BookService();
//       const command = new SearchBookCommand(service, termoBusca, (dados) => {
//         setLivros(dados);
//         setLoading(false);
//       });
//       await command.execute();
//     };
//     fetchLivros();
//   }, [termoBusca]);

//   const opcoesFiltros = useMemo(() => {
//     const assuntos = new Set<string>();
//     const autores = new Set<string>();
//     const anos = new Set<string>();
//     livros.forEach((l) => {
//       if (l.nome_assunto) assuntos.add(l.nome_assunto);
//       if (l.nomes_autores) autores.add(l.nomes_autores);
//       if (l.ano_publicacao) anos.add(l.ano_publicacao.toString());
//     });
//     return {
//       assuntos: Array.from(assuntos).sort(),
//       autores: Array.from(autores).sort(),
//       anos: Array.from(anos).sort((a, b) => Number(b) - Number(a)),
//     };
//   }, [livros]);

//   const livrosFiltrados = useMemo(() => {
//     return livros.filter((livro) => {
//       const matchAssunto =
//         !filtroAssunto || livro.nome_assunto === filtroAssunto;
//       const matchAutor = !filtroAutor || livro.nomes_autores === filtroAutor;
//       const matchAno =
//         !filtroAno || livro.ano_publicacao?.toString() === filtroAno;
//       return matchAssunto && matchAutor && matchAno;
//     });
//   }, [livros, filtroAssunto, filtroAutor, filtroAno]);

//   const openDetails = (livro: Livro) => {
//     setSelectedBook(livro);
//     setIsModalOpen(true);
//   };

//   return (
//     <div className="flex flex-col h-[calc(100vh-80px)] max-w-[1600px] mx-auto w-full px-4 md:px-8 lg:px-12 overflow-hidden">
//       {/* TOPO FIXO: Busca e Contador */}
//       <div className="flex-shrink-0 py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm z-10">
//         <div className="w-full max-w-xl">
//           <SearchBar />
//         </div>

//         <div className="hidden md:block shrink-0 text-right">
//           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
//             Status do Acervo
//           </p>
//           <div className="flex items-center gap-2 justify-end">
//             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
//             <p className="text-sm font-black text-denin">
//               {livrosFiltrados.length} obra(s) encontrada(s)
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="flex grow overflow-hidden gap-8 py-6">
//         {/* SIDEBAR FIXA COM FILTROS CONDICIONAIS */}
//         <aside className="hidden lg:flex w-72 flex-col flex-shrink-0 overflow-y-auto pr-4 custom-scrollbar">
//           <div className="space-y-8 pb-10">
//             <div className="flex items-center justify-between">
//               <h3 className="font-bold text-gray-900 flex items-center gap-2">
//                 <Filter size={18} className="text-denin" /> Filtros
//               </h3>
//               {(filtroAssunto || filtroAutor || filtroAno) && (
//                 <button
//                   onClick={() => {
//                     setFiltroAssunto("");
//                     setFiltroAutor("");
//                     setFiltroAno("");
//                   }}
//                   className="text-[10px] font-black text-red-500 uppercase hover:underline flex items-center gap-1"
//                 >
//                   <RotateCcw size={12} /> Limpar
//                 </button>
//               )}
//             </div>

//             {/* Condição: Só mostra Assuntos se houver opções */}
//             {opcoesFiltros.assuntos.length > 0 && (
//               <div>
//                 <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
//                   <Tag size={12} /> Assuntos
//                 </h4>
//                 <FilterList
//                   items={opcoesFiltros.assuntos}
//                   selectedValue={filtroAssunto}
//                   onSelect={setFiltroAssunto}
//                   showAll={showAllAssuntos}
//                   onToggleShowAll={() => setShowAllAssuntos(!showAllAssuntos)}
//                 />
//               </div>
//             )}

//             {/* Condição: Só mostra Autores se houver opções */}
//             {opcoesFiltros.autores.length > 0 && (
//               <div>
//                 <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
//                   <User size={12} /> Autores
//                 </h4>
//                 <FilterList
//                   items={opcoesFiltros.autores}
//                   selectedValue={filtroAutor}
//                   onSelect={setFiltroAutor}
//                   showAll={showAllAutores}
//                   onToggleShowAll={() => setShowAllAutores(!showAllAutores)}
//                 />
//               </div>
//             )}

//             {opcoesFiltros.anos.length > 0 && (
//               <div>
//                 <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
//                   <Calendar size={12} /> Ano
//                 </h4>
//                 <div className="grid grid-cols-2 gap-2">
//                   {opcoesFiltros.anos.slice(0, 10).map((ano) => (
//                     <button
//                       key={ano}
//                       onClick={() => setFiltroAno(filtroAno === ano ? "" : ano)}
//                       className={`text-xs py-2 rounded-xl border transition-all ${
//                         filtroAno === ano
//                           ? "bg-denin border-denin text-white font-bold shadow-md shadow-denin/20"
//                           : "border-gray-100 text-gray-500 hover:border-denin bg-white"
//                       }`}
//                     >
//                       {ano}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </aside>

//         {/* LISTA DE LIVROS: SCROLL INDEPENDENTE */}
//         <div className="grow overflow-y-auto px-2 pb-10 custom-scrollbar scroll-smooth">
//           {/* NOME RESULTADOS E TERMO PESQUISADO */}
//           <div className="mb-8 mt-2">
//             {/* <h4 className="text-[10px] font-black uppercase text-denin tracking-[0.3em] mb-1">
//               Explorar Catálogo
//             </h4> */}
//             <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
//               {termoBusca ? (
//                 <>
//                   Resultados para:{" "}
//                   <span className="text-denin italic">
//                     &quot;{termoBusca}&quot;
//                   </span>
//                 </>
//               ) : (
//                 "Acervo Completo"
//               )}
//             </h2>
//             <div className="h-1 w-20 bg-denin mt-4 rounded-full" />
//           </div>

//           {loading ? (
//             <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
//               <div className="w-10 h-10 border-4 border-denin border-t-transparent rounded-full animate-spin" />
//               <p className="font-bold animate-pulse">Sincronizando acervo...</p>
//             </div>
//           ) : (
//             <div className="flex flex-col gap-4">
//               {livrosFiltrados.length === 0 ? (
//                 <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
//                   <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
//                   <p className="text-gray-500 font-bold text-lg">
//                     Nenhum livro corresponde à filtragem.
//                   </p>
//                   <button
//                     onClick={() => {
//                       setFiltroAssunto("");
//                       setFiltroAutor("");
//                       setFiltroAno("");
//                     }}
//                     className="mt-4 text-denin font-black text-sm uppercase hover:underline"
//                   >
//                     Resetar filtros aplicados
//                   </button>
//                 </div>
//               ) : (
//                 livrosFiltrados.map((livro) => (
//                   <div
//                     key={livro.id_livro}
//                     className="group bg-white border border-gray-100 p-4 rounded-[28px] flex flex-col sm:flex-row gap-6 hover:shadow-2xl hover:shadow-denin/10 hover:border-denin/20 transition-all cursor-pointer relative shrink-0"
//                     onClick={() => openDetails(livro)}
//                   >
//                     <div className="w-24 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50 shadow-sm">
//                       <img
//                         src={livro.capa || "/img/placeholder.png"}
//                         alt={livro.titulo}
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
//                       />
//                     </div>

//                     <div className="flex flex-col justify-center grow overflow-hidden">
//                       <span className="text-[9px] font-black text-denin uppercase tracking-widest mb-1">
//                         {livro.nome_assunto}
//                       </span>
//                       <h3 className="font-bold text-lg text-gray-900 group-hover:text-denin transition-colors leading-tight mb-1 truncate">
//                         {livro.titulo}
//                       </h3>
//                       <p className="text-gray-500 text-sm flex items-center gap-2 mb-2 font-medium">
//                         <User size={14} className="text-denin" />{" "}
//                         {livro.nomes_autores}
//                       </p>
//                       <p className="text-[11px] text-gray-400 line-clamp-2 italic leading-relaxed">
//                         {livro.nota_resumo ||
//                           "Este exemplar ainda não possui uma descrição cadastrada."}
//                       </p>
//                     </div>

//                     <div className="flex items-center justify-center sm:pl-6 sm:border-l border-gray-50">
//                       <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-denin group-hover:text-white group-hover:shadow-lg group-hover:shadow-denin/30 transition-all">
//                         <ChevronRight size={24} />
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       <BookDetailsModal
//         livro={selectedBook}
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//       />
//     </div>
//   );
// }

// export default function ResultadosPage() {
//   return (
//     <div className="h-screen flex flex-col bg-white overflow-hidden font-sans">
//       <BackgroundShapes />
//       <Header />
//       <main className="grow overflow-hidden">
//         <Suspense fallback={null}>
//           <SearchContent />
//         </Suspense>
//       </main>
//       <Footer></Footer>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState, Suspense, useMemo } from "react";
// import { useSearchParams } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import { BookService } from "@/services/book-service";
// import { SearchBookCommand } from "@/commands/book-command";
// import { Livro } from "@/types/livros";
// import SearchBar from "@/components/search-bar";
// import Header from "@/components/header";
// import Footer from "@/components/footer";
// import BackgroundShapes from "@/components/visual/background-shapes";
// import BookDetailsModal from "../../components/modals/book-datails-modal";
// // import FilterList from "@/components/visual/filter-list";
// import {
//   Filter,
//   Calendar,
//   User,
//   Tag,
//   RotateCcw,
//   LayoutGrid,
//   List,
// } from "lucide-react";
// import FilterList from "@/components/visual/filter-list";

// function SearchContent() {
//   const searchParams = useSearchParams();
//   const termoBusca = searchParams.get("q") || "";

//   const [loading, setLoading] = useState(true);
//   const [livros, setLivros] = useState<Livro[]>([]);
//   const [selectedBook, setSelectedBook] = useState<Livro | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Estados de Filtro
//   const [filtroAssunto, setFiltroAssunto] = useState("");
//   const [filtroAutor, setFiltroAutor] = useState("");
//   const [filtroAno, setFiltroAno] = useState("");

//   // Estados de UI dos filtros
//   const [showAllAssuntos, setShowAllAssuntos] = useState(false);
//   const [showAllAutores, setShowAllAutores] = useState(false);

//   useEffect(() => {
//     const fetchLivros = async () => {
//       setLoading(true);
//       const service = new BookService();
//       const command = new SearchBookCommand(service, termoBusca, (dados) => {
//         setLivros(dados);
//         setLoading(false);
//       });
//       await command.execute();
//     };
//     fetchLivros();
//   }, [termoBusca]);

//   // Extração dinâmica das opções baseada nos livros retornados
//   const opcoesFiltros = useMemo(() => {
//     const assuntos = new Set<string>();
//     const autores = new Set<string>();
//     const anos = new Set<string>();

//     livros.forEach((l) => {
//       if (l.nome_assunto) assuntos.add(l.nome_assunto);
//       if (l.nomes_autores) autores.add(l.nomes_autores);
//       if (l.ano_publicacao) anos.add(l.ano_publicacao.toString());
//     });

//     return {
//       assuntos: Array.from(assuntos).sort(),
//       autores: Array.from(autores).sort(),
//       anos: Array.from(anos).sort((a, b) => Number(b) - Number(a)),
//     };
//   }, [livros]);

//   // Lógica de filtragem
//   const livrosFiltrados = useMemo(() => {
//     return livros.filter((livro) => {
//       const matchAssunto =
//         !filtroAssunto || livro.nome_assunto === filtroAssunto;
//       const matchAutor = !filtroAutor || livro.nomes_autores === filtroAutor;
//       const matchAno =
//         !filtroAno || livro.ano_publicacao?.toString() === filtroAno;
//       return matchAssunto && matchAutor && matchAno;
//     });
//   }, [livros, filtroAssunto, filtroAutor, filtroAno]);

//   const limparFiltros = () => {
//     setFiltroAssunto("");
//     setFiltroAutor("");
//     setFiltroAno("");
//   };

//   const openDetails = (livro: Livro) => {
//     setSelectedBook(livro);
//     setIsModalOpen(true);
//   };

//   return (
//     <div className="max-w-7xl mx-auto w-full px-4 md:px-8 lg:px-16 py-12">
//       {/* IDENTIDADE E BUSCA */}
//       <div className="mb-16 flex flex-col items-center gap-8">
//         <Link
//           href="/"
//           className="flex flex-col items-center gap-3 group transition-transform hover:scale-105"
//         >
//           <Image
//             src="/img/logo.png"
//             alt="Logo"
//             width={80}
//             height={80}
//             className="drop-shadow-md"
//           />
//           <h2 className="text-2xl font-bold tracking-tight text-gray-900">
//             <span className="text-denin">e</span>-Papirus
//           </h2>
//         </Link>
//         <div className="w-full max-w-2xl">
//           <SearchBar />
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-10">
//         {/* SIDEBAR DE FILTROS */}
//         <aside className="w-full lg:w-72 flex-shrink-0">
//           <div className="sticky top-24 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-8">
//             <div className="flex items-center justify-between border-b pb-4 border-gray-50">
//               <h3 className="font-bold text-gray-900 flex items-center gap-2">
//                 <Filter size={18} className="text-denin" /> Filtros
//               </h3>
//               {(filtroAssunto || filtroAutor || filtroAno) && (
//                 <button
//                   onClick={limparFiltros}
//                   className="text-[10px] uppercase font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-md transition-all flex items-center gap-1"
//                 >
//                   <RotateCcw size={12} /> Limpar
//                 </button>
//               )}
//             </div>

//             <div className="space-y-8">
//               {/* Assunto */}
//               <div>
//                 <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 mb-3">
//                   <Tag size={12} /> Assuntos
//                 </h4>
//                 <FilterList
//                   items={opcoesFiltros.assuntos}
//                   selectedValue={filtroAssunto}
//                   onSelect={setFiltroAssunto}
//                   showAll={showAllAssuntos}
//                   onToggleShowAll={() => setShowAllAssuntos(!showAllAssuntos)}
//                 />
//               </div>

//               {/* Autor */}
//               <div>
//                 <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 mb-3">
//                   <User size={12} /> Autores
//                 </h4>
//                 <FilterList
//                   items={opcoesFiltros.autores}
//                   selectedValue={filtroAutor}
//                   onSelect={setFiltroAutor}
//                   showAll={showAllAutores}
//                   onToggleShowAll={() => setShowAllAutores(!showAllAutores)}
//                 />
//               </div>

//               {/* Ano em Grade */}
//               <div>
//                 <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 mb-3">
//                   <Calendar size={12} /> Ano de Publicação
//                 </h4>
//                 <div className="grid grid-cols-2 gap-2">
//                   {opcoesFiltros.anos.slice(0, 6).map((ano) => (
//                     <button
//                       key={ano}
//                       onClick={() => setFiltroAno(filtroAno === ano ? "" : ano)}
//                       className={`text-xs py-2 rounded-xl border transition-all ${
//                         filtroAno === ano
//                           ? "bg-denin border-denin text-white font-bold shadow-md shadow-denin/20"
//                           : "border-gray-100 text-gray-600 hover:border-denin hover:text-denin bg-gray-50/50"
//                       }`}
//                     >
//                       {ano}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </aside>

//         {/* ÁREA DE RESULTADOS */}
//         <div className="grow">
//           <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b pb-6 border-gray-100">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 leading-tight">
//                 {termoBusca ? (
//                   <>
//                     Resultados para{" "}
//                     <span className="text-denin">&quot;{termoBusca}&quot;</span>
//                   </>
//                 ) : (
//                   "Nosso Acervo Digital"
//                 )}
//               </h1>
//               <p className="text-gray-500 text-sm mt-2 font-medium">
//                 Encontramos {livrosFiltrados.length} obras que combinam com sua
//                 busca
//               </p>
//             </div>
//           </div>

//           {loading ? (
//             <div className="py-24 flex flex-col items-center gap-4 text-gray-400">
//               <div className="w-10 h-10 border-4 border-denin border-t-transparent rounded-full animate-spin" />
//               <p className="font-medium animate-pulse">
//                 Consultando base de dados...
//               </p>
//             </div>
//           ) : (
//             <>
//               {livrosFiltrados.length === 0 ? (
//                 <div className="py-24 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
//                   <p className="text-gray-500 font-semibold text-lg">
//                     Nenhum livro encontrado.
//                   </p>
//                   <p className="text-gray-400 text-sm mb-6">
//                     Tente ajustar seus filtros ou mudar o termo da busca.
//                   </p>
//                   <button
//                     onClick={limparFiltros}
//                     className="px-6 py-2 bg-denin text-white rounded-full font-bold text-sm shadow-lg shadow-denin/30"
//                   >
//                     Resetar Filtros
//                   </button>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//                   {livrosFiltrados.map((livro) => (
//                     <div
//                       key={livro.id_livro}
//                       className="group bg-white border border-gray-100 p-4 rounded-[24px] flex gap-5 hover:shadow-2xl hover:shadow-denin/10 hover:border-denin/10 transition-all cursor-pointer relative overflow-hidden"
//                       onClick={() => openDetails(livro)}
//                     >
//                       <div className="w-24 h-32 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-50">
//                         <img
//                           src={livro.capa || "/img/placeholder.png"}
//                           alt={livro.titulo}
//                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
//                         />
//                       </div>
//                       <div className="flex flex-col justify-center grow py-1">
//                         <span className="text-[10px] font-bold text-denin uppercase tracking-wider mb-2">
//                           {livro.nome_assunto}
//                         </span>
//                         <h3 className="font-bold text-base text-gray-800 line-clamp-2 leading-tight group-hover:text-denin transition-colors mb-1">
//                           {livro.titulo}
//                         </h3>
//                         <p className="text-xs text-gray-400 italic truncate mb-3">
//                           {livro.nomes_autores}
//                         </p>
//                         <div className="flex items-center gap-2">
//                           <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded text-gray-500 uppercase">
//                             {livro.ano_publicacao}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       <BookDetailsModal
//         livro={selectedBook}
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//       />
//     </div>
//   );
// }

// export default function ResultadosPage() {
//   return (
//     <div className="min-h-screen flex flex-col bg-slate-50/30">
//       <BackgroundShapes />
//       <Header />
//       <main className="grow">
//         <Suspense
//           fallback={
//             <div className="p-24 text-center text-gray-400 animate-pulse">
//               Carregando ambiente de busca...
//             </div>
//           }
//         >
//           <SearchContent />
//         </Suspense>
//       </main>
//       <Footer />
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState, Suspense } from "react";
// import { useSearchParams } from "next/navigation";
// import Image from "next/image"; // Importado para a logo
// import Link from "next/link";
// import { BookService } from "@/services/book-service";
// import { SearchBookCommand } from "@/commands/book-command";
// import { Livro } from "@/types/livros";
// import SearchBar from "@/components/search-bar";
// import Header from "@/components/header";
// import Footer from "@/components/footer";
// import BackgroundShapes from "@/components/visual/background-shapes";
// import BookDetailsModal from "../../components/modals/book-datails-modal";

// function SearchContent() {
//   const searchParams = useSearchParams();
//   const termoBusca = searchParams.get("q") || "";

//   const [loading, setLoading] = useState(true);
//   const [livros, setLivros] = useState<Livro[]>([]);
//   const [selectedBook, setSelectedBook] = useState<Livro | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     const fetchLivros = async () => {
//       setLoading(true);
//       const service = new BookService();
//       const command = new SearchBookCommand(service, termoBusca, (dados) => {
//         setLivros(dados);
//         setLoading(false);
//       });
//       await command.execute();
//     };
//     fetchLivros();
//   }, [termoBusca]);

//   const openDetails = (livro: Livro) => {
//     setSelectedBook(livro);
//     setIsModalOpen(true);
//   };

//   return (
//     <div className="max-w-7xl mx-auto w-full px-4 md:px-8 lg:px-16 py-12">
//       {/* IDENTIDADE DO SISTEMA E BUSCA */}
//       <div className="mb-16 flex flex-col items-center gap-8">
//         <Link
//           href="/"
//           className="flex flex-col items-center gap-3 group transition-transform hover:scale-105"
//         >
//           <Image
//             src="/img/logo.png"
//             alt="Logo e-Papirus"
//             width={80}
//             height={80}
//             className="drop-shadow-md"
//           />
//           <h2 className="text-2xl font-bold tracking-tight text-gray-900">
//             <span className="text-denin">e</span>-Papirus
//           </h2>
//         </Link>

//         <div className="w-full max-w-2xl">
//           <SearchBar />
//         </div>
//       </div>

//       {/* CABEÇALHO DE RESULTADOS */}
//       <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b pb-6 border-gray-100">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             {termoBusca ? (
//               <>
//                 Resultados para:{" "}
//                 <span className="text-denin">&quot;{termoBusca}&quot;</span>
//               </>
//             ) : (
//               "Acervo Digital"
//             )}
//           </h1>
//           <p className="text-gray-500 text-sm mt-1 font-medium">
//             {livros.length}{" "}
//             {livros.length === 1 ? "obra encontrada" : "obras encontradas"}
//           </p>
//         </div>
//       </div>

//       {loading ? (
//         <div className="py-20 flex flex-col items-center gap-4 text-gray-400">
//           <div className="w-10 h-10 border-4 border-denin border-t-transparent rounded-full animate-spin" />
//           <p className="animate-pulse">Consultando acervo...</p>
//         </div>
//       ) : (
//         <>
//           {termoBusca ? (
//             /* --- VISUAL DE LISTA (Para Pesquisa) --- */
//             <div className="flex flex-col gap-4">
//               {livros.length === 0 ? (
//                 <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
//                   Nenhum livro corresponde à sua busca.
//                 </div>
//               ) : (
//                 livros.map((livro) => (
//                   <div
//                     key={livro.id_livro}
//                     className="bg-white border border-gray-100 p-4 rounded-xl flex gap-6 hover:shadow-lg hover:border-denin/20 transition-all group cursor-pointer"
//                     onClick={() => openDetails(livro)}
//                   >
//                     <div className="w-20 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
//                       {livro.capa ? (
//                         <img
//                           src={livro.capa}
//                           alt={livro.titulo}
//                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
//                           SEM CAPA
//                         </div>
//                       )}
//                     </div>
//                     <div className="flex flex-col justify-center grow">
//                       <span className="text-[10px] text-denin font-bold uppercase tracking-widest mb-1">
//                         {livro.nome_assunto}
//                       </span>
//                       <h3 className="font-bold text-lg text-gray-800 group-hover:text-denin transition-colors leading-tight">
//                         {livro.titulo}
//                       </h3>
//                       <p className="text-sm text-gray-500 mt-1 italic">
//                         {livro.nomes_autores}
//                       </p>
//                     </div>
//                     <div className="flex items-center pr-2">
//                       <button className="text-xs font-bold text-denin border border-denin/20 px-5 py-2.5 rounded-full hover:bg-denin hover:text-white transition-all shadow-sm">
//                         Detalhes
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           ) : (
//             /* --- VISUAL DE GRADE (Para Acervo Geral) --- */
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//               {livros.map((livro) => (
//                 <div
//                   key={livro.id_livro}
//                   className="flex flex-col group cursor-pointer"
//                   onClick={() => openDetails(livro)}
//                 >
//                   <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl group-hover:ring-4 ring-denin/5 transition-all duration-300">
//                     <img
//                       src={livro.capa || "/img/placeholder.png"}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
//                     />
//                   </div>
//                   <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-denin transition-colors">
//                     {livro.titulo}
//                   </h3>
//                   <p className="text-xs text-gray-500 line-clamp-1 italic">
//                     {livro.nomes_autores}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       )}

//       <BookDetailsModal
//         livro={selectedBook}
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//       />
//     </div>
//   );
// }

// export default function ResultadosPage() {
//   return (
//     <div className="min-h-screen flex flex-col bg-white">
//       <BackgroundShapes />
//       <Header />
//       <main className="grow">
//         <Suspense
//           fallback={
//             <div className="p-20 text-center text-gray-400 animate-pulse">
//               Carregando acervo...
//             </div>
//           }
//         >
//           <SearchContent />
//         </Suspense>
//       </main>
//       <Footer />
//     </div>
//   );
// }
