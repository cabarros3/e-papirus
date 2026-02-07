'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookService } from '@/services/book-service';
import { SearchBookCommand } from '@/commands/book-command';
import { Livro } from '@/types/livros';
import { toast } from 'sonner';
import {
  Loader2,
  Filter,
  Tag,
  User,
  ChevronRight,
  BookOpen,
  Calendar,
} from 'lucide-react';
import FilterList from '@/components/visual/filter-list';
import BookDetailsModal from '@/components/modals/book-datails-modal';
import SearchBar from '@/components/search-bar';

function ConsultarAcervoContent() {
  const searchParams = useSearchParams();
  const termoBusca = searchParams.get('q') || '';

  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(termoBusca);
  const [selectedBook, setSelectedBook] = useState<Livro | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filtroAssunto, setFiltroAssunto] = useState('');
  const [filtroAutor, setFiltroAutor] = useState('');
  const [filtroAno, setFiltroAno] = useState('');

  const [showAllAssuntos, setShowAllAssuntos] = useState(false);
  const [showAllAutores, setShowAllAutores] = useState(false);

  const bookService = useMemo(() => new BookService(), []);

  useEffect(() => {
    setSearchTerm(termoBusca);
  }, [termoBusca]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const command = new SearchBookCommand(
        bookService,
        searchTerm,
        (dados) => {
          setLivros(dados);
        }
      );
      await command.execute();
    } catch (err) {
      toast.error('Erro ao carregar acervo.');
    } finally {
      setLoading(false);
    }
  }, [bookService, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sidebarOptions = useMemo(() => {
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
    return livros.filter((l) => {
      const matchAssunto = !filtroAssunto || l.nome_assunto === filtroAssunto;
      const matchAutor = !filtroAutor || l.nomes_autores === filtroAutor;
      const matchAno = !filtroAno || l.ano_publicacao?.toString() === filtroAno;
      return matchAssunto && matchAutor && matchAno;
    });
  }, [livros, filtroAssunto, filtroAutor, filtroAno]);

  return (
    /* AJUSTE: px-8 (32px) e gap-8 (32px) para consistência */
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full px-8 py-10 flex flex-col gap-8 max-w-[1600px] mx-auto">
      {/* HEADER DA PÁGINA */}
      <header>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
          Acervo <span className="text-denin">e</span>-Papirus
        </h1>
      </header>

      {/* BARRA DE BUSCA STICKY - Ajustada com gap de 32px */}
      <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-8 border-b border-gray-100 bg-gray-50/80 backdrop-blur-md sticky top-0 z-20">
        <div className="w-full max-w-xl">
          <SearchBar />
        </div>

        <div className="hidden md:block shrink-0 text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
            Resultados
          </p>
          <div className="flex items-center gap-2 justify-end">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-bold text-denin">
              {livrosFiltrados.length} encontrados
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR DE FILTROS */}
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
          <div className="flex items-center justify-between border-b-2 border-denin/10 pb-4">
            <h3 className="font-black text-gray-800 flex items-center gap-2 uppercase text-[11px] tracking-widest">
              <Filter size={16} className="text-denin" strokeWidth={3} />{' '}
              Filtros
            </h3>
            {(filtroAssunto || filtroAutor || filtroAno) && (
              <button
                onClick={() => {
                  setFiltroAssunto('');
                  setFiltroAutor('');
                  setFiltroAno('');
                }}
                className="text-[10px] font-black text-red-500 uppercase hover:underline"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="space-y-8">
            {sidebarOptions.assuntos.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black uppercase text-denin/60 mb-4 tracking-[0.2em] flex items-center gap-2">
                  <Tag size={12} /> Assunto
                </h4>
                <FilterList
                  items={sidebarOptions.assuntos}
                  selectedValue={filtroAssunto}
                  onSelect={setFiltroAssunto}
                  showAll={showAllAssuntos}
                  onToggleShowAll={() => setShowAllAssuntos(!showAllAssuntos)}
                />
              </div>
            )}

            {sidebarOptions.autores.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black uppercase text-denin/60 mb-4 tracking-[0.2em] flex items-center gap-2">
                  <User size={12} /> Autores
                </h4>
                <FilterList
                  items={sidebarOptions.autores}
                  selectedValue={filtroAutor}
                  onSelect={setFiltroAutor}
                  showAll={showAllAutores}
                  onToggleShowAll={() => setShowAllAutores(!showAllAutores)}
                />
              </div>
            )}

            {sidebarOptions.anos.length > 0 && (
              <div>
                <h4 className="text-[10px] font-black uppercase text-denin/60 mb-4 tracking-[0.2em] flex items-center gap-2">
                  <Calendar size={12} /> Ano
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {sidebarOptions.anos.slice(0, 8).map((ano) => (
                    <button
                      key={ano}
                      onClick={() => setFiltroAno(filtroAno === ano ? '' : ano)}
                      className={`text-[11px] py-2 rounded-xl border transition-all font-bold ${
                        filtroAno === ano
                          ? 'bg-denin border-denin text-white shadow-sm'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-denin/30'
                      }`}
                    >
                      {ano}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* LISTAGEM DE CARDS */}
        <div className="grow">
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
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-denin mb-4" size={32} />
              <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                Sincronizando acervo...
              </p>
            </div>
          ) : (
            /* Gap entre cards de 32px (gap-8) */
            <div className="grid gap-8 pb-12">
              {livrosFiltrados.map((livro) => (
                <div
                  key={livro.id_livro}
                  onClick={() => {
                    setSelectedBook(livro);
                    setIsModalOpen(true);
                  }}
                  /* Ajuste: p-8 (32px) e rounded-[32px] */
                  className="group bg-white p-8 rounded-[32px] flex items-center gap-8 hover:shadow-xl hover:shadow-denin/5 border border-gray-100 hover:border-denin/20 transition-all cursor-pointer"
                >
                  <div className="w-20 h-28 bg-gray-50 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-gray-50">
                    <img
                      src={livro.capa || '/img/placeholder.png'}
                      alt={livro.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="grow min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-black text-denin uppercase tracking-wider">
                        {livro.nome_assunto || 'Geral'}
                      </span>
                      {livro.ano_publicacao && (
                        <span className="text-[9px] font-bold text-gray-300">
                          / {livro.ano_publicacao}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 truncate group-hover:text-denin transition-colors leading-tight">
                      {livro.titulo}
                    </h3>
                    <p className="text-gray-500 text-sm font-medium flex items-center gap-2 mt-1">
                      <User size={14} className="text-denin/60" />{' '}
                      {livro.nomes_autores}
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-denin group-hover:text-white transition-all shadow-sm">
                    <ChevronRight size={24} />
                  </div>
                </div>
              ))}

              {livrosFiltrados.length === 0 && (
                <div className="py-20 text-center bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-200">
                  <BookOpen size={32} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-400 font-bold text-sm">
                    Nenhum livro corresponde à sua pesquisa.
                  </p>
                </div>
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

export default function ConsultarAcervo() {
  return (
    <Suspense fallback={null}>
      <ConsultarAcervoContent />
    </Suspense>
  );
}
