"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { BookService, UpdateLivroDTO } from "@/services/book-service";
import { AuthorService } from "@/services/author-service";
import { SubjectService } from "@/services/subject-service";
import { Livro } from "@/types/livros";
import { Autor } from "@/types/autores";
import { Assunto } from "@/types/assuntos";
import { toast } from "sonner";
import { Search, Edit3, X, Save, Loader2, Book, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ConsultarAcervo() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [assuntos, setAssuntos] = useState<Assunto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);

  const bookService = useMemo(() => new BookService(), []);
  const authorService = useMemo(() => new AuthorService(), []);
  const subjectService = useMemo(() => new SubjectService(), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resLivros, resAutores, resAssuntos] = await Promise.all([
        bookService.getAllBooks(),
        authorService.getAllAuthors(),
        subjectService.getAllSubjects(),
      ]);
      setLivros(resLivros);
      setAutores(resAutores);
      setAssuntos(resAssuntos);
    } catch (err) {
      toast.error("Erro ao carregar acervo.");
    } finally {
      setLoading(false);
    }
  }, [bookService, authorService, subjectService]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!livroSelecionado) return;
    const formData = new FormData(e.currentTarget);

    try {
      const payload: UpdateLivroDTO = {
        id_livro: livroSelecionado.id_livro,
        titulo: String(formData.get("titulo")),
        id_assunto: Number(formData.get("id_assunto")),
        editora: String(formData.get("editora")),
        ano_publicacao: Number(formData.get("ano_publicacao")),
        cidade_publicacao: String(formData.get("cidade_publicacao")),
        nota_resumo: String(formData.get("nota_resumo")),
        descricao_fisica: String(formData.get("descricao_fisica")),
        // Enviando como array de um único ID para satisfazer o payload da API
        autores: [Number(formData.get("id_autor"))],
        capa: String(formData.get("capa")),
      };

      await bookService.updateBook(payload);
      toast.success("Dados atualizados!");
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Erro ao atualizar.");
    }
  };

  const filteredLivros = useMemo(() => {
    return livros.filter(
      (l) =>
        l.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.nomes_autores.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [livros, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/staff"
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
            Consulta ao Acervo
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Gerencie os títulos cadastrados no e-Papirus.
          </p>
        </div>
      </div>

      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-denin transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="Buscar por título ou autor..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-denin/10 focus:border-denin outline-none shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-400">
            <tr>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest">
                Obra
              </th>
              <th className="p-5 text-[10px] font-black uppercase tracking-widest text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={2} className="p-20 text-center">
                  <Loader2
                    className="animate-spin mx-auto text-denin"
                    size={32}
                  />
                </td>
              </tr>
            ) : (
              filteredLivros.map((livro) => (
                <tr
                  key={livro.id_livro}
                  className="hover:bg-gray-50/50 group transition-colors"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      {livro.capa ? (
                        <Image
                          src={livro.capa}
                          alt=""
                          className="w-10 h-14 object-cover rounded shadow-sm border border-gray-100"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center text-gray-300">
                          <Book size={18} />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-800 text-sm uppercase leading-tight">
                          {livro.titulo}
                        </div>
                        <div className="text-[10px] text-gray-400 font-semibold">
                          {livro.nomes_autores}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setLivroSelecionado(livro);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 text-denin hover:bg-denin/10 rounded-xl transition-all font-bold text-xs flex items-center gap-2"
                    >
                      <Edit3 size={18} /> EDITAR
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL EDITAR - SIMPLES E COMPATÍVEL COM O PAYLOAD */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tighter">
                Editar Livro
              </h2>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleUpdate}
              className="p-8 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Título da Obra
                </label>
                <input
                  name="titulo"
                  defaultValue={livroSelecionado?.titulo}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-denin font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Autor Principal
                  </label>
                  <select
                    key={`aut-${livroSelecionado?.id_livro}`}
                    name="id_autor"
                    defaultValue={
                      autores.find((a) =>
                        livroSelecionado?.nomes_autores.includes(a.nome_autor)
                      )?.id_autor
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white font-medium"
                  >
                    <option value="">Selecione...</option>
                    {autores.map((a) => (
                      <option key={a.id_autor} value={a.id_autor}>
                        {a.nome_autor}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Assunto
                  </label>
                  <select
                    key={`ass-${livroSelecionado?.id_livro}`}
                    name="id_assunto"
                    defaultValue={
                      assuntos.find(
                        (s) => s.nome_assunto === livroSelecionado?.nome_assunto
                      )?.id_assunto
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white font-medium"
                  >
                    <option value="">Selecione...</option>
                    {assuntos.map((s) => (
                      <option key={s.id_assunto} value={s.id_assunto}>
                        {s.nome_assunto}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Editora
                  </label>
                  <input
                    name="editora"
                    defaultValue={livroSelecionado?.editora}
                    className="w-full px-4 py-3 rounded-xl border outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Ano
                  </label>
                  <input
                    name="ano_publicacao"
                    type="number"
                    defaultValue={livroSelecionado?.ano_publicacao}
                    className="w-full px-4 py-3 rounded-xl border outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Cidade
                  </label>
                  <input
                    name="cidade_publicacao"
                    defaultValue={livroSelecionado?.cidade_publicacao}
                    className="w-full px-4 py-3 rounded-xl border outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Descr. Física
                  </label>
                  <input
                    name="descricao_fisica"
                    defaultValue={livroSelecionado?.descricao_fisica}
                    className="w-full px-4 py-3 rounded-xl border outline-none"
                    placeholder="Ex: 250 p."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  URL da Capa
                </label>
                <input
                  name="capa"
                  defaultValue={livroSelecionado?.capa}
                  className="w-full px-4 py-3 rounded-xl border outline-none text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Resumo
                </label>
                <textarea
                  name="nota_resumo"
                  defaultValue={livroSelecionado?.nota_resumo}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border outline-none resize-none font-medium text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-denin text-white py-4 rounded-2xl font-bold shadow-lg shadow-denin/20 mt-4"
              >
                <Save size={18} className="inline mr-2" /> Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
