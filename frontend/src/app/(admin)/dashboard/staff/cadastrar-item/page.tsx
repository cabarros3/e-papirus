'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { BookService } from '@/services/book-service';
import { AuthorService } from '@/services/author-service';
import { SubjectService } from '@/services/subject-service';
import { CadastroLivroDTO } from '@/types/livros';
import { Autor } from '@/types/autores';
import { Assunto } from '@/types/assuntos';
import { toast } from 'sonner';
import {
  Save,
  Image as ImageIcon,
  FileText,
  Calendar,
  Building,
  User,
  Tag,
  Loader2,
  ArrowLeft,
  Search,
  BookOpen,
  NotebookPen,
  Building2,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

export default function CadastrarItem() {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [assuntos, setAssuntos] = useState<Assunto[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para Busca/Auto-complete
  const [buscaAutor, setBuscaAutor] = useState('');
  const [autorSelecionado, setAutorSelecionado] = useState<Autor | null>(null);
  const [buscaAssunto, setBuscaAssunto] = useState('');
  const [assuntoSelecionado, setAssuntoSelecionado] = useState<Assunto | null>(
    null
  );

  const bookService = useMemo(() => new BookService(), []);
  const authorService = useMemo(() => new AuthorService(), []);
  const subjectService = useMemo(() => new SubjectService(), []);

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
        toast.error('Erro ao carregar listas auxiliares.');
      } finally {
        setLoadingData(false);
      }
    };
    loadSelects();
  }, [authorService, subjectService]);

  // Filtragem para Auto-complete
  const autoresFiltrados = autores.filter(
    (a) =>
      a.nome_autor.toLowerCase().includes(buscaAutor.toLowerCase()) &&
      buscaAutor !== '' &&
      !autorSelecionado
  );

  const assuntosFiltrados = assuntos.filter(
    (s) =>
      s.nome_assunto.toLowerCase().includes(buscaAssunto.toLowerCase()) &&
      buscaAssunto !== '' &&
      !assuntoSelecionado
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!autorSelecionado || !assuntoSelecionado) {
      toast.error('Por favor, selecione um autor e um assunto da lista.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const payload: CadastroLivroDTO = {
        titulo: String(formData.get('titulo')),
        id_assunto: assuntoSelecionado.id_assunto,
        editora: String(formData.get('editora')),
        ano_publicacao: Number(formData.get('ano_publicacao')),
        autores: [autorSelecionado.id_autor],
        cidade_publicacao: String(formData.get('cidade_publicacao')),
        nota_resumo: String(formData.get('nota_resumo')),
        descricao_fisica: String(formData.get('descricao_fisica')), // Novo campo
        capa: String(formData.get('capa')),
      };

      await bookService.createBook(payload);
      toast.success('Livro cadastrado com sucesso!');

      // Reset total
      (e.target as HTMLFormElement).reset();
      setAutorSelecionado(null);
      setAssuntoSelecionado(null);
      setBuscaAutor('');
      setBuscaAssunto('');
    } catch (err) {
      toast.error('Erro ao realizar o cadastro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-8 space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/staff/"
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
        className="bg-white p-10 rounded-[2.5rem] border border-gray-200 shadow-sm space-y-10"
      >
        {/* Seção 1: Identificação e Busca Dinâmica */}
        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} /> Identificação da Obra
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-bold text-gray-600">
                Título do Livro
              </label>
              <input
                name="titulo"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
                placeholder="Ex: O Pequeno Príncipe"
              />
            </div>

            {/* Auto-complete Autor */}
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                <User size={14} /> Autor Principal
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  value={
                    autorSelecionado ? autorSelecionado.nome_autor : buscaAutor
                  }
                  onChange={(e) => setBuscaAutor(e.target.value)}
                  onFocus={() => setAutorSelecionado(null)}
                  placeholder="Buscar autor..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
                />
              </div>
              {autoresFiltrados.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-100 rounded-xl mt-1 shadow-xl max-h-48 overflow-y-auto">
                  {autoresFiltrados.map((a) => (
                    <div
                      key={a.id_autor}
                      onClick={() => {
                        setAutorSelecionado(a);
                        setBuscaAutor(a.nome_autor);
                      }}
                      className="p-3 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0"
                    >
                      {a.nome_autor}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-complete Assunto */}
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                <Tag size={14} /> Assunto / Categoria
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  value={
                    assuntoSelecionado
                      ? assuntoSelecionado.nome_assunto
                      : buscaAssunto
                  }
                  onChange={(e) => setBuscaAssunto(e.target.value)}
                  onFocus={() => setAssuntoSelecionado(null)}
                  placeholder="Buscar assunto..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
                />
              </div>
              {assuntosFiltrados.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-100 rounded-xl mt-1 shadow-xl max-h-48 overflow-y-auto">
                  {assuntosFiltrados.map((s) => (
                    <div
                      key={s.id_assunto}
                      onClick={() => {
                        setAssuntoSelecionado(s);
                        setBuscaAssunto(s.nome_assunto);
                      }}
                      className="p-3 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0"
                    >
                      {s.nome_assunto}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção 2: Publicação e Descrição Física */}
        <div className="space-y-6 pt-6 border-t border-gray-50">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Building size={14} /> Dados Técnicos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 flex flex-row gap-2">
                <Building2 size={14} />
                Editora
              </label>
              <input
                name="editora"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                placeholder="Ex: Companhia das Letras"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 flex flex-row gap-2">
                <MapPin size={14} />
                Cidade
              </label>
              <input
                name="cidade_publicacao"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                placeholder="Ex: São Paulo"
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
                placeholder="2024"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                <NotebookPen size={14} /> Descrição Física
              </label>
              <input
                name="descricao_fisica"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                placeholder="Ex: 256p. 21cm."
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Mídia */}
        <div className="space-y-6 pt-6 border-t border-gray-50">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon size={14} /> Mídia e Resumo
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">
                URL da Capa
              </label>
              <input
                name="capa"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none"
                placeholder="https://link-da-imagem.com/capa.jpg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">
                Resumo / Sinopse
              </label>
              <textarea
                name="nota_resumo"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none"
                placeholder="Descreva brevemente a obra..."
              ></textarea>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || loadingData}
            className="w-full max-w-xs bg-denin text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-xl shadow-denin/20 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Save size={20} /> Salvar Obra
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
