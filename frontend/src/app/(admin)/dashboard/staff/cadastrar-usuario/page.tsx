'use client';

import React, { useState } from 'react';
import { pessoaService } from '@/services/pessoa-service';
import {
  CadastroPessoaDTO,
  TipoPessoa,
  CargoFuncionario,
} from '@/types/pessoas';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Fingerprint,
  IdCard,
  Phone,
  ShieldCheck,
  Briefcase,
  Lock,
  Loader2,
  ArrowLeft,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function CadastrarPessoa() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Tipando o estado com o seu TipoPessoa para evitar erros de casting
  const [tipoUsuario, setTipoUsuario] = useState<TipoPessoa>('aluno');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const senha = String(formData.get('senha'));
    const confirmaSenha = String(formData.get('confirma_senha'));

    if (senha !== confirmaSenha) {
      toast.error('As senhas não coincidem!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Payload agora segue rigorosamente a interface CadastroPessoaDTO
      const payload: CadastroPessoaDTO = {
        nome: String(formData.get('nome')),
        email: String(formData.get('email')),
        cpf: String(formData.get('cpf')),
        matricula: String(formData.get('matricula')),
        telefone: String(formData.get('telefone')),
        tipo: tipoUsuario,
        senha: senha,
        // Só envia o cargo se for funcionário, e faz o cast para o tipo específico
        cargo:
          tipoUsuario === 'funcionario'
            ? (formData.get('cargo') as CargoFuncionario)
            : null,
      };

      await pessoaService.criar(payload);
      toast.success('Usuário cadastrado com sucesso!');

      (e.target as HTMLFormElement).reset();
      setTipoUsuario('aluno');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao realizar o cadastro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-8 space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/staff/"
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Cadastrar Novo Usuário
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Registre leitores ou membros da equipe no e-Papirus.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-[2.5rem] border border-gray-200 shadow-sm space-y-10"
      >
        {/* Seção 1: Dados Pessoais */}
        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <User size={14} /> Informações Pessoais
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-bold text-gray-600">
                Nome Completo
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  name="nome"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
                  placeholder="Ex: Maria Oliveira Santos"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">E-mail</label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">
                Telefone
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  name="telefone"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2: Documentação e Perfil */}
        <div className="space-y-6 pt-6 border-t border-gray-50">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Fingerprint size={14} /> Documentação e Perfil
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">CPF</label>
              <input
                name="cpf"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-denin"
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">
                Matrícula
              </label>
              <input
                name="matricula"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-denin"
                placeholder="Ex: 2024.1.0001"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">
                Tipo de Usuário
              </label>
              <select
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value as TipoPessoa)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-denin bg-white"
              >
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
                <option value="funcionario">Funcionário</option>
              </select>
            </div>

            {tipoUsuario === 'funcionario' && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-gray-600">
                  Cargo do Funcionário
                </label>
                <div className="relative">
                  <Briefcase
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <select
                    name="cargo"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-denin bg-white"
                  >
                    <option value="">Selecione um cargo...</option>
                    <option value="bibliotecario">Bibliotecário</option>
                    <option value="auxiliar">Auxiliar</option>
                    <option value="estagiario">Estagiário</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seção 3: Segurança */}
        <div className="space-y-6 pt-6 border-t border-gray-50">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Lock size={14} /> Segurança e Acesso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">
                Definir Senha
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  name="senha"
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-denin"
                  placeholder="Mínimo 6 dígitos"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">
                Confirmar Senha
              </label>
              <div className="relative">
                <CheckCircle2
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  name="confirma_senha"
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-denin"
                  placeholder="Repita a senha"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full max-w-xs bg-denin text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-xl shadow-denin/20 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <UserPlus size={20} /> Salvar Cadastro
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
