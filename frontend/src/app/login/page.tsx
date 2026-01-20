"use client";
import Image from "next/image";
import Link from "next/link";

export default function LoginScreen() {
  // No futuro, aqui você usaria o authService.ts que criamos
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de login aqui
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rudy-blue/50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center space-y-6">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/img/logo.png"
              width={200}
              height={200}
              alt="Logo do e-papirus"
              className="w-24 mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-800">Crie sua conta</h1>
            <p className="text-gray-600 mt-2">
              Escolha seu perfil para acessar a biblioteca.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/aluno"
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-blue-500 hover:border-blue-500 hover:text-white transition text-center"
            >
              Cadastrar como Aluno
            </Link>

            <Link
              href="/professor"
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-blue-500 hover:border-blue-500 hover:text-white transition text-center"
            >
              Cadastrar como Professor
            </Link>

            <Link
              href="/funcionario"
              className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-blue-500 hover:border-blue-500 hover:text-white transition text-center"
            >
              Cadastrar como Funcionário
            </Link>
          </div>
        </div>

        <div className="p-8 md:p-12 bg-gray-50 flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Já sou usuário</h2>
            <p className="text-gray-600">Acesse sua conta agora.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                required
                placeholder="exemplo@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition shadow-lg shadow-gray-200"
            >
              Entrar no Sistema
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Esqueceu sua senha? Entre em contato com a biblioteca.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
