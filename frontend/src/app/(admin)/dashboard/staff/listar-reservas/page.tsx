'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  Search,
  Calendar,
  User,
  Book as BookIcon,
  Trash2,
} from 'lucide-react';
import { reservaService } from '@/services/reserva-service';
import { Reserva } from '@/types/reservas';
import { toast } from 'sonner';
import Link from 'next/link';
import { ConfirmarExclusaoModal } from '@/components/modals/confirm-delete-modal';

export default function ListarReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  // Estados do Modal de Exclusão
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const carregarReservas = async () => {
    setLoading(true);
    try {
      const response = await reservaService.listarTodas();
      if (response.status === 'sucesso' && response.dados) {
        setReservas(response.dados);
      } else {
        setReservas([]);
      }
    } catch (error) {
      toast.error('Erro ao carregar lista de reservas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarReservas();
  }, []);

  const abrirConfirmacao = (id: number) => {
    setIdParaExcluir(id);
    setIsModalOpen(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!idParaExcluir) return;

    setIsDeleting(true);
    try {
      await reservaService.cancelar(idParaExcluir);
      toast.success('Reserva cancelada com sucesso!');
      await carregarReservas();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar reserva.');
    } finally {
      setIsDeleting(false);
      setIdParaExcluir(null);
    }
  };

  const reservasFiltradas = reservas.filter(
    (r) =>
      r.titulo?.toLowerCase().includes(filtro.toLowerCase()) ||
      r.nome_pessoa?.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-denin" size={40} />
      </div>
    );

  return (
    <div className="space-y-6">
      <ConfirmarExclusaoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmarExclusao}
        titulo="Cancelar Reserva"
        mensagem="Tem certeza que deseja cancelar esta reserva? O exemplar voltará a ficar disponível no acervo imediatamente."
        isDeleting={isDeleting}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase text-gray-900">
            Gestão de Reservas
          </h1>
          <p className="text-sm text-gray-500">
            Visualize e controle as reservas ativas do sistema.
          </p>
        </div>
        <Link
          href="/dashboard/staff/cadastrar-reservas"
          className="bg-denin text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:brightness-110 transition-all flex items-center gap-2 w-fit"
        >
          <Calendar size={18} /> Nova Reserva
        </Link>
      </div>

      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar por livro ou usuário..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-denin outline-none transition-all shadow-sm"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Livro
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Usuário
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Data Reserva
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Expira em
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reservasFiltradas.length > 0 ? (
                reservasFiltradas.map((reserva) => (
                  <tr
                    key={reserva.id_reserva}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-denin">
                          <BookIcon size={16} />
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {reserva.titulo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        {reserva.nome_pessoa}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(reserva.data_reserva).toLocaleDateString(
                        'pt-BR'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold">
                        {new Date(reserva.data_expiracao).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirConfirmacao(reserva.id_reserva)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                          title="Cancelar Reserva"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400 text-sm italic"
                  >
                    Nenhuma reserva encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
