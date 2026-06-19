'use client';

import { ArrowLeft, Loader2, CalendarCheck, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { reservaService } from '@/services/reserva-service';
import { ExemplaresService } from '@/services/exemplar-service';
import { pessoaService } from '@/services/pessoa-service';
import { BookService } from '@/services/book-service';
import { Pessoa } from '@/types/pessoas';
import { Livro } from '@/types/livros';

import { BasketItem, BookBasket } from '@/components/cards/BookBasket';
import { UserSearchInput } from '@/components/inputs/UserSearchInput';
import { ResumoReservaModal } from '@/components/modals/resumo-reserva-modal';
import { toast } from 'sonner';

export default function ReservaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dadosResumo, setDadosResumo] = useState<any>(null);

  const [usuarios, setUsuarios] = useState<Pessoa[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);

  const [selecionado, setSelecionado] = useState({
    usuarioId: '',
    usuarioNome: '',
    livroId: '',
  });

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
      const bookService = new BookService();
      try {
        const [listaPessoas, listaLivros] = await Promise.all([
          pessoaService.listar(),
          bookService.getAllBooks(),
        ]);
        setUsuarios(listaPessoas || []);
        setLivros(listaLivros || []);
      } catch (error) {
        toast.error('Falha ao carregar dados iniciais.');
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  const handleConcluirReserva = () => {
    setIsModalOpen(false);
    setCesta([]);
    setSelecionado({
      usuarioId: '',
      usuarioNome: '',
      livroId: '',
    });
    setLivroVisualizado(null);
    setDadosResumo(null);
  };

  const handleAdicionarReserva = async () => {
    if (!selecionado.livroId) return toast.warning('Selecione um livro.');
    if (cesta.length >= 2) return toast.warning('Limite de 2 reservas.');

    const livroInfo = livros.find(
      (l) => String(l.id_livro) === selecionado.livroId
    );

    if (livroInfo) {
      if (cesta.some((item) => item.id_livro === livroInfo.id_livro)) {
        return toast.warning('Este livro já está na cesta.');
      }
      const exemplar = await getExemplarDisponivel(livroInfo.id_livro);
      if (!exemplar) {
        return toast.warning('Nao ha exemplares disponiveis para este livro.');
      }

      setCesta([
        ...cesta,
        {
          id_livro: livroInfo.id_livro,
          id_exemplar: exemplar.id_exemplar,
          numero_exemplar: exemplar.numero_exemplar,
          exemplares_disponiveis: exemplar.exemplares_disponiveis,
          titulo: livroInfo.titulo,
        },
      ]);
    }
  };

  const handleFinalizarReservas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selecionado.usuarioId || cesta.length === 0) {
      return toast.error('Dados incompletos.');
    }

    setIsSubmitting(true);
    try {

      // Novo código
      const resultados = await Promise.all(
        cesta.map((item) => {
          console.log('Enviando:', {
            id_livro: item.id_livro,
            id_pessoa: parseInt(selecionado.usuarioId)
          });
          return reservaService.criar({
            id_livro: item.id_livro as number,
            id_pessoa: parseInt(selecionado.usuarioId),
          });
        })
      );

      console.log('Respostas da API:', resultados);

      // Código antigo (funcionando)
      // await Promise.all(
      //   cesta.map((item) =>
      //     reservaService.criar({
      //       id_livro: item.id_exemplar,
      //       id_pessoa: parseInt(selecionado.usuarioId),
      //     })
      //   )
      // );

      const hoje = new Date();
      hoje.setDate(hoje.getDate() + 3);

      setDadosResumo({
        livros: cesta.map((i) => i.titulo).join(', '),
        usuario: selecionado.usuarioNome,
        expiracao: hoje.toISOString(),
      });

      setIsModalOpen(true);
    } catch (error: any) {
      toast.error(error.message || 'Erro na reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    /* Alinhamento global de 32px (px-8) */
    <div className="w-full px-8 space-y-8 animate-in fade-in duration-500 pb-10">
      <ResumoReservaModal
        isOpen={isModalOpen}
        dados={dadosResumo}
        onConfirm={handleConcluirReserva}
      />

      {/* CABEÇALHO PADRONIZADO */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/staff/"
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-900 tracking-tight">
            Reserva de Itens
          </h1>
          <p className="text-sm text-gray-500 font-medium font-sans">
            Reserve obras que estão indisponíveis no momento.
          </p>
        </div>
      </div>

      {/* CARD PRINCIPAL EM GRID */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* COLUNA ESQUERDA: FORMULÁRIO */}
        <form
          onSubmit={handleFinalizarReservas}
          className="flex flex-col space-y-6 md:pr-4"
        >
          <div className="space-y-6">
            <h2 className="text-[11px] font-poppins font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <CalendarCheck size={14} /> Dados da Reserva
            </h2>

            <UserSearchInput
              usuarios={usuarios}
              selecionadoId={selecionado.usuarioId}
              selecionadoNome={selecionado.usuarioNome}
              onSelect={(u) =>
                setSelecionado({
                  ...selecionado,
                  usuarioId: String(u.id_pessoa),
                  usuarioNome: u.nome,
                })
              }
            />

            <div className="space-y-2">
              <label className="text-xs font-poppins font-bold text-gray-500 ml-1 uppercase tracking-tighter">
                Buscar Obra
              </label>
              <div className="relative">
                <select
                  className="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all appearance-none text-sm font-medium"
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelecionado({ ...selecionado, livroId: id });
                    const detalhe = livros.find(
                      (l) => String(l.id_livro) === id
                    );
                    setLivroVisualizado(detalhe || null);
                  }}
                  value={selecionado.livroId}
                >
                  <option value="">Selecione uma obra...</option>
                  {livros.map((livro) => (
                    <option key={livro.id_livro} value={livro.id_livro}>
                      {livro.titulo}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={handleAdicionarReserva}
                className="w-full py-3 text-blue-600 font-poppins font-bold text-xs uppercase tracking-widest hover:bg-blue-50 rounded-xl transition-colors mt-2"
              >
                + Adicionar à cesta
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting || cesta.length === 0 || !selecionado.usuarioId
            }
            className="w-full mt-auto bg-blue-600 text-white h-14 rounded-[2rem] font-bold shadow-xl shadow-blue-100 disabled:opacity-40 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              `Confirmar Reserva (${cesta.length})`
            )}
          </button>
        </form>

        {/* COLUNA DIREITA: CESTA (BookBasket) */}
        <BookBasket
          itens={cesta}
          onRemove={(id) => setCesta(cesta.filter((i) => i.id_livro !== id))}
          livroDetalhes={livroVisualizado}
        />
      </div>
    </div>
  );
}
