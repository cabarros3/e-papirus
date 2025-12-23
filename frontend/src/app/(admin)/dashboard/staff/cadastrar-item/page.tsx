"use client";

import { useEffect, useState, useMemo } from "react";
import { BookService } from "@/services/book-service";
import { AuthorService } from "@/services/author-service";
import { SubjectService } from "@/services/subject-service";
import { CadastroLivroDTO } from "@/types/livros";
import { Autor } from "@/types/autores";
import { Assunto } from "@/types/assuntos";
import { toast } from "sonner";
import {
  // BookPlus,
  Save,
  Image as ImageIcon,
  FileText,
  Calendar,
  Building,
  User,
  Tag,
  // MapPin,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function CadastrarItem() {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [assuntos, setAssuntos] = useState<Assunto[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bookService = useMemo(() => new BookService(), []);
  const authorService = useMemo(() => new AuthorService(), []);
  const subjectService = useMemo(() => new SubjectService(), []);

  // Carrega os dados para os Selects
  useEffect(() => {
    const loadSelects = async () => {
      try {
        const [resA, resS] = await Promise.all([
          authorService.getAllAuthors(),
          subjectService.getAllSubjects(),
        ]);
        setAutores(resA);
        setAssuntos(resS);
      } catch (err) {
        toast.error("Erro ao carregar listas auxiliares.");
      } finally {
        setLoadingData(false);
      }
    };
    loadSelects();
  }, [authorService, subjectService]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      // Montando o payload exatamente como o CadastroLivroDTO espera
      const payload: CadastroLivroDTO = {
        titulo: String(formData.get("titulo")),
        id_assunto: Number(formData.get("id_assunto")),
        editora: String(formData.get("editora")),
        ano_publicacao: Number(formData.get("ano_publicacao")),
        // Transformando o ID selecionado em um array de números [ID]
        autores: [Number(formData.get("id_autor"))],
        cidade_publicacao: String(formData.get("cidade_publicacao")),
        nota_resumo: String(formData.get("nota_resumo")),
        descricao_fisica: String(formData.get("descricao_fisica")),
        capa: String(formData.get("capa")),
      };

      // Chama o seu service que aponta para livros/create.php
      await bookService.createBook(payload);

      toast.success("Livro cadastrado com sucesso!");

      // Limpa o formulário após o sucesso
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Erro ao realizar o cadastro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/staff/acervo"
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Cadastrar Novo Item
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Adicione uma nova obra bibliográfica ao sistema.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm space-y-8"
      >
        {/* Seção 1: Identificação */}
        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} /> Identificação da Obra
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">
                Título do Livro
              </label>
              <input
                name="titulo"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
                placeholder="Ex: O Senhor dos Anéis"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <User size={14} /> Autor Principal
                </label>
                <select
                  name="id_autor"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white"
                >
                  <option value="">Selecione um autor...</option>
                  {autores.map((a) => (
                    <option key={a.id_autor} value={a.id_autor}>
                      {a.nome_autor}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <Tag size={14} /> Assunto / Categoria
                </label>
                <select
                  name="id_assunto"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white"
                >
                  <option value="">Selecione um assunto...</option>
                  {assuntos.map((s) => (
                    <option key={s.id_assunto} value={s.id_assunto}>
                      {s.nome_assunto}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2: Publicação */}
        <div className="space-y-6 pt-6 border-t border-gray-50">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Building size={14} /> Dados de Publicação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Editora</label>
              <input
                name="editora"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                placeholder="Ex: HarperCollins"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Cidade</label>
              <input
                name="cidade_publicacao"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                placeholder="Ex: Londres"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                <Calendar size={14} /> Ano
              </label>
              <input
                name="ano_publicacao"
                type="number"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                placeholder="1954"
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Detalhes e Mídia */}
        <div className="space-y-6 pt-6 border-t border-gray-50">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon size={14} /> Mídia e Descrição
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">
                URL da Imagem da Capa
              </label>
              <input
                name="capa"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none font-mono text-xs"
                placeholder="https://exemplo.com/capa.jpg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">
                Resumo da Obra
              </label>
              <textarea
                name="nota_resumo"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none"
                placeholder="Uma breve sinopse do livro..."
              ></textarea>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <button
            type="submit"
            disabled={isSubmitting || loadingData}
            className="w-full bg-denin text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-xl shadow-denin/20 disabled:opacity-50 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Save size={20} /> Finalizar Cadastro
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
