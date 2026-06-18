'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pessoaService } from '@/services/pessoa-service';
import { Pessoa } from '@/types/pessoas';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  IdCard,
  ShieldCheck,
  Save,
  Loader2,
  AlertCircle,
  Fingerprint,
  Lock,
  KeyRound,
} from 'lucide-react';
import { ModalAlterarSenha } from '@/components/modals/change-password-modal';

export default function PerfilUsuario() {
  const router = useRouter();
  const [user, setUser] = useState<Pessoa | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // 1. Sincronização: Busca os dados completos do banco ao carregar
  useEffect(() => {
    async function sincronizarDados() {
      try {
        const saved = sessionStorage.getItem('bib_user');
        if (!saved) {
          router.push('/login');
          return;
        }

        const userSession = JSON.parse(saved);
        // Tenta pegar id_usuario ou id_pessoa (dependendo de como está vindo do seu login)
        const idParaBusca = userSession.id_usuario || userSession.id_pessoa;

        const dadosCompletos =
          await pessoaService.buscarDadosCompletos(idParaBusca);

        setUser(dadosCompletos);
        sessionStorage.setItem('bib_user', JSON.stringify(dadosCompletos));
      } catch (error) {
        console.error('Erro ao sincronizar perfil:', error);
        toast.error('Não foi possível carregar seus dados atualizados.');
      } finally {
        setLoading(false);
      }
    }

    sincronizarDados();
  }, [router]);

  // 2. Salvar alterações de dados pessoais
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const payload = {
      nome: String(formData.get('nome')),
      email: String(formData.get('email')),
      telefone: String(formData.get('telefone')),
    };

    try {
      await pessoaService.atualizar(user.id_pessoa, payload);

      // Merge: Mantém campos fixos (matricula, tipo) e atualiza os editados
      const usuarioAtualizado = { ...user, ...payload };

      setUser(usuarioAtualizado);
      sessionStorage.setItem('bib_user', JSON.stringify(usuarioAtualizado));

      // Evento para atualizar o Header instantaneamente
      window.dispatchEvent(new Event('storage'));

      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar alterações.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-denin" size={40} />
        <p className="text-gray-500 font-medium animate-pulse uppercase text-[10px] tracking-widest">
          Sincronizando com o servidor...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
            Meu Perfil
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-2">
            Gerencie suas informações e segurança de acesso.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-2xl">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            Sessão Ativa: {user?.tipo}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: FORMULÁRIO */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-200 shadow-sm space-y-10"
          >
            <section className="space-y-6">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} className="text-denin" /> Dados Cadastrais
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 ml-1">
                    Nome Completo
                  </label>
                  <div className="relative group">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-denin transition-colors"
                      size={18}
                    />
                    <input
                      name="nome"
                      defaultValue={user?.nome}
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-denin/5 focus:border-denin outline-none transition-all font-semibold text-gray-700 bg-gray-50/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 ml-1">
                    E-mail
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-denin transition-colors"
                      size={18}
                    />
                    <input
                      name="email"
                      type="email"
                      defaultValue={user?.email}
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-denin/5 focus:border-denin outline-none transition-all font-semibold text-gray-700 bg-gray-50/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 ml-1">
                    Telefone
                  </label>
                  <div className="relative group">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-denin transition-colors"
                      size={18}
                    />
                    <input
                      name="telefone"
                      defaultValue={user?.telefone || ''}
                      placeholder="(00) 00000-0000"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-denin/5 focus:border-denin outline-none transition-all font-semibold text-gray-700 bg-gray-50/30"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-6 border-t border-gray-50 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-denin text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                Salvar Alterações
              </button>
            </div>
          </form>

          {/* SEÇÃO DE SENHA (ABAIXO DO FORM) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
                <KeyRound size={28} />
              </div>
              <div>
                <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">
                  Segurança de Acesso
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Deseja atualizar sua senha de login?
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full md:w-auto px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-gray-200"
            >
              <Lock size={16} /> Alterar Senha
            </button>
          </div>
        </div>

        {/* COLUNA DIREITA: INFOS FIXAS */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-denin/20 rounded-full blur-3xl group-hover:bg-denin/40 transition-all duration-700" />

            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-8 relative z-10">
              <Fingerprint size={14} className="text-denin" /> Identificação
              Institucional
            </h2>

            <div className="space-y-6 relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  Matrícula
                </p>
                <div className="flex items-center gap-3">
                  <IdCard size={20} className="text-denin" />
                  <p className="text-xl font-mono font-bold tracking-tighter">
                    {user?.matricula}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  CPF
                </p>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-denin" />
                  <p className="text-xl font-mono font-bold tracking-tighter">
                    {user?.cpf}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex gap-4">
            <AlertCircle className="text-denin shrink-0" size={20} />
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
              Por segurança, os campos de <b>CPF</b> e <b>Matrícula</b> são
              validados pela administração e não podem ser alterados
              diretamente.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL DE SENHA */}
      {showPasswordModal && user && (
        <ModalAlterarSenha
          id_pessoa={user.id_pessoa}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}
