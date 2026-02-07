'use client';

import React, { useState } from 'react';
import {
  X,
  Save,
  Loader2,
  User as UserIcon,
  Mail,
  Phone,
  Fingerprint,
  IdCard,
  Filter,
  Briefcase,
} from 'lucide-react';
import {
  Pessoa,
  TipoPessoa,
  CargoFuncionario,
  CadastroPessoaDTO,
} from '@/types/pessoas';
import { pessoaService } from '@/services/pessoa-service';
import { toast } from 'sonner';

interface ModalEditarUsuarioProps {
  usuario: Pessoa;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalEditarUsuario({
  usuario,
  onClose,
  onSuccess,
}: ModalEditarUsuarioProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoPessoa>(
    usuario.tipo
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    // Omitimos a senha na atualização, conforme seu update.php sugere
    const dadosAtualizados: Partial<CadastroPessoaDTO> = {
      nome: String(formData.get('nome')),
      email: String(formData.get('email')),
      cpf: String(formData.get('cpf')),
      matricula: String(formData.get('matricula')),
      telefone: String(formData.get('telefone')),
      tipo: tipoSelecionado,
      cargo:
        tipoSelecionado === 'funcionario'
          ? (formData.get('cargo') as CargoFuncionario)
          : null,
    };

    try {
      await pessoaService.atualizar(usuario.id_pessoa, dadosAtualizados);
      toast.success('Usuário atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 uppercase">
              Editar Usuário
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              ID: #{usuario.id_pessoa}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <UserIcon size={12} /> Nome Completo
              </label>
              <input
                name="nome"
                defaultValue={usuario.nome}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none font-bold text-gray-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} /> Email
              </label>
              <input
                name="email"
                type="email"
                defaultValue={usuario.email}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none font-bold text-gray-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Phone size={12} /> Telefone
              </label>
              <input
                name="telefone"
                defaultValue={usuario.telefone || ''}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none font-bold text-gray-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Fingerprint size={12} /> CPF
              </label>
              <input
                name="cpf"
                defaultValue={usuario.cpf}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none font-bold text-gray-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <IdCard size={12} /> Matrícula
              </label>
              <input
                name="matricula"
                defaultValue={usuario.matricula}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none font-bold text-gray-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Filter size={12} /> Tipo
              </label>
              <select
                name="tipo"
                value={tipoSelecionado}
                onChange={(e) =>
                  setTipoSelecionado(e.target.value as TipoPessoa)
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none font-bold text-gray-700 bg-white"
              >
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
                <option value="funcionario">Funcionário</option>
              </select>
            </div>

            {tipoSelecionado === 'funcionario' && (
              <div className="space-y-1 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={12} /> Cargo
                </label>
                <select
                  name="cargo"
                  defaultValue={usuario.cargo || 'bibliotecario'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none font-bold text-gray-700 bg-white"
                >
                  <option value="bibliotecario">Bibliotecário</option>
                  <option value="auxiliar">Auxiliar</option>
                  <option value="estagiario">Estagiário</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] bg-[#0056b3] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#004494] transition-all shadow-xl shadow-blue-200/50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Save size={20} /> Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
