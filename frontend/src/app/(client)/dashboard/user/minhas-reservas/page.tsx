'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  Calendar,
  Clock,
  Book as BookIcon,
  AlertCircle,
  Trash2,
  //   CheckCircle2,
  //   XCircle,
} from 'lucide-react';
import { reservaService } from '@/services/reserva-service';
import { Reserva } from '@/types/reservas';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MinhasReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState<number | null>(null);

  const carregarReservas = async () => {
    try {
      const response = await reservaService.listarTodas();
      if (response.status === 'sucesso') {
        setReservas(response.dados || []);
      }
    } catch (error) {
      toast.error('Não foi possível carregar suas reservas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarReservas();
  }, []);

  const handleCancelar = async (id: number) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;

    setIsCancelling(id);
    try {
      const res = await reservaService.cancelar(id);
      if (res.status === 'sucesso') {
        toast.success('Reserva cancelada com sucesso.');
        setReservas((prev) => prev.filter((r) => r.id_reserva !== id));
      } else {
        toast.error(res.mensagem);
      }
    } catch (error) {
      toast.error('Erro ao cancelar reserva.');
    } finally {
      setIsCancelling(null);
    }
  };

  const getStatusBadge = (status: Reserva['status']) => {
    const styles = {
      ativa: 'bg-blue-50 text-blue-600 border-blue-100',
      concluida: 'bg-green-50 text-green-600 border-green-100',
      cancelada: 'bg-red-50 text-red-600 border-red-100',
    };

    const labels = {
      ativa: 'Aguardando Retirada',
      concluida: 'Retirado',
      cancelada: 'Cancelada',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-denin" size={40} />
        <p className="text-gray-500 text-sm font-medium">
          Carregando suas solicitações...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minhas Reservas</h1>
        <p className="text-sm text-gray-500">
          Acompanhe o status dos seus pedidos e prazos de retirada.
        </p>
      </div>

      {reservas.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 border border-dashed border-gray-200 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <BookIcon size={32} />
          </div>
          <div className="max-w-xs">
            <h3 className="font-bold text-gray-800">
              Nenhuma reserva encontrada
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Você ainda não solicitou nenhum livro. Explore o acervo para
              começar!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reservas.map((reserva) => (
            <div
              key={reserva.id_reserva}
              className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-denin/5 rounded-xl flex items-center justify-center text-denin shrink-0">
                  <BookIcon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">
                    {reserva.titulo || 'Título não carregado'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={14} />
                      Reservado em:{' '}
                      {format(new Date(reserva.data_reserva), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium">
                      <Clock size={14} />
                      Expira em:{' '}
                      {format(new Date(reserva.data_expiracao), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                {getStatusBadge(reserva.status)}

                {reserva.status === 'ativa' && (
                  <button
                    onClick={() => handleCancelar(reserva.id_reserva)}
                    disabled={isCancelling === reserva.id_reserva}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Cancelar Reserva"
                  >
                    {isCancelling === reserva.id_reserva ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-denin/5 p-6 rounded-2xl flex gap-4 items-start">
        <AlertCircle className="text-denin shrink-0" size={20} />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-denin">
            Informações Importantes
          </h4>
          <ul className="text-xs text-denin/80 space-y-1 list-disc ml-4">
            <li>
              As reservas são válidas por 3 dias úteis (Alunos) ou 7 dias úteis
              (Professores).
            </li>
            <li>
              Caso o livro não seja retirado no balcão até a data de expiração,
              a reserva será cancelada automaticamente.
            </li>
            <li>Você pode ter no máximo 2 reservas ativas simultaneamente.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
