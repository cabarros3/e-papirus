'use client';

import { CheckCircle2, BookOpen, User } from 'lucide-react';

interface ResumoDevolucaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioNome: string;
  dados: any[];
}

export function ResumoDevolucaoModal({
  isOpen,
  onClose,
  usuarioNome,
  dados,
}: ResumoDevolucaoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Devolução Concluída!
          </h2>

          <p className="text-gray-500 text-sm font-medium">
            Os itens retornaram ao acervo com sucesso no sistema e-Papirus.
          </p>

          <div className="w-full bg-gray-50 rounded-2xl p-6 mt-4 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <User size={16} className="text-gray-400 mt-1" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Leitor
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {usuarioNome}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen size={16} className="text-gray-400 mt-1" />
              <div className="w-full">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Itens Processados
                </p>

                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {dados.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-gray-100 p-3"
                    >
                      <p className="text-sm font-bold text-gray-900">
                        {item.titulo}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-xs text-gray-500">
                          Exemplar #{item.id_exemplar}
                        </p>

                        <p className="text-[10px] font-bold text-green-600 uppercase">
                          Disponível
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98] mt-4"
          >
            Fechar Resumo
          </button>
        </div>
      </div>
    </div>
  );
}
