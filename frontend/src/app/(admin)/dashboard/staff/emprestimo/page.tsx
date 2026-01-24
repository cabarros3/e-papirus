"use client";
import { ArrowLeft, Calendar, Loader2, User, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import emprestimoService from "@/services/emprestimo-service";
import {
  ExemplaresService,
  LivroComExemplares,
} from "@/services/exemplar-service";
import { pessoaService } from "@/services/pessoa-service";
import { BookService } from "@/services/book-service";
import { ResumoEmprestimoModal } from "@/components/modals/resumo-emprestimo-modal";
// Import do novo modal

export default function Emprestimo() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idExemplar, setIdExemplar] = useState("");
  const [idPessoa, setIdPessoa] = useState("");
  const [dataEmprestimo, setDataEmprestimo] = useState("");
  const [dataPrevista, setDataPrevista] = useState("");

  const [livrosComExemplares, setLivrosComExemplares] = useState<
    LivroComExemplares[]
  >([]);
  const [livroSelecionado, setLivroSelecionado] = useState("");
  const [livroDetalhes, setLivroDetalhes] = useState<any>(null);
  const [estudantes, setEstudantes] = useState<any[]>([]);
  const [exemplaresDisponiveis, setExemplaresDisponiveis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dadosResumo, setDadosResumo] = useState<any>(null);

  const bookService = new BookService();

  useEffect(() => {
    const dataHoje = new Date().toISOString().split("T")[0];
    setDataEmprestimo(dataHoje);
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [listaPessoas, livrosData] = await Promise.all([
          pessoaService.listar(),
          ExemplaresService.getLivrosComExemplares(),
        ]);
        setEstudantes(listaPessoas || []);
        setLivrosComExemplares(livrosData || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  useEffect(() => {
    if (livroSelecionado) {
      const livro = livrosComExemplares.find(
        (l) => l.id_livro === parseInt(livroSelecionado),
      );
      if (livro) {
        const disponiveis = livro.exemplares.filter(
          (ex) => ex.disponibilidade === "disponivel",
        );
        setExemplaresDisponiveis(disponiveis);
        setIdExemplar("");
        const buscarDetalhes = async () => {
          const livros = await bookService.getAllBooks();
          const detalhes = livros.find(
            (b) => b.id_livro === parseInt(livroSelecionado),
          );
          if (detalhes) setLivroDetalhes(detalhes);
        };
        buscarDetalhes();
      }
    } else {
      setExemplaresDisponiveis([]);
      setLivroDetalhes(null);
    }
  }, [livroSelecionado, livrosComExemplares]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dados = {
        id_exemplar: parseInt(idExemplar),
        id_pessoa: parseInt(idPessoa),
        data_emprestimo: dataEmprestimo,
        data_prevista: dataPrevista,
      };

      const res = await emprestimoService.create(dados);

      if (res) {
        const estudante = estudantes.find(
          (e) => e.id_pessoa === parseInt(idPessoa),
        );
        const exemplar = exemplaresDisponiveis.find(
          (ex) => ex.id_exemplar === parseInt(idExemplar),
        );

        setDadosResumo({
          livro: livroDetalhes.titulo,
          estudante: estudante?.nome,
          exemplar: exemplar?.numero_exemplar,
          devolucao: dataPrevista,
        });

        setIsModalOpen(true);
      }
    } catch (error: any) {
      alert("Erro ao realizar empréstimo: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Componente Modal Invocado Aqui */}
      <ResumoEmprestimoModal
        isOpen={isModalOpen}
        dados={dadosResumo}
        onConfirm={() => router.push("/dashboard/staff/")}
      />

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/staff/"
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Empréstimo de Livro
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Realize o empréstimo de um exemplar para um usuário.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Informações do Livro */}
          {livroDetalhes ? (
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="relative w-40 h-56">
                <Image
                  src={
                    livroDetalhes.capa ||
                    "https://via.placeholder.com/160x224?text=Sem+Capa"
                  }
                  alt={livroDetalhes.titulo}
                  fill
                  className="object-cover rounded-xl shadow-md"
                  sizes="160px"
                  priority
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {livroDetalhes.titulo}
                </h2>
                <p className="text-sm text-gray-700">
                  Editora: {livroDetalhes.editora || "N/A"}
                </p>
                <p className="text-sm text-gray-700">
                  Ano: {livroDetalhes.ano_publicacao || "N/A"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-300">
              <BookOpen size={64} className="mb-4" />
              <p className="text-gray-500 font-medium">
                Selecione um livro para ver os detalhes
              </p>
            </div>
          )}

          {/* Formulário */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} /> Selecionar Livro
              </h2>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Livro</label>
                <select
                  value={livroSelecionado}
                  onChange={(e) => setLivroSelecionado(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none bg-white"
                >
                  <option value="">Nenhum Livro</option>
                  {livrosComExemplares.map((livro) => (
                    <option key={livro.id_livro} value={livro.id_livro}>
                      {livro.titulo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Selecionar Estudante
              </h2>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">
                  Estudante
                </label>
                <select
                  value={idPessoa}
                  onChange={(e) => setIdPessoa(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none bg-white"
                >
                  <option value="">Selecione...</option>
                  {estudantes.map((e) => (
                    <option key={e.id_pessoa} value={e.id_pessoa}>
                      {e.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-gray-50">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} /> Selecionar Exemplar
              </h2>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">
                  Exemplar
                </label>
                <select
                  value={idExemplar}
                  onChange={(e) => setIdExemplar(e.target.value)}
                  disabled={!livroSelecionado}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none bg-white disabled:bg-gray-50"
                >
                  <option value="">Selecione...</option>
                  {exemplaresDisponiveis.map((ex) => (
                    <option key={ex.id_exemplar} value={ex.id_exemplar}>
                      #{ex.numero_exemplar} - {ex.localizacao}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-gray-50">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Datas do Empréstimo
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">
                    Data do Empréstimo
                  </label>
                  <input
                    type="date"
                    value={dataEmprestimo}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">
                    Data prevista para devolução
                  </label>
                  <input
                    type="date"
                    value={dataPrevista}
                    onChange={(e) => setDataPrevista(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-denin text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-xl shadow-denin/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>Realizar Empréstimo</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
