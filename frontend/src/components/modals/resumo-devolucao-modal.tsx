"use client";

import { CheckCircle2, X, BookOpen, User } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Aumentado de max-w-md para max-w-lg para acomodar títulos maiores */}
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Cabeçalho de Sucesso */}
        <div className="bg-green-600 p-8 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-poppins font-bold uppercase tracking-tight">
            Devolução Concluída!
          </h2>
          <p className="text-green-100 text-sm font-medium opacity-90">
            Os itens retornaram ao acervo com sucesso.
          </p>
        </div>

        {/* Detalhes */}
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="bg-white p-2.5 rounded-xl shadow-sm text-blue-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] font-poppins font-bold text-gray-400 uppercase tracking-widest">
                Leitor
              </p>
              <p className="font-poppins font-bold text-gray-800 text-lg leading-tight">
                {usuarioNome}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[11px] font-poppins font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <BookOpen size={14} /> Itens Processados ({dados.length})
            </p>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {dados.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col p-4 border border-gray-100 rounded-2xl bg-gray-50/50"
                >
                  {/* Título sem truncate para evitar quebra feia, agora com line-height ajustado */}
                  <p className="text-[13px] font-poppins font-bold text-gray-800 leading-snug mb-2">
                    {item.titulo}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500">
                        ID #{item.id_exemplar}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                      Retornado ao Acervo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-5 rounded-2xl font-poppins font-bold hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-gray-200"
          >
            Fechar Resumo
          </button>
        </div>
      </div>
    </div>
  );
}
