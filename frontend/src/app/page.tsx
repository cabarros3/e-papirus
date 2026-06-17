'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// Componentes de Layout e Visuais
import Header from '@/components/header';
import Footer from '@/components/footer';
import BackgroundShapes from '@/components/visual/background-shapes';
import Features from '@/components/visual/features';

// Componentes de Conteúdo
import SearchBar from '@/components/search-bar';
import NotificationSlider from '@/components/sliders/notification-slider';
import { BookSlider } from '@/components/sliders/book-slider';

// Serviços e Tipagens
import { BookService } from '@/services/book-service';
import {
  SearchBookCommand,
  GetPopularBooksCommand,
} from '@/commands/book-command';
import { Livro } from '@/types/livros';

export default function Home() {
  const [recentBooks, setRecentBooks] = useState<Livro[]>([]);
  const [mostBorrowed, setMostBorrowed] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      const service = new BookService();

      const commandRecent = new SearchBookCommand(
        service,
        '',
        (dados: Livro[]) => {
          setRecentBooks(dados);
        }
      );

      const commandPopular = new GetPopularBooksCommand(
        service,
        (dados: Livro[]) => {
          setMostBorrowed(dados);
        }
      );

      try {
        await Promise.all([commandRecent.execute(), commandPopular.execute()]);
      } catch (error) {
        console.error('Erro ao carregar dados da Home:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col font-sans">
      <BackgroundShapes />
      <Header />

      <main className="grow flex flex-col gap-16 md:gap-24">
        {/* HERO SECTION */}
        <section className="flex flex-col gap-8 md:gap-12 justify-center items-center text-center max-w-6xl mx-auto mt-20 md:mt-32 px-4">
          <Image
            src="/img/logo.png"
            alt="Logo e-Papirus"
            width={140} // Aumentado de 120 para 140 para acompanhar o texto
            height={140}
            className="mx-auto drop-shadow-2xl animate-in fade-in zoom-in duration-700"
          />

          <div className="space-y-6">
            {/* Título Principal: de 4xl/6xl para 5xl/7xl */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
              <span className="text-denin">e</span>-Papirus
            </h1>
            {/* Descrição: de lg/xl para xl/2xl */}
            <p className="md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore milhares de livros, artigos e conteúdos acadêmicos em um
              só lugar.
            </p>
          </div>

          <div className="w-full sm:w-3/4 md:w-2/3">
            <SearchBar variant="default" />
          </div>

          <Features />
        </section>

        <section className="px-4">
          <NotificationSlider />
        </section>

        {/* VITRINES DE LIVROS */}
        <div className="flex flex-col gap-20 pb-24 px-4 md:px-8 lg:px-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6 opacity-40">
              <div className="w-12 h-12 border-4 border-denin border-t-transparent rounded-full animate-spin" />
              <p className="text-xl font-semibold text-denin">
                Organizando estante...
              </p>
            </div>
          ) : (
            <>
              {/* Note: Certifique-se que o componente BookSlider aceite tamanhos maiores internamente */}
              <BookSlider
                livros={recentBooks}
                titulo="✨ Novas Aquisições"
                subtitulo="Os títulos mais recentes adicionados ao nosso catálogo este mês."
              />

              <BookSlider
                livros={mostBorrowed}
                titulo="🔥 Mais Lidos"
                subtitulo="As obras mais procuradas e lidas pela nossa comunidade acadêmica."
              />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// 'use client';

// import { useEffect, useState } from 'react';
// import Image from 'next/image';

// // Componentes de Layout e Visuais
// import Header from '@/components/header';
// import Footer from '@/components/footer';
// import BackgroundShapes from '@/components/visual/background-shapes';
// import Features from '@/components/visual/features';

// // Componentes de Conteúdo
// import SearchBar from '@/components/search-bar';
// import NotificationSlider from '@/components/sliders/notification-slider';
// import { BookSlider } from '@/components/sliders/book-slider';

// // Serviços e Tipagens
// import { BookService } from '@/services/book-service';
// // Importamos os dois comandos: o de busca e o novo de populares
// import {
//   SearchBookCommand,
//   GetPopularBooksCommand,
// } from '@/commands/book-command';
// import { Livro } from '@/types/livros';

// export default function Home() {
//   const [recentBooks, setRecentBooks] = useState<Livro[]>([]);
//   const [mostBorrowed, setMostBorrowed] = useState<Livro[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAllData = async () => {
//       const service = new BookService();

//       // 1. Comando para buscar Livros Recentes
//       const commandRecent = new SearchBookCommand(
//         service,
//         '',
//         (dados: Livro[]) => {
//           setRecentBooks(dados);
//         }
//       );

//       // 2. Comando para buscar os Mais Lidos (Ranking do novo endpoint PHP)
//       const commandPopular = new GetPopularBooksCommand(
//         service,
//         (dados: Livro[]) => {
//           setMostBorrowed(dados);
//         }
//       );

//       // Executa ambos os comandos em paralelo para otimizar o tempo de carregamento
//       try {
//         await Promise.all([commandRecent.execute(), commandPopular.execute()]);
//       } catch (error) {
//         console.error('Erro ao carregar dados da Home:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllData();
//   }, []);

//   return (
//     <div className="relative min-h-screen flex flex-col font-sans">
//       <BackgroundShapes />
//       <Header />

//       <main className="grow flex flex-col gap-12 md:gap-20">
//         {/* HERO SECTION */}
//         <section className="flex flex-col gap-6 md:gap-10 justify-center items-center text-center max-w-5xl mx-auto mt-16 md:mt-24 px-4">
//           <Image
//             src="/img/logo.png"
//             alt="Logo e-Papirus"
//             width={120}
//             height={120}
//             className="mx-auto drop-shadow-2xl animate-in fade-in zoom-in duration-700"
//           />

//           <div className="space-y-4">
//             <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
//               <span className="text-denin">e</span>-Papirus
//             </h1>
//             <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
//               Sua biblioteca digital inteligente. Explore milhares de livros,
//               artigos e conteúdos acadêmicos em um só lugar.
//             </p>
//           </div>

//           <div className="w-full sm:w-3/4 md:w-2/3">
//             <SearchBar />
//           </div>

//           <Features />
//         </section>

//         <section className="px-4">
//           <NotificationSlider />
//         </section>

//         {/* VITRINES DE LIVROS */}
//         <div className="flex flex-col gap-16 pb-20 px-4 md:px-8 lg:px-16">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
//               <div className="w-10 h-10 border-4 border-denin border-t-transparent rounded-full animate-spin" />
//               <p className="font-medium text-denin">Organizando estante...</p>
//             </div>
//           ) : (
//             <>
//               {/* Slider de Novidades */}
//               <BookSlider
//                 livros={recentBooks}
//                 titulo="✨ Novas Aquisições"
//                 subtitulo="Os títulos mais recentes adicionados ao nosso catálogo este mês."
//               />

//               {/* Slider de Mais Lidos (Populares) */}
//               <BookSlider
//                 livros={mostBorrowed}
//                 titulo="🔥 Mais Lidos"
//                 subtitulo="As obras mais procuradas e lidas pela nossa comunidade acadêmica."
//               />
//             </>
//           )}
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import Header from "@/components/header";
// import SearchBar from "@/components/search-bar";
// import { BookSlider } from "@/components/sliders/book-slider";
// import Image from "next/image";

// // Novos Componentes Visuais
// import Features from "@/components/visual/features";
// import BackgroundShapes from "@/components/visual/background-shapes";
// import Footer from "@/components/footer";

// import { BookService } from "@/services/book-service";
// import { SearchBookCommand } from "@/commands/book-command";
// import { Livro } from "@/types/livros";
// import NotificationSlider from "@/components/sliders/notification-slider";

// export default function Home() {
//   const [recentBooks, setRecentBooks] = useState<Livro[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchBooks = async () => {
//       const service = new BookService();
//       const command = new SearchBookCommand(service, "", (dados: Livro[]) => {
//         setRecentBooks(dados);
//         setLoading(false);
//       });
//       await command.execute();
//     };

//     fetchBooks();
//   }, []);

//   return (
//     <div className="relative min-h-screen flex flex-col">
//       {/* Background decorativo fixo */}
//       <BackgroundShapes />

//       <Header />
//       <main className="grow flex flex-col gap-16 px-4 md:px-8 lg:px-16 pb-10">
//         <div className="flex flex-col gap-6 md:gap-10 justify-center items-center text-center max-w-4xl mx-auto mt-20">
//           <Image
//             src="/img/logo.png"
//             alt="Logo e-Papirus"
//             width={120}
//             height={120}
//             className="mx-auto drop-shadow-xl"
//           />

//           <div className="space-y-4">
//             <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
//               <span className="text-denin">e</span>-Papirus
//             </h1>
//             <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl">
//               Explore nosso acervo digital e descubra livros, artigos e
//               conteúdos exclusivos para sua evolução.
//             </p>
//           </div>

//           <div className="w-full sm:w-3/4 md:w-2/3">
//             <SearchBar />
//           </div>

//           <Features />
//         </div>

//         <div>
//           <NotificationSlider />
//         </div>

//         <div className="w-full max-w-7xl mx-auto">
//           {/* <h2 className="text-2xl font-bold mb-6 text-gray-800 px-2">
//             Adicionados Recentemente
//           </h2> */}
//           {loading ? (
//             <div className="text-center py-20 opacity-50 flex flex-col items-center gap-4">
//               <div className="w-8 h-8 border-4 border-denin border-t-transparent rounded-full animate-spin"></div>
//               <p>Organizando as prateleiras...</p>
//             </div>
//           ) : (
//             <BookSlider livros={recentBooks} />
//           )}
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// }
