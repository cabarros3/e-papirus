'use client';

import { MetricCard } from '@/components/charts/metric-card';
import { BookCardFeatured } from '@/components/charts/meus-emprestimos';
import { ReservationCardFeatured } from '@/components/charts/minhas-reservas-metrica';
import NotificationSliderUser from '@/components/sliders/avisos-user';
import { ErrorState } from '@/components/states/error';
import { LoadingState } from '@/components/states/loading';
import { Link } from 'next/link';
import {
  AlunoDashboardData,
  AlunoDashboardService,
} from '@/services/aluno-dashboard-service';
import { reservaService } from '@/services/reserva-service';
import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AlunoDashboard() {
  const [dados, setDados] = useState<AlunoDashboardData | null>(null);
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userString = sessionStorage.getItem('bib_user');
        if (!userString) return setErro('Sessão não encontrada.');

        const user = JSON.parse(userString);
        const service = new AlunoDashboardService();

        const [statsData, reservasData] = await Promise.all([
          service.getStats(user?.id_pessoa),
          reservaService.listarTodas(),
        ]);

        setDados(statsData);

        if (reservasData.status === 'sucesso') {
          setReservas(
            reservasData.dados.filter((r: any) => r.status === 'ativa')
          );
        }
      } catch (e) {
        setErro('Ocorreu um erro ao processar os dados do painel.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingState />;
  if (erro || !dados)
    return <ErrorState message={erro || 'Erro desconhecido'} />;

  return (
    <div className="w-full px-8 py-10 flex flex-col gap-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto overflow-hidden">
      <header className="space-y-2 animate-in slide-in-from-left-8 fade-in duration-700 ease-out">
        <h1 className="text-4xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">
          Meu Painel de Leitor
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium transition-colors">
          Confira suas leituras, reservas e prazos.
        </p>
      </header>

      <NotificationSliderUser />

      {/* SEÇÃO 1: EMPRÉSTIMOS ATUAIS */}
      <section className="space-y-8 mt-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-6 transition-colors">
          <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Meus Empréstimos Atuais
          </h2>
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800 transition-colors">
            {dados.meus_livros.length} LIVRO(S)
          </span>
        </div>

        {dados.meus_livros.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {dados.meus_livros.map((livro, index) => (
              <BookCardFeatured
                key={livro.id_emprestimo}
                livro={livro}
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState message="Nenhum livro emprestado no momento." />
        )}
      </section>

      {/* SEÇÃO 2: RESERVAS (Só aparece se houver) */}
      {reservas.length > 0 && (
        <section className="space-y-8 mt-8 animate-in fade-in duration-1000">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-6 transition-colors">
            <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Aguardando Retirada
            </h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {reservas.map((reserva, index) => (
              <ReservationCardFeatured
                key={reserva.id_reserva}
                reserva={reserva}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="bg-gray-50/50 dark:bg-slate-900/50 p-12 rounded-[32px] border-2 border-dashed border-gray-100 dark:border-slate-800 text-center transition-colors">
    <p className="text-gray-400 dark:text-gray-500 font-bold text-sm uppercase tracking-widest">
      {message}
    </p>
  </div>
);
