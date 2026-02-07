"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth-service";
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  House,
} from "lucide-react"; // Adicionado ArrowLeft

export default function LoginScreen() {
  const router = useRouter();
  const authService = new AuthService();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const { usuario } = await authService.login({ email, senha });

      setSuccess(true);

      setTimeout(() => {
        if (usuario.tipo === "funcionario") {
          router.push("/dashboard/staff");
        } else {
          router.push("/dashboard/user");
        }
      }, 800);
    } catch (error: any) {
      setError(error.message || "E-mail ou senha inválidos. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rudy-blue/50 p-4 transition-all relative">
      {/* BOTÃO VOLTAR (ADICIONADO) */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-3 text-gray-600 hover:text-denin transition-all group z-[110]"
      >
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-gray-100 shadow-md group-hover:shadow-lg group-hover:border-denin/30 transition-all">
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1.5 transition-transform duration-300"
          />
          <div className="w-px h-4 bg-gray-200 group-hover:bg-denin/20 transition-colors" />{" "}
          {/* Divisor sutil */}
          <House size={22} />
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-denin transition-colors">
            Voltar para
          </span>
          <span className="text-sm font-bold text-gray-800 leading-none">
            Página Inicial
          </span>
        </div>
      </Link>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-gray-100">
        {/* Lado Esquerdo: Cadastro */}
        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center space-y-6 bg-white">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/img/logo.png"
              width={200}
              height={200}
              alt="Logo"
              className="w-20 mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Crie sua conta
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Escolha seu perfil para acessar a biblioteca.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {["aluno", "professor", "funcionario"].map((perfil) => (
              <Link
                key={perfil}
                href={`/${perfil}`}
                className="w-full py-3 px-4 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all text-center text-sm capitalize"
              >
                Cadastrar como {perfil.replace("funcionario", "Funcionário")}
              </Link>
            ))}
          </div>
        </div>

        {/* Lado Direito: Formulário */}
        <div className="p-8 md:p-12 bg-gray-50/50 flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-500 text-sm">
              Acesse sua conta para continuar.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                E-mail
              </label>
              <input
                type="email"
                required
                disabled={loading || success}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black shadow-sm transition-all disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Senha
              </label>
              <input
                type="password"
                required
                disabled={loading || success}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black shadow-sm transition-all disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2
                ${success ? "bg-green-600 text-white shadow-green-100" : "bg-gray-800 text-white hover:bg-gray-900 shadow-gray-200"}
                disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Autenticando...</span>
                </>
              ) : success ? (
                <span>Sucesso!</span>
              ) : (
                "Entrar no e-Papirus"
              )}
            </button>
            <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed px-4">
              Esqueceu sua senha? Entre em contato com o suporte da biblioteca
              para recuperação.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
