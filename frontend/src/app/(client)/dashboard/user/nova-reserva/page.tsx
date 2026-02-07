'use client';

import { ArrowLeft, Loader2, CalendarCheck, Book, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { reservaService } from '@/services/reserva-service';
import { BookService } from '@/services/book-service';
import { Pessoa } from '@/types/pessoas';
import { Livro } from '@/types/livros';

import { BasketItem, BookBasket } from '@/components/cards/BookBasket';
import { ResumoReservaModal } from '@/components/modals/resumo-reserva-modal';
import { toast } from 'sonner';

export default function ReservaUsuarioPage() {
  const router = useRouter();
  const [userLogado, setUserLogado] = useState<Pessoa | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dadosResumo, setDadosResumo] = useState<any>(null);

  const [livros, setLivros] = useState<Livro[]>([]);
  const [livroSelecionadoId, setLivroSelecionadoId] = useState('');
  const [cesta, setCesta] = useState<BasketItem[]>([]);
  const [livroVisualizado, setLivroVisualizado] = useState<Livro | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      const saved = sessionStorage.getItem("bib_user");
      const user: Pessoa = saved ? JSON.parse(saved) : null;
      setUserLogado(user);

      try {
        const bookService = new BookService();
        const listaLivros = await bookService.getAllBooks();
        setLivros(listaLivros || []);
      } catch (error) {
        toast.error('Erro ao carregar o acervo.');
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  // --- NOVA FUNÇÃO DE LIMPEZA E REDIRECIONAMENTO ---
  const handleFecharModal = () => {
    setIsModalOpen(false);

    // Feedback visual
    toast.success('Reserva realizada com sucesso!');

    // Reset do formulário
    setCesta([]);
    setLivroSelecionadoId('');
    setLivroVisualizado(null);
    setDadosResumo(null);

    // Redirecionamento
    router.push('/dashboard/user/reservas');
  };

  const handleAdicionar = () => {
    if (!livroSelecionadoId)
      return toast.warning('Selecione um livro primeiro.');
    if (cesta.length >= 2) return toast.warning('Limite de 2 livros por vez.');

    const livro = livros.find((l) => String(l.id_livro) === livroSelecionadoId);
    if (livro) {
      if (cesta.some((item) => item.id_exemplar === livro.id_livro)) {
        return toast.warning('Este livro já está na sua lista.');
      }
      setCesta([
        ...cesta,
        {
          id_exemplar: livro.id_livro,
          numero_exemplar: 0,
          titulo: livro.titulo,
        },
      ]);
    }
  };

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cesta.length === 0) return;

    setIsSubmitting(true);
    try {
      await Promise.all(
        cesta.map((item) =>
          reservaService.criar({ id_livro: item.id_exemplar })
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
      toast.error(error.message || 'Erro ao solicitar reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-denin" size={40} />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <ResumoReservaModal
        isOpen={isModalOpen}
        dados={dadosResumo}
        onConfirm={handleFecharModal} // Chamando a nova função
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Nova Reserva</h1>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Perfil
          </p>
          <p className="text-sm font-semibold text-denin capitalize">
            {userLogado?.tipo}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Coluna da Esquerda: Seleção */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Book size={20} className="text-denin" />
              <span>Escolher Título</span>
            </div>

            <select
              className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-denin outline-none"
              value={livroSelecionadoId}
              onChange={(e) => {
                setLivroSelecionadoId(e.target.value);
                setLivroVisualizado(
                  livros.find((l) => String(l.id_livro) === e.target.value) ||
                    null
                );
              }}
            >
              <option value="">Selecione um livro do acervo...</option>
              {livros.map((l) => (
                <option key={l.id_livro} value={l.id_livro}>
                  {l.titulo}
                </option>
              ))}
            </select>

            <button
              onClick={handleAdicionar}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
            >
              Adicionar à Lista
            </button>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
            <Info className="text-blue-500 shrink-0" size={20} />
            <p className="text-xs text-blue-700 leading-relaxed">
              Você pode reservar até 2 livros simultaneamente. As reservas
              expiram em
              <strong>
                {' '}
                {userLogado?.tipo === 'professor' ? '7 dias' : '3 dias'}
              </strong>
              . Após esse prazo, o livro volta ao acervo se não for retirado.
            </p>
          </div>
        </div>

        {/* Coluna da Direita: Resumo/Cesta */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col min-h-[300px]">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <CalendarCheck size={18} /> Sua Lista
            </h3>

            <div className="flex-grow">
              <BookBasket
                itens={cesta}
                onRemove={(id) =>
                  setCesta(cesta.filter((i) => i.id_exemplar !== id))
                }
                livroDetalhes={livroVisualizado}
              />
            </div>

            <button
              onClick={handleFinalizar}
              disabled={isSubmitting || cesta.length === 0}
              className="w-full mt-6 bg-denin text-white py-5 rounded-2xl font-bold disabled:opacity-50 hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                'Confirmar Solicitação'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
