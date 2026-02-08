'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  Calendar,
  Clock,
  Book as BookIcon,
  AlertCircle,
  Trash2,
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
      // Ajustado para listar apenas as reservas do usuário logado
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
        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border tracking-widest ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-denin" size={40} />
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
          Sincronizando suas reservas...
        </p>
      </div>
    );
  }

  return (
    /* Ajustes: px-8 e py-10 para o espaçamento de topo e laterais de 32px+ */
    <div className="w-full px-8 py-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Minhas Reservas
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Acompanhe o status dos seus pedidos e prazos de retirada.
        </p>
      </div>

      {/* BOX DE INFORMAÇÕES PADRONIZADO */}
      <div className="bg-denin/5 p-6 rounded-[2.5rem] border border-denin/10 flex gap-6 items-start">
        <div className="bg-denin/10 p-3 rounded-lg">
          <AlertCircle className="text-denin shrink-0" size={24} />
        </div>
        <div className="space-y-3">
          <h4 className="text-xs font-black text-denin uppercase tracking-widest">
            Informações Importantes
          </h4>
          <ul className="text-xs text-denin/70 font-medium space-y-2 list-disc ml-4 leading-relaxed">
            <li>
              As reservas são válidas por{' '}
              <span className="font-bold">3 dias úteis (Alunos)</span> ou{' '}
              <span className="font-bold">7 dias úteis (Professores)</span>.
            </li>
            <li>
              Caso o livro não seja retirado no balcão até a data de expiração,
              a reserva será cancelada automaticamente.
            </li>
            {/* <li>
              Você pode ter no máximo{' '}
              <span className="font-bold">2 reservas ativas</span>{' '}
              simultaneamente.
            </li> */}
          </ul>
        </div>
      </div>

      {reservas.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 border-2 border-dashed border-gray-100 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
            <BookIcon size={40} />
          </div>
          <div className="max-w-xs">
            <h3 className="font-bold text-gray-900 text-lg">
              Nenhuma reserva encontrada
            </h3>
            <p className="text-sm text-gray-400 font-medium mt-2">
              Você ainda não possui solicitações ativas. Explore o acervo para
              reservar um livro!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {reservas.map((reserva) => (
            <div
              key={reserva.id_reserva}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-denin/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-denin/5 rounded-[1.5rem] flex items-center justify-center text-denin shrink-0 group-hover:bg-denin group-hover:text-white transition-all duration-300">
                  <BookIcon size={28} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-xl tracking-tight leading-tight group-hover:text-denin transition-colors">
                    {reserva.titulo || 'Título não carregado'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <Calendar size={14} className="text-denin/40" />
                      Reservado:{' '}
                      <span className="text-gray-600">
                        {format(new Date(reserva.data_reserva), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-orange-500 uppercase tracking-wider">
                      <Clock size={14} />
                      Expira:{' '}
                      <span>
                        {format(
                          new Date(reserva.data_expiracao),
                          'dd/MM/yyyy',
                          { locale: ptBR }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-6 md:pt-0">
                {getStatusBadge(reserva.status)}

                {reserva.status === 'ativa' && (
                  <button
                    onClick={() => handleCancelar(reserva.id_reserva)}
                    disabled={isCancelling === reserva.id_reserva}
                    className="w-12 h-12 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all disabled:opacity-50"
                    title="Cancelar Reserva"
                  >
                    {isCancelling === reserva.id_reserva ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Trash2 size={22} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
