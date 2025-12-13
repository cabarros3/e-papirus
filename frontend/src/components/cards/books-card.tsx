// components/books-card.tsx
"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card"; // Ajuste o caminho se necessário (ex: "@/components/ui/card")
import { Button } from "../ui/button";
import { Livro } from "@/types/livros"; // Importe sua tipagem

interface BooksCardProps {
  livro: Livro;
}

export default function BooksCard({ livro }: BooksCardProps) {
  return (
    <Card className="relative w-full h-full mx-auto bg-slate-50 border-none shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      {/* Ícone de Favorito */}
      <div className="absolute top-4 right-4 z-10 cursor-pointer text-denin hover:fill-denin">
        <Heart size={24} />
      </div>

      <CardContent className="p-6 pb-2 flex flex-col items-center flex-grow">
        {/* Imagem do Livro */}
        <div className="mb-4 shadow-lg rotate-1 hover:rotate-0 transition-transform duration-300">
          <Image
            // Se o backend tiver campo 'capa', usa ele. Senão usa a imagem padrão.
            src={livro.capa || "/img/img1.jpg"}
            alt={`Capa do livro ${livro.titulo}`}
            width={140}
            height={200}
            className="rounded-r-sm object-cover h-[200px]" // Garante altura fixa para não quebrar o layout
          />
        </div>

        {/* Informações do Livro */}
        <div className="w-full text-left space-y-1">
          <span className="text-xs text-muted-foreground font-medium uppercase line-clamp-1">
            {livro.nome_assunto}
          </span>

          <h3
            className="text-lg font-bold text-denin leading-tight line-clamp-2 min-h-[44px]"
            title={livro.titulo}
          >
            {livro.titulo}
          </h3>

          <p className="text-sm font-semibold text-slate-800 line-clamp-1">
            {livro.nomes_autores}
          </p>
        </div>
      </CardContent>

      {/* Linha separadora */}
      <div className="px-6 py-2">
        <div className="h-[1px] w-full bg-slate-200" />
      </div>

      <CardFooter className="px-6 pb-6 pt-2 flex items-center justify-between">
        {/* Badge - Por enquanto fixo em Disponível, mas pode vir do banco futuramente */}
        <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full">
          Disponível
        </span>

        <Button
          variant="secondary"
          size="sm"
          className="bg-slate-200 text-slate-600 hover:bg-slate-300 font-bold text-xs px-6 uppercase tracking-wide"
        >
          Reservar
        </Button>
      </CardFooter>
    </Card>
  );
}
