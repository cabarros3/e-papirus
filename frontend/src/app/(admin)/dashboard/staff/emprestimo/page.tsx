'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Serviços e Tipos
import emprestimoService from '@/services/emprestimo-service';
import {
  ExemplaresService,
  LivroComExemplares,
} from '@/services/exemplar-service';
import { pessoaService } from '@/services/pessoa-service';
import { Pessoa } from '@/types/pessoas';
import { Livro } from '@/types/livros';

// Componentes refatorados
import { ResumoEmprestimoModal } from '@/components/modals/resumo-emprestimo-modal';
import { BasketItem, BookBasket } from '@/components/cards/BookBasket';
import { UserSearchInput } from '@/components/inputs/UserSearchInput';
import { BookSelectionForm } from '@/components/forms/BookSelectionForm';

export default function EmprestimoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [estudantes, setEstudantes] = useState<Pessoa[]>([]);
  const [livrosComExemplares, setLivrosComExemplares] = useState<
    LivroComExemplares[]
  >([]);
  const [usuario, setUsuario] = useState({ id: '', nome: '' });
  const [cesta, setCesta] = useState<BasketItem[]>([]);
  const [datas, setDatas] = useState({
    emprestimo: new Date().toISOString().split('T')[0],
    prevista: '',
  });
  const [livroVisualizado, setLivroVisualizado] = useState<Livro | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dadosResumo, setDadosResumo] = useState<any>(null);

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const [listaPessoas, livrosData] = await Promise.all([
          pessoaService.listar(),
          ExemplaresService.getLivrosComExemplares(),
        ]);
        setEstudantes(listaPessoas || []);
        setLivrosComExemplares(livrosData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    carregarDadosIniciais();
  }, []);

  const handleAdicionarNaCesta = (exemplar: any, detalhesLivro: Livro) => {
    if (cesta.length >= 3) return alert('Limite de 3 livros.');
    if (cesta.some((item) => item.id_exemplar === exemplar.id_exemplar))
      return alert('Já está na cesta.');

    setCesta([
      ...cesta,
      {
        id_exemplar: exemplar.id_exemplar,
        numero_exemplar: exemplar.numero_exemplar,
        titulo: detalhesLivro.titulo,
      },
    ]);
  };

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.id || cesta.length === 0 || !datas.prevista)
      return alert('Dados incompletos.');

    setIsSubmitting(true);
    try {
      await Promise.all(
        cesta.map((item) =>
          emprestimoService.create({
            id_exemplar: item.id_exemplar,
            id_pessoa: parseInt(usuario.id),
            data_emprestimo: datas.emprestimo,
            data_prevista: datas.prevista,
          })
        )
      );

      setDadosResumo({
        livro: cesta.map((i) => i.titulo).join(', '),
        estudante: usuario.nome,
        exemplar: cesta.map((i) => i.numero_exemplar).join(', '),
        devolucao: datas.prevista,
      });
      setIsModalOpen(true);
    } catch (error: any) {
      alert(error.message);
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
    /* AJUSTE: Aplicado w-full px-8 para consistência de 32px lateral */
    <div className="w-full px-8 space-y-8 animate-in fade-in duration-500 pb-10">
      <ResumoEmprestimoModal
        isOpen={isModalOpen}
        dados={dadosResumo}
        onConfirm={() => router.push('/dashboard/staff/')}
      />

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/staff/"
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold uppercase text-gray-900">
          Empréstimo de itens
        </h1>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
        <form
          onSubmit={handleFinalizar}
          className="flex flex-col justify-center space-y-6"
        >
          <UserSearchInput
            usuarios={estudantes}
            selecionadoId={usuario.id}
            selecionadoNome={usuario.nome}
            onSelect={(u) =>
              setUsuario({ id: String(u.id_pessoa), nome: u.nome })
            }
          />
          <BookSelectionForm
            livrosComExemplares={livrosComExemplares}
            onAdicionar={handleAdicionarNaCesta}
            podeAdicionar={cesta.length < 3}
            datas={datas}
            onDatasChange={setDatas}
            onLivroVisualizado={setLivroVisualizado}
          />
          <button
            type="submit"
            disabled={isSubmitting || cesta.length === 0 || !usuario.id}
            className="w-full bg-denin text-white py-5 rounded-3xl font-bold shadow-xl disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              `Finalizar (${cesta.length})`
            )}
          </button>
        </form>

        <BookBasket
          itens={cesta}
          onRemove={(id) => setCesta(cesta.filter((i) => i.id_exemplar !== id))}
          livroDetalhes={livroVisualizado}
        />
      </div>
    </div>
  );
}
