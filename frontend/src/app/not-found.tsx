'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function NotFound() {
  return (
    <main className="py-24 flex flex-col items-center justify-center px-4 text-center">
      {/* Elemento Visual de Destaque */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-denin/10 blur-3xl rounded-full scale-150 animate-pulse" />
        {/* <FileQuestion
          size={120}
          className="relative text-denin animate-bounce duration-[3000ms]"
        /> */}
        <Image
          src={'/img/logo.png'}
          alt="Logo do e-papirus"
          height={100}
          width={100}
        ></Image>
      </div>

      {/* Conteúdo de Texto com Fontes Proporcionais */}
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-7xl md:text-8xl font-black text-gray-900 tracking-tighter">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          Página não encontrada
        </h2>
        <p className="text-xl md:text-lg text-gray-500 leading-relaxed">
          Ops! O conteúdo que você procura sumiu da estante ou nunca esteve
          aqui. Que tal voltar para o início e tentar uma nova busca?
        </p>
      </div>

      {/* Ações: Botões Grandes e Chamativos */}
      <div className="flex flex-col sm:flex-row gap-4 mt-12">
        <Button
          asChild
          className="h-16 px-8 rounded-xl text-lg font-bold bg-denin hover:bg-denin/90 shadow-xl shadow-denin/20 transition-all active:scale-95"
        >
          <Link href="/" className="flex items-center gap-2">
            <Home size={22} />
            Voltar ao Início
          </Link>
        </Button>

        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="h-16 px-8 rounded-xl text-lg font-bold border-2 border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft size={22} />
            Página Anterior
          </div>
        </Button>
      </div>
    </main>
  );
}
