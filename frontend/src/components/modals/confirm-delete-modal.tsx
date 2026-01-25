"use client";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmarExclusaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  mensagem: string;
  isDeleting?: boolean;
}

export function ConfirmarExclusaoModal({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensagem,
  isDeleting = false,
}: ConfirmarExclusaoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-red-50 p-4 rounded-full">
            <AlertTriangle size={32} className="text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-gray-900">{titulo}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{mensagem}</p>

          <div className="flex flex-col w-full gap-3 mt-4">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-[0.98]"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
