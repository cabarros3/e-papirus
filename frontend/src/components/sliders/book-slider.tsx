'use client';

import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import BooksCard from '../cards/books-card';
import { Livro } from '@/types/livros';

interface BookSliderProps {
  livros: Livro[];
  titulo: string;
  subtitulo: string;
}

export function BookSlider({ livros, titulo, subtitulo }: BookSliderProps) {
  if (!livros || livros.length === 0) {
    return (
      <section className="flex flex-col justify-center items-center py-10 gap-2 opacity-50">
        <h3 className="text-lg text-denin dark:text-vivid-sky font-bold transition-colors">{titulo}</h3>
        <span className="text-gray-400 dark:text-gray-500">
          Nenhum livro encontrado nesta categoria.
        </span>
      </section>
    );
  }

  return (
    <section className="flex flex-col justify-center py-8">
      <div className="flex flex-col items-center justify-center gap-2 mb-8 text-center">
        <h3 className="text-3xl md:text-4xl text-denin dark:text-vivid-sky font-bold transition-colors">{titulo}</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl px-4 transition-colors">{subtitulo}</p>
      </div>

      <Carousel
        opts={{ align: 'start', loop: true }}
        className="w-full max-w-6xl mx-auto px-10"
      >
        <CarouselContent className="-ml-4 pb-4">
          {livros.map((livro) => (
            <CarouselItem
              key={livro.id_livro}
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="p-1 h-full">
                <BooksCard livro={livro} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-4" />
        <CarouselNext className="hidden md:flex -right-4" />
      </Carousel>
    </section>
  );
}
