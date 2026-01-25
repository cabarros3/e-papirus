"use client";

import { ArrowLeft, Loader2, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { reservaService } from "@/services/reserva-service";
import { pessoaService } from "@/services/pessoa-service";
import { BookService } from "@/services/book-service";
import { Pessoa } from "@/types/pessoas";
import { Livro } from "@/types/livros";

import { BasketItem, BookBasket } from "@/components/cards/BookBasket";
import { UserSearchInput } from "@/components/inputs/UserSearchInput";
import { ResumoReservaModal } from "@/components/modals/resumo-reserva-modal";
import { toast } from "sonner";

export default function ReservaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dadosResumo, setDadosResumo] = useState<any>(null);

  const [usuarios, setUsuarios] = useState<Pessoa[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);

  const [selecionado, setSelecionado] = useState({
    usuarioId: "",
    usuarioNome: "",
    livroId: "",
  });

  const [cesta, setCesta] = useState<BasketItem[]>([]);
  const [livroVisualizado, setLivroVisualizado] = useState<Livro | null>(null);

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
        toast.error("Falha ao carregar dados iniciais.");
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  // FUNÇÃO QUE LIMPA TUDO E FECHA O MODAL
  const handleConcluirReserva = () => {
    setIsModalOpen(false);
    setCesta([]);
    setSelecionado({
      usuarioId: "",
      usuarioNome: "",
      livroId: "",
    });
    setLivroVisualizado(null);
    setDadosResumo(null);
    // Opcional: router.push("/dashboard/staff/reservas"); se quiser sair da página
  };

  const handleAdicionarReserva = () => {
    if (!selecionado.livroId) return toast.warning("Selecione um livro.");
    if (cesta.length >= 2) return toast.warning("Limite de 2 reservas.");

    const livroInfo = livros.find(
      (l) => String(l.id_livro) === selecionado.livroId,
    );

    if (livroInfo) {
      if (cesta.some((item) => item.id_exemplar === livroInfo.id_livro)) {
        return toast.warning("Este livro já está na cesta.");
      }

      setCesta([
        ...cesta,
        {
          id_exemplar: livroInfo.id_livro,
          numero_exemplar: 0,
          titulo: livroInfo.titulo,
        },
      ]);
    }
  };

  const handleFinalizarReservas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selecionado.usuarioId || cesta.length === 0) {
      return toast.error("Dados incompletos.");
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        cesta.map((item) =>
          reservaService.criar({
            id_livro: item.id_exemplar,
            id_pessoa: parseInt(selecionado.usuarioId),
          }),
        ),
      );

      const hoje = new Date();
      hoje.setDate(hoje.getDate() + 3);

      setDadosResumo({
        livros: cesta.map((i) => i.titulo).join(", "),
        usuario: selecionado.usuarioNome,
        expiracao: hoje.toISOString(),
      });

      setIsModalOpen(true);
    } catch (error: any) {
      toast.error(error.message || "Erro na reserva.");
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
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <ResumoReservaModal
        isOpen={isModalOpen}
        dados={dadosResumo}
        onConfirm={handleConcluirReserva} // Vinculado à função de limpeza
      />

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/staff/"
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Reserva de Títulos</h1>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <CalendarCheck size={18} /> Livros para Reservar
          </h3>
          <BookBasket
            itens={cesta}
            onRemove={(id) =>
              setCesta(cesta.filter((i) => i.id_exemplar !== id))
            }
            livroDetalhes={livroVisualizado}
          />
        </div>

        <form
          onSubmit={handleFinalizarReservas}
          className="flex flex-col justify-center space-y-6"
        >
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
            <label className="text-sm font-medium text-gray-600 ml-2">
              Buscar Livro
            </label>
            <select
              className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-denin outline-none"
              onChange={(e) => {
                const id = e.target.value;
                setSelecionado({ ...selecionado, livroId: id });
                const detalhe = livros.find((l) => String(l.id_livro) === id);
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
            <button
              type="button"
              onClick={handleAdicionarReserva}
              className="w-full py-3 text-denin font-semibold hover:bg-denin/5 rounded-xl transition-colors"
            >
              + Adicionar à lista
            </button>
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting || cesta.length === 0 || !selecionado.usuarioId
            }
            className="w-full bg-denin text-white py-5 rounded-3xl font-bold shadow-xl disabled:opacity-50 hover:brightness-110 transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              `Confirmar Reserva (${cesta.length})`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
