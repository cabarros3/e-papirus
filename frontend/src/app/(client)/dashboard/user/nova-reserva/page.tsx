'use client';

import {
  ArrowLeft,
  Loader2,
  CalendarCheck,
  Book,
  Info,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { reservaService } from '@/services/reserva-service';
import { ExemplaresService } from '@/services/exemplar-service';
import { BookService } from '@/services/book-service';
import { Pessoa } from '@/types/pessoas';
import { Livro } from '@/types/livros';

import { BasketItem, BookBasket } from '@/components/cards/BookBasket';
import { ResumoReservaModal } from '@/components/modals/resumo-reserva-modal';
import { toast } from 'sonner';

function ReservaUsuarioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userLogado, setUserLogado] = useState<Pessoa | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dadosResumo, setDadosResumo] = useState<any>(null);

  const [livros, setLivros] = useState<Livro[]>([]);
  const [livroSelecionadoId, setLivroSelecionadoId] = useState('');
  const [cesta, setCesta] = useState<BasketItem[]>([]);
  const [livroVisualizado, setLivroVisualizado] = useState<Livro | null>(null);

  const getExemplarDisponivel = async (idLivro: number) => {
    const livroComExemplares =
      await ExemplaresService.getExemplaresPorLivro(idLivro);
    const disponivel = livroComExemplares?.exemplares.find(
      (ex) => ex.disponibilidade === 'disponivel'
    );
    const totalDisponiveis =
      livroComExemplares?.exemplares.filter(
        (ex) => ex.disponibilidade === 'disponivel'
      ).length || 0;

    if (!disponivel) return null;

    return {
      id_exemplar: disponivel.id_exemplar,
      numero_exemplar: disponivel.numero_exemplar,
      exemplares_disponiveis: totalDisponiveis,
    };
  };

  useEffect(() => {
    const carregarDados = async () => {
      const saved = sessionStorage.getItem('bib_user');
      const user: Pessoa = saved ? JSON.parse(saved) : null;
      setUserLogado(user);

      try {
        const bookService = new BookService();
        const listaLivros = await bookService.getAllBooks();
        setLivros(listaLivros || []);

        // Captura o id do livro vindo da URL (Acervo)
        const idLivroUrl = searchParams.get('id_livro');

        if (idLivroUrl && listaLivros.length > 0) {
          const livroEncontrado = listaLivros.find(
            (l) => String(l.id_livro) === idLivroUrl
          );

          if (livroEncontrado) {
            setLivroSelecionadoId(String(livroEncontrado.id_livro));
            setLivroVisualizado(livroEncontrado);

            // Importante: Guardamos o ID real do livro para o backend
            const exemplar = await getExemplarDisponivel(
              livroEncontrado.id_livro
            );

            if (!exemplar) {
              toast.warning('Nao ha exemplares disponiveis para este livro.');
              return;
            }

            setCesta([
              {
                id_livro: livroEncontrado.id_livro,
                id_exemplar: exemplar.id_exemplar,
                numero_exemplar: exemplar.numero_exemplar,
                exemplares_disponiveis: exemplar.exemplares_disponiveis,
                titulo: livroEncontrado.titulo,
              },
            ]);
          }
        }
      } catch (error) {
        toast.error('Erro ao carregar o acervo.');
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [searchParams]);

  const handleFecharModal = () => {
    setIsModalOpen(false);
    toast.success('Reserva realizada com sucesso!');
    setCesta([]);
    setLivroSelecionadoId('');
    setLivroVisualizado(null);
    setDadosResumo(null);
    router.push('/dashboard/user/minhas-reservas');
  };

  const handleAdicionar = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    if (!livroSelecionadoId) return toast.warning('Selecione um livro.');
    if (cesta.length >= 2) return toast.warning('Limite de 2 livros.');

    const livro = livros.find((l) => String(l.id_livro) === livroSelecionadoId);
    if (livro) {
      if (cesta.some((item) => item.id_livro === livro.id_livro)) {
        return toast.warning('Este livro já está na lista.');
      }
      try {
        const exemplar = await getExemplarDisponivel(livro.id_livro);
        if (!exemplar) {
          return toast.warning('Nao ha exemplares disponiveis para este livro.');
        }
        setCesta([
          ...cesta,
          {
            id_livro: livro.id_livro,
            id_exemplar: exemplar.id_exemplar,
            numero_exemplar: exemplar.numero_exemplar,
            exemplares_disponiveis: exemplar.exemplares_disponiveis,
            titulo: livro.titulo,
          },
        ]);
      } catch (error) {
        toast.error('Erro ao verificar exemplares disponiveis.');
      }
    }
  };

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cesta.length === 0) return;

    setIsSubmitting(true);
    try {
      // CORREÇÃO CRÍTICA: O backend PHP exige a chave "id_livro"
      // Aqui garantimos que enviamos exatamente o que o script PHP espera
      await Promise.all(
        cesta.map((item) =>
          reservaService.criar({ id_livro: item.id_livro as number })
        )
      );

      const prazoDias = userLogado?.tipo === 'professor' ? 7 : 3;
      const dataExp = new Date();
      dataExp.setDate(dataExp.getDate() + prazoDias);

      setDadosResumo({
        livros: cesta.map((i) => i.titulo).join(', '),
        usuario: userLogado?.nome,
        expiracao: dataExp.toISOString(),
      });

      setIsModalOpen(true);
    } catch (error: any) {
      // Exibe o erro real vindo do PHP (ex: "Não há exemplares disponíveis")
      const msgErro =
        error.response?.data?.mensagem ||
        error.message ||
        'Erro ao solicitar reserva.';
      toast.error(msgErro);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-denin" size={40} />
      </div>
    );

  return (
    <div className="w-full px-8 py-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <ResumoReservaModal
        isOpen={isModalOpen}
        dados={dadosResumo}
        onConfirm={handleFecharModal}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              Nova Reserva
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Reserve seus livros para retirada no balcão.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LADO ESQUERDO: FORMULÁRIO */}
        <div className="flex flex-col space-y-6 md:pr-4">
          <div className="space-y-6">
            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <CalendarCheck size={14} /> Dados da Reserva
            </h2>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Solicitante
              </p>
              <p className="text-sm font-bold text-denin">{userLogado?.nome}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-tighter">
                Buscar Obra
              </label>
              <div className="relative">
                <select
                  className="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-denin outline-none transition-all appearance-none text-sm font-medium"
                  value={livroSelecionadoId}
                  onChange={(e) => {
                    setLivroSelecionadoId(e.target.value);
                    setLivroVisualizado(
                      livros.find(
                        (l) => String(l.id_livro) === e.target.value
                      ) || null
                    );
                  }}
                >
                  <option value="">Selecione um título...</option>
                  {livros.map((l) => (
                    <option key={l.id_livro} value={l.id_livro}>
                      {l.titulo}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={handleAdicionar}
                className="w-full py-3 text-denin font-bold text-xs uppercase tracking-widest hover:bg-blue-50 rounded-xl transition-colors mt-2"
              >
                + Adicionar à cesta
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4 mt-auto">
            <Info className="text-denin shrink-0" size={20} />
            <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
              Reserva válida por{' '}
              <span className="font-bold">
                {userLogado?.tipo === 'professor' ? '7 dias' : '3 dias'}
              </span>
              .
            </p>
          </div>
        </div>

        {/* LADO DIREITO: CESTA */}
        <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col min-h-[350px]">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-6">
            <CalendarCheck size={18} className="text-denin" /> Sua Lista
          </h3>
          <div className="flex-grow">
            <BookBasket
              itens={cesta}
              onRemove={(id) =>
                setCesta(cesta.filter((i) => i.id_livro !== id))
              }
              livroDetalhes={livroVisualizado}
            />
          </div>
          <button
            onClick={handleFinalizar}
            disabled={isSubmitting || cesta.length === 0}
            className="w-full mt-6 bg-denin text-white h-14 rounded-[2rem] font-bold shadow-xl shadow-blue-100 disabled:opacity-40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              `Confirmar Reserva (${cesta.length})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReservaUsuarioPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-denin" size={40} />
        </div>
      }
    >
      <ReservaUsuarioContent />
    </Suspense>
  );
}
