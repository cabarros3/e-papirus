"use client";

import { CheckCircle2, X, BookOpen, User, Calendar, Clock } from "lucide-react";

interface ResumoDevolucaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioNome: string;
  dados: any[]; // Array de livros devolvidos
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
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
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
          <h2 className="text-2xl font-bold">Devolução Concluída!</h2>
          <p className="text-green-100 text-sm opacity-90">
            Os itens foram retornados ao acervo.
          </p>
        </div>

        {/* Detalhes */}
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="bg-white p-2 rounded-xl shadow-sm text-denin">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Leitor
              </p>
              <p className="font-bold text-gray-800">{usuarioNome}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={14} /> Livros Devolvidos ({dados.length})
            </p>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {dados.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700 truncate">
                      {item.titulo}
                    </p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-gray-500">
                        Exemplar #{item.id_exemplar}
                      </span>
                      <span
                        className={`font-bold ${item.cor === "red" ? "text-red-500" : "text-blue-500"}`}
                      >
                        • {item.situacao}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
          >
            Fechar Resumo
          </button>
        </div>
      </div>
    </div>
  );
}
