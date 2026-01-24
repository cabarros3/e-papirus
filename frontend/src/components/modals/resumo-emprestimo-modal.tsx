"use client";
import { CheckCircle2, Calendar, User, BookOpen } from "lucide-react";

interface ResumoEmprestimoModalProps {
  isOpen: boolean;
  dados: {
    livro: string;
    estudante: string;
    exemplar: string | number;
    devolucao: string;
  } | null;
  onConfirm: () => void;
}

export function ResumoEmprestimoModal({
  isOpen,
  dados,
  onConfirm,
}: ResumoEmprestimoModalProps) {
  if (!isOpen || !dados) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Empréstimo Confirmado!
          </h2>
          <p className="text-gray-500 text-sm font-medium">
            O registro foi concluído com sucesso no sistema e-Papirus.
          </p>

          <div className="w-full bg-gray-50 rounded-2xl p-6 mt-4 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <User size={16} className="text-gray-400 mt-1" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Estudante
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {dados.estudante}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen size={16} className="text-gray-400 mt-1" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Livro e Exemplar
                </p>
                <p className="text-sm font-bold text-gray-900">{dados.livro}</p>
                <p className="text-xs text-denin font-medium">
                  Exemplar #{dados.exemplar}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-gray-400 mt-1" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Data de Devolução
                </p>
                <p className="text-sm font-bold text-denin">
                  {new Date(dados.devolucao).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onConfirm}
            className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98] mt-4"
          >
            Voltar para Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
