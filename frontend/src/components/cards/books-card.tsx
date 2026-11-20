'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Livro } from '@/types/livros';

interface BooksCardProps {
  livro: Livro;
}

export default function BooksCard({ livro }: BooksCardProps) {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  const checkAuth = useCallback(() => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("bib_token");
      const user = sessionStorage.getItem("bib_user");
      setIsLogged(!!token && !!user);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      checkAuth();
    }, 0);
    return () => clearTimeout(timer);
  }, [checkAuth]);

  const handleReserva = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLogged) {
      router.push(`/dashboard/user/nova-reserva?id_livro=${livro.id_livro}`);
    } else {
      router.push(
        `/login?redirect=/resultados?q=${encodeURIComponent(livro.titulo)}`
      );
    }
  };

  return (
    <Card className="relative w-full max-w-[240px] h-full mx-auto bg-slate-50 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-lg dark:shadow-none dark:hover:shadow-[0_0_20px_rgba(2,203,254,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Favorito Reduzido */}
      <div className="absolute top-3 right-3 z-10 cursor-pointer text-denin dark:text-vivid-sky hover:scale-110 transition-transform">
        <Heart size={20} className="hover:fill-denin dark:hover:fill-vivid-sky transition-colors" />
      </div>

      <CardContent className="p-4 pb-2 flex flex-col items-center flex-grow relative z-10">
        {/* Imagem Proporcionalmente Menor */}
        <div className="mb-3 shadow-md dark:shadow-black/50 rotate-1 group-hover:rotate-0 transition-transform duration-300 shrink-0">
          <Image
            src={livro.capa || '/img/img1.jpg'}
            alt={`Capa do livro ${livro.titulo}`}
            width={110}
            height={160}
            className="rounded-r-sm object-cover h-[160px] w-[110px]"
          />
        </div>

        {/* Informações Compactas */}
        <div className="w-full text-left space-y-0.5">
          <span className="text-[9px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-wider line-clamp-1 transition-colors">
            {livro.nome_assunto}
          </span>

          <h3
            className="text-base font-bold text-denin dark:text-vivid-sky leading-tight line-clamp-2 min-h-[38px] transition-colors"
            title={livro.titulo}
          >
            {livro.titulo}
          </h3>

          <p className="text-[11px] font-semibold text-slate-700 dark:text-gray-300 line-clamp-1 transition-colors">
            {livro.nomes_autores}
          </p>
        </div>
      </CardContent>

      <div className="px-4 py-1 relative z-10">
        <div className="h-[1px] w-full bg-slate-200/60 dark:bg-slate-700/50 transition-colors" />
      </div>

      <CardFooter className="px-4 pb-4 pt-1 relative z-10">
        <Button
          onClick={handleReserva}
          variant="secondary"
          size="sm"
          className="w-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-gray-200 hover:bg-denin dark:hover:bg-vivid-sky hover:text-white dark:hover:text-slate-900 font-black text-[10px] h-8 uppercase tracking-tighter transition-all rounded-lg border-none shadow-sm"
        >
          {!mounted ? (
            <Loader2 size={14} className="animate-spin" />
          ) : isLogged ? (
            'Reservar'
          ) : (
            'Entrar'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
