'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-toggle'; // <-- NOVO IMPORT

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogged, setIsLogged] = useState<boolean | null>(null);

  const checkAuth = useCallback(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('bib_token');
      const user = sessionStorage.getItem('bib_user');
      const loggedStatus = !!token && !!user;
      setIsLogged(loggedStatus);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(checkAuth, 0);
    window.addEventListener('storage', checkAuth);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', checkAuth);
    };
  }, [checkAuth]);

  const handleAccessAction = () => {
    setIsMenuOpen(false);
    if (isLogged) {
      const savedUser = sessionStorage.getItem('bib_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          if (user.tipo === 'staff' || user.tipo === 'admin' || user.cargo) {
            router.push('/dashboard/staff');
          } else {
            router.push('/dashboard/user');
          }
        } catch (error) {
          console.error('Erro ao identificar usuário:', error);
          router.push('/dashboard/user');
        }
      } else {
        router.push('/dashboard/user');
      }
    } else {
      router.push('/login');
    }
  };

  return (
    <header className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 sticky top-0 z-[100] transition-colors">
      <div className="max-w-[1600px] mx-auto flex items-center h-24 px-8 relative">
        {/* ESQUERDA: LOGO */}
        <div className="flex-shrink-0 z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/img/logo.png"
              alt="Logo"
              width={48}
              height={48}
              className="group-hover:rotate-3 transition-transform"
            />
            <span className="font-black text-3xl tracking-tighter text-gray-900 dark:text-white transition-colors">
              <span className="text-denin">e</span>-Papirus
            </span>
          </Link>
        </div>

        {/* CENTRO: NAVEGAÇÃO */}
        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-16">
          <Link
            href="/"
            className="text-2xl font-medium text-gray-500 dark:text-gray-300 hover:text-denin dark:hover:text-vivid-sky transition-colors"
          >
            Início
          </Link>
          <Link
            href="/resultados"
            className="text-2xl font-medium text-gray-500 dark:text-gray-300 hover:text-denin dark:hover:text-vivid-sky transition-colors"
          >
            Acervo
          </Link>
          <Link
            href="/sobre"
            className="text-2xl font-medium text-gray-500 dark:text-gray-300 hover:text-denin dark:hover:text-vivid-sky transition-colors"
          >
            Sobre
          </Link>
        </nav>

        {/* DIREITA: AÇÕES */}
        <div className="flex items-center gap-4 ml-auto z-10">
          {/* NOVO: Botão de Alternar Tema */}
          <ThemeToggle />

          <div className="hidden md:block min-w-[220px]">
            {isLogged === null ? (
              <div className="w-full h-12 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 animate-pulse" />
            ) : (
              <Button
                onClick={handleAccessAction}
                className={`w-full h-12 px-6 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-3 border-none active:scale-95 ${
                  isLogged
                    ? 'bg-denin text-white hover:bg-denin/90 shadow-denin/10'
                    : 'bg-gray-800 text-white hover:bg-gray-900 shadow-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600'
                }`}
              >
                {isLogged ? (
                  <>
                    <LayoutDashboard size={20} />
                    <span className="text-sm uppercase tracking-widest">
                      Painel
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm uppercase tracking-widest">
                      Fazer Login
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>

          <button
            className="p-3 text-gray-600 dark:text-gray-300 lg:hidden hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-24 left-0 w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-2xl z-50 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-8 gap-3 text-left">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-medium text-gray-600 dark:text-gray-300 p-5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
            >
              Início
            </Link>
            <Link
              href="/resultados"
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-medium text-gray-600 dark:text-gray-300 p-5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
            >
              Acervo
            </Link>
            <Link
              href="/sobre"
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-medium text-gray-600 dark:text-gray-300 p-5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
            >
              Sobre
            </Link>

            <div className="h-px bg-gray-100 dark:bg-slate-800 my-6 mx-4" />

            <div className="px-4 pb-6">
              <Button
                onClick={handleAccessAction}
                className={`w-full h-14 text-lg font-bold uppercase tracking-widest rounded-2xl ${
                  isLogged ? 'bg-denin text-white' : 'bg-gray-800 text-white dark:bg-slate-700'
                }`}
              >
                {isLogged ? 'Ir para o Painel' : 'Acessar Sistema'}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
