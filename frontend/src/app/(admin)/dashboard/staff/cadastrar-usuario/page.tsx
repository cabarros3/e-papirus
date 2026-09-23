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
  const [tipoUsuario, setTipoUsuario] = useState<TipoPessoa>('aluno');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro' | ''>('');
  const isTelefoneIncompleto = telefone.replace(/\D/g, '').length > 0 && telefone.replace(/\D/g, '').length < 11;


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const senha = String(formData.get('senha'));
    const confirmaSenha = String(formData.get('confirma_senha'));


    if (senha !== confirmaSenha) {
      toast.error('As senhas não coincidem!');
      return;
    }

    const numerosTelefone = telefone.replace(/\D/g, '');
    if (numerosTelefone.length > 0 && numerosTelefone.length < 11) {
      setMensagem('O telefone é opcional, mas se preenchido, deve conter 11 números (DDD + 9 dígitos).');
      setTipoMensagem('erro');
      return;
    }

    setLoading(true);
    setMensagem('');
    setIsSubmitting(true);

    try {
      // Payload agora segue rigorosamente a interface CadastroPessoaDTO
    const payload: CadastroPessoaDTO = {
      nome: String(formData.get('nome')),
      email: String(formData.get('email')),
      cpf: String(formData.get('cpf')),
      matricula: String(formData.get('matricula')),
      telefone: telefone || null, 
      tipo: tipoUsuario,
      senha: senha,
      cargo: tipoUsuario === 'funcionario' ? (formData.get('cargo') as CargoFuncionario) : null,
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

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    value = value.replace(/\D/g, "");
    value = value.substring(0, 11);

    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");

    setTelefone(value);
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
                  type="tel"
                  placeholder="(00) 00000-0000"
                  onChange={handleTelefoneChange}
                  value={telefone}
                  maxLength={15}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
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
            // Desabilita se estiver carregando, se deu sucesso, ou se o telefone estiver pela metade
            disabled={loading || success || isTelefoneIncompleto}
            className={`w-full py-3.5 bg-gray-800 text-white rounded-xl font-bold shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2 
              ${(loading || isTelefoneIncompleto) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-900 active:scale-[0.98]'}`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Processando...</span>
              </>
            ) : (
              'Cadastrar Aluno'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
