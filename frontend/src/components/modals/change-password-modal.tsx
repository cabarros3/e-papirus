'use client';

import React, { useState } from 'react';
import { Lock, X, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { pessoaService } from '@/services/pessoa-service';
import { toast } from 'sonner';

export function ModalAlterarSenha({
  id_pessoa,
  onClose,
}: {
  id_pessoa: number;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const senha_atual = String(formData.get('atual'));
    const nova_senha = String(formData.get('nova'));
    const confirma = String(formData.get('confirma'));

    if (nova_senha !== confirma) {
      return toast.error('A nova senha e a confirmação não coincidem!');
    }

    if (nova_senha.length < 6) {
      return toast.error('A nova senha deve ter pelo menos 6 caracteres.');
    }

    setLoading(true);
    try {
      await pessoaService.alterarSenha(id_pessoa, senha_atual, nova_senha);
      toast.success('Senha alterada com sucesso!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Senha atual incorreta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-denin/10 rounded-xl text-denin">
              <Lock size={20} />
            </div>
            <h2 className="font-black text-gray-800 uppercase text-sm tracking-widest">
              Alterar Senha
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-all"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
              Senha Atual
            </label>
            <input
              name="atual"
              type="password"
              required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-denin/5 focus:border-denin transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
              Nova Senha
            </label>
            <input
              name="nova_senha"
              type="password"
              required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-denin/5 focus:border-denin transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
              Confirmar Nova Senha
            </label>
            <input
              name="confirma"
              type="password"
              required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-denin/5 focus:border-denin transition-all"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-denin text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              Atualizar Senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
