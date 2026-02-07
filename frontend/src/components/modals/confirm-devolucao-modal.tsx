"use client";

import { AlertCircle, X, HelpCircle } from "lucide-react";

interface ConfirmDevolucaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quantidade: number;
  loading?: boolean;
}

export function ConfirmDevolucaoModal({
  isOpen,
  onClose,
  onConfirm,
  quantidade,
  loading,
}: ConfirmDevolucaoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Ícone e Botão Fechar */}
        <div className="p-6 pb-0 flex justify-between items-start">
          <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
            <HelpCircle size={28} />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-8 pt-4 space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              Confirmar Devolução
            </h2>
            <p className="text-sm text-gray-500">
              Você deseja confirmar a devolução de{" "}
              <span className="font-bold text-gray-900">{quantidade}</span>{" "}
              {quantidade === 1 ? "livro" : "livros"}?
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all border border-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-2xl font-bold bg-denin text-white hover:bg-blue-800 transition-all shadow-lg shadow-denin/20 flex items-center justify-center"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Confirmar"
              )}
            </button>
          </div>
        </div>

        {/* Nota de rodapé */}
        <div className="bg-gray-50 p-4 flex items-center justify-center gap-2">
          <AlertCircle size={14} className="text-gray-400" />
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            Ação irreversível
          </span>
        </div>
      </div>
    </div>
  );
}
