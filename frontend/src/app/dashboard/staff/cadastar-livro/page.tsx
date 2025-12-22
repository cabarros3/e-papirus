"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookService } from "@/services/book-service";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function CadastrarLivroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    id_assunto: "",
    editora: "",
    ano_publicacao: new Date().getFullYear(),
    cidade_publicacao: "",
    capa: "",
    nota_resumo: "",
    descricao_fisica: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const service = new BookService();
      // O seu createBook espera um CadastroLivroDTO.
      // Certifique-se de converter o id_assunto para number se necessário.
      await service.createBook({
        ...formData,
        id_assunto: Number(formData.id_assunto),
      } as any);

      alert("Livro cadastrado com sucesso!");
      router.push("/dashboard/admin");
    } catch (error: any) {
      alert("Erro ao cadastrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/staff"
            className="text-denin flex items-center gap-2 text-sm font-bold mb-2 hover:underline"
          >
            <ArrowLeft size={16} /> Voltar ao painel
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Novo Livro</h1>
          <p className="text-gray-500">
            Preencha as informações para adicionar ao acervo.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm"
      >
        {/* Título */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-gray-700">
            Título do Livro *
          </label>
          <input
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none transition-all"
            value={formData.titulo}
            onChange={(e) =>
              setFormData({ ...formData, titulo: e.target.value })
            }
            placeholder="Ex: Clean Code"
          />
        </div>

        {/* Editora */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Editora</label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
            value={formData.editora}
            onChange={(e) =>
              setFormData({ ...formData, editora: e.target.value })
            }
          />
        </div>

        {/* ID Assunto (Select ou Input) */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">
            ID Assunto (Categoria) *
          </label>
          <input
            required
            type="number"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
            value={formData.id_assunto}
            onChange={(e) =>
              setFormData({ ...formData, id_assunto: e.target.value })
            }
          />
        </div>

        {/* Ano e Cidade */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">
            Ano de Publicação
          </label>
          <input
            type="number"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
            value={formData.ano_publicacao}
            onChange={(e) =>
              setFormData({
                ...formData,
                ano_publicacao: Number(e.target.value),
              })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">
            Cidade de Publicação
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
            value={formData.cidade_publicacao}
            onChange={(e) =>
              setFormData({ ...formData, cidade_publicacao: e.target.value })
            }
          />
        </div>

        {/* URL da Capa */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <ImageIcon size={16} /> URL da Imagem da Capa
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
            value={formData.capa}
            onChange={(e) => setFormData({ ...formData, capa: e.target.value })}
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </div>

        {/* Resumo */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-gray-700">Nota/Resumo</label>
          <textarea
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none resize-none"
            value={formData.nota_resumo}
            onChange={(e) =>
              setFormData({ ...formData, nota_resumo: e.target.value })
            }
          />
        </div>

        {/* Botões */}
        <div className="md:col-span-2 pt-4 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-denin text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              "Cadastrando..."
            ) : (
              <>
                <Save size={20} /> Salvar Livro
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
