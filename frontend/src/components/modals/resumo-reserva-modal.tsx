"use client";
import { CheckCircle2, Calendar, User, BookOpen, Clock } from "lucide-react";

interface ResumoReservaModalProps {
  isOpen: boolean;
  dados: {
    livros: string;
    usuario: string;
    expiracao: string;
  } | null;
  onConfirm: () => void;
}

export function ResumoReservaModal({
  isOpen,
  dados,
  onConfirm,
}: ResumoReservaModalProps) {
  if (!isOpen || !dados) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-denin/10 p-3 rounded-full">
            <CheckCircle2 size={40} className="text-denin" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Reserva Confirmada!
          </h2>
          <p className="text-gray-500 text-sm font-medium">
            O título ficará reservado aguardando a retirada no balcão.
          </p>

          <div className="w-full bg-gray-50 rounded-2xl p-6 mt-4 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <User size={16} className="text-gray-400 mt-1" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Usuário
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {dados.usuario}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen size={16} className="text-gray-400 mt-1" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Títulos Reservados
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {dados.livros}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={16} className="text-gray-400 mt-1" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Válido Até
                </p>
                <p className="text-sm font-bold text-denin">
                  {new Date(dados.expiracao).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onConfirm}
            className="w-full bg-denin text-white py-5 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg active:scale-[0.98] mt-4"
          >
            Concluir e Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
