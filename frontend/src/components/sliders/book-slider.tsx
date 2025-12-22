"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import BooksCard from "../cards/books-card";
import { Livro } from "@/types/livros";

interface BookSliderProps {
  livros: Livro[];
  titulo: string; // Novo
  subtitulo: string; // Novo
}

export function BookSlider({ livros, titulo, subtitulo }: BookSliderProps) {
  if (!livros || livros.length === 0) {
    return (
      <section className="flex flex-col justify-center items-center py-10 gap-2 opacity-50">
        <h3 className="text-2xl text-denin font-bold">{titulo}</h3>
        <span className="text-gray-400">
          Nenhum livro encontrado nesta categoria.
        </span>
      </section>
    );
  }

  return (
    <section className="flex flex-col justify-center py-8">
      <div className="flex flex-col items-center justify-center gap-2 mb-8 text-center">
        <h3 className="text-3xl md:text-4xl text-denin font-bold">{titulo}</h3>
        <p className="text-gray-500 max-w-2xl px-4">{subtitulo}</p>
      </div>

      <Carousel
        opts={{ align: "start", loop: true }}
        className="w-full max-w-6xl mx-auto px-10"
      >
        <CarouselContent className="-ml-4 pb-4">
          {livros.map((livro) => (
            <CarouselItem
              key={livro.id_livro}
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4" // Ajustado para mostrar mais livros
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

// // components/sliders/book-slider.tsx
// "use client";

// import * as React from "react";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "../ui/carousel";
// import BooksCard from "../cards/books-card";
// // Importamos a tipagem
// import { Livro } from "@/types/livros";

// // 1. Definimos que o componente recebe uma lista de livros
// interface BookSliderProps {
//   livros: Livro[];
// }

// export function BookSlider({ livros }: BookSliderProps) {
//   // 2. Proteção caso a lista esteja vazia ou carregando
//   if (!livros || livros.length === 0) {
//     return (
//       <section className="flex flex-col justify-center items-center py-10 gap-2">
//         <h3 className="text-2xl text-denin font-bold">✨ Novas Aquisições</h3>
//         <span className="text-gray-400">
//           Aqui estão os livros adquiridos recentemente pela biblioteca
//         </span>
//         <span>OpS... Nenhuma aquisição</span>
//       </section>
//     );
//   }

//   return (
//     <section className="flex flex-col justify-center">
//       <div className="flex flex-col items-center justify-center gap-5 p-10">
//         <h3 className="text-4xl text-denin font-bold">✨ Novas Aquisições</h3>
//         <span>
//           Aqui estão os livros adquiridos recentemente pela biblioteca
//         </span>
//       </div>

//       <Carousel
//         opts={{
//           align: "start",
//           loop: true, // Opcional: faz o carrossel ser infinito
//         }}
//         className="w-full max-w-5xl mx-auto px-4 md:px-0" // Adicionei px-4 para não colar na borda no mobile
//       >
//         <CarouselContent className="-ml-4 pb-4">
//           {/* 3. Mapeamos os livros reais ao invés do Array.from */}
//           {livros.map((livro) => (
//             <CarouselItem
//               key={livro.id_livro}
//               className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
//             >
//               <div className="p-1 h-full">
//                 {" "}
//                 {/* h-full ajuda a manter cards do mesmo tamanho */}
//                 {/* 4. Passamos o objeto livro para o Card */}
//                 <BooksCard livro={livro} />
//               </div>
//             </CarouselItem>
//           ))}
//         </CarouselContent>
//         {/* Botões de navegação só aparecem se tiver itens suficientes, mas deixei fixo aqui */}
//         <CarouselPrevious className="hidden md:flex" />{" "}
//         {/* Esconde no mobile para não atrapalhar */}
//         <CarouselNext className="hidden md:flex" />
//       </Carousel>
//     </section>
//   );
// }
