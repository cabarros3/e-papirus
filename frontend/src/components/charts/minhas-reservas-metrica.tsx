'use client';

import { Book, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReservationCardProps {
  reserva: any;
  index: number;
}

export const ReservationCardFeatured = ({
  reserva,
  index,
}: ReservationCardProps) => {
  // Cálculo de prazos
  const dataExpiracao = new Date(reserva.data_expiracao);
  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);
  dataExpiracao.setHours(0, 0, 0, 0);

  const expiraHoje = dataExpiracao.getTime() === hoje.getTime();
  const isExpirado = dataExpiracao.getTime() < hoje.getTime();

  // Definição visual baseada no prazo
  let corBase = 'emerald'; // Verde para reservas normais
  let textoStatus = 'Disponível para Retirada';

  if (isExpirado) {
    corBase = 'red';
    textoStatus = 'Prazo Expirado';
  } else if (expiraHoje) {
    corBase = 'orange';
    textoStatus = 'Último dia para buscar';
  }

  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      dot: 'bg-emerald-500',
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-100',
      dot: 'bg-orange-500',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-100',
      dot: 'bg-red-500',
    },
  }[corBase as 'emerald' | 'orange' | 'red'];

  return (
    <div
      style={{ animationDelay: `${700 + index * 100}ms` }}
      className="group flex w-full bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
    >
      {/* Thumbnail/Icon Placeholder */}
      <div className="w-24 md:w-32 bg-slate-50 shrink-0 flex items-center justify-center relative border-r border-gray-50 overflow-hidden">
        <div className={`absolute inset-0 opacity-10 ${colorClasses.bg}`} />
        <Book
          size={32}
          className={`relative z-10 ${colorClasses.text} opacity-40 group-hover:scale-110 transition-transform duration-500`}
        />
      </div>

      <div className="p-5 flex flex-col justify-center flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${colorClasses.dot}`}
          />
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            Reserva Ativa
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 leading-tight truncate group-hover:text-denin transition-colors">
          {reserva.titulo || 'Título do Livro'}
        </h3>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <Clock size={14} className={colorClasses.text} />
            <span>
              Limite:{' '}
              <span className="text-gray-900 font-bold">
                {format(new Date(reserva.data_expiracao), "dd 'de' MMM", {
                  locale: ptBR,
                })}
              </span>
            </span>
          </div>

          <span
            className={`w-fit whitespace-nowrap text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-tighter border ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}
          >
            {textoStatus}
          </span>
        </div>
      </div>
    </div>
  );
};
