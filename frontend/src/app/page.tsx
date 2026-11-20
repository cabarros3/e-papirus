'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// Componentes de Layout e Visuais
import Header from '@/components/header';
import Footer from '@/components/footer';
import BackgroundShapes from '@/components/visual/background-shapes';
import Features from '@/components/visual/features';
import Link from 'next/link';

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
    // Adicionado bg-background para o fundo seguir o tema
    <div className="relative min-h-screen flex flex-col font-sans bg-background transition-colors duration-300">
      <BackgroundShapes />
      <Header />

      <main className="grow flex flex-col gap-16 md:gap-24">
        {/* HERO SECTION */}
        <section className="flex flex-col gap-8 md:gap-12 justify-center items-center text-center max-w-6xl mx-auto mt-20 md:mt-32 px-4">
          <Image
            src="/img/logo.png"
            alt="Logo e-Papirus"
            width={140}
            height={140}
            className="mx-auto drop-shadow-2xl animate-in fade-in zoom-in duration-700"
          />

          <div className="space-y-6">
            {/* Título Principal - Adicionado dark:text-white */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white transition-colors">
              <Link href='/'>
                <span className="text-denin dark:text-vivid-sky">e</span>-Papirus
              </Link>
            </h1>
            {/* Descrição - Adicionado dark:text-gray-300 */}
            <p className="md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed transition-colors">
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
              <div className="w-12 h-12 border-4 border-denin dark:border-vivid-sky border-t-transparent rounded-full animate-spin" />
              <p className="text-xl font-semibold text-denin dark:text-vivid-sky">
                Organizando estante...
              </p>
            </div>
          ) : (
            <>
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
