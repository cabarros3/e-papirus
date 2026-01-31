"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Livro } from "@/types/livros";

interface BooksCardProps {
  livro: Livro;
}

export default function BooksCard({ livro }: BooksCardProps) {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  const checkAuth = useCallback(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("bib_token");
      const user = localStorage.getItem("bib_user");
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
        `/login?redirect=/resultados?q=${encodeURIComponent(livro.titulo)}`,
      );
    }
  };

  return (
    <Card className="relative w-full max-w-[240px] h-full mx-auto bg-slate-50 border-none shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
      {/* Favorito Reduzido */}
      <div className="absolute top-3 right-3 z-10 cursor-pointer text-denin hover:scale-110 transition-transform">
        <Heart size={20} className="hover:fill-denin transition-colors" />
      </div>

      <CardContent className="p-4 pb-2 flex flex-col items-center flex-grow">
        {/* Imagem Proporcionalmente Menor */}
        <div className="mb-3 shadow-md rotate-1 hover:rotate-0 transition-transform duration-300 shrink-0">
          <Image
            src={livro.capa || "/img/img1.jpg"}
            alt={`Capa do livro ${livro.titulo}`}
            width={110}
            height={160}
            className="rounded-r-sm object-cover h-[160px] w-[110px]"
          />
        </div>

        {/* Informações Compactas */}
        <div className="w-full text-left space-y-0.5">
          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider line-clamp-1">
            {livro.nome_assunto}
          </span>

          <h3
            className="text-base font-bold text-denin leading-tight line-clamp-2 min-h-[38px]"
            title={livro.titulo}
          >
            {livro.titulo}
          </h3>

          <p className="text-[11px] font-semibold text-slate-700 line-clamp-1">
            {livro.nomes_autores}
          </p>
        </div>
      </CardContent>

      <div className="px-4 py-1">
        <div className="h-[1px] w-full bg-slate-200/60" />
      </div>

      <CardFooter className="px-4 pb-4 pt-1">
        <Button
          onClick={handleReserva}
          variant="secondary"
          size="sm"
          className="w-full bg-slate-200 text-slate-600 hover:bg-denin hover:text-white font-black text-[10px] h-8 uppercase tracking-tighter transition-all rounded-lg border-none"
        >
          {!mounted ? (
            <Loader2 size={14} className="animate-spin" />
          ) : isLogged ? (
            "Reservar"
          ) : (
            "Entrar"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { Heart, Loader2 } from "lucide-react";
// import { Card, CardContent, CardFooter } from "../ui/card";
// import { Button } from "../ui/button";
// import { Livro } from "@/types/livros";

// interface BooksCardProps {
//   livro: Livro;
// }

// export default function BooksCard({ livro }: BooksCardProps) {
//   const router = useRouter();

//   const [isLogged, setIsLogged] = useState<boolean | null>(null);
//   const [mounted, setMounted] = useState(false);

//   const checkAuth = useCallback(() => {
//     if (typeof window !== "undefined") {
//       const token = localStorage.getItem("bib_token");
//       const user = localStorage.getItem("bib_user");
//       setIsLogged(!!token && !!user);
//     }
//   }, []);

//   useEffect(() => {
//     // Usamos o microtask para evitar o aviso de cascading renders
//     const timer = setTimeout(() => {
//       setMounted(true);
//       checkAuth();
//     }, 0);

//     return () => clearTimeout(timer);
//   }, [checkAuth]);

//   const handleReserva = (e: React.MouseEvent) => {
//     e.stopPropagation();

//     if (isLogged) {
//       router.push(`/dashboard/user/nova-reserva?id_livro=${livro.id_livro}`);
//     } else {
//       router.push(
//         `/login?redirect=/resultados?q=${encodeURIComponent(livro.titulo)}`,
//       );
//     }
//   };

//   return (
//     <Card className="relative w-full h-full mx-auto bg-slate-50 border-none shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
//       {/* Ícone de Favorito */}
//       <div className="absolute top-4 right-4 z-10 cursor-pointer text-denin hover:scale-110 transition-transform">
//         <Heart size={24} className="hover:fill-denin transition-colors" />
//       </div>

//       <CardContent className="p-6 pb-2 flex flex-col items-center flex-grow">
//         {/* Imagem do Livro com leve rotação para estilo premium */}
//         <div className="mb-4 shadow-lg rotate-1 hover:rotate-0 transition-transform duration-300">
//           <Image
//             src={livro.capa || "/img/img1.jpg"}
//             alt={`Capa do livro ${livro.titulo}`}
//             width={140}
//             height={200}
//             className="rounded-r-sm object-cover h-[200px] w-[140px]"
//           />
//         </div>

//         {/* Informações do Livro */}
//         <div className="w-full text-left space-y-1">
//           <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest line-clamp-1">
//             {livro.nome_assunto}
//           </span>

//           <h3
//             className="text-lg font-bold text-denin leading-tight line-clamp-2 min-h-[44px]"
//             title={livro.titulo}
//           >
//             {livro.titulo}
//           </h3>

//           <p className="text-sm font-semibold text-slate-800 line-clamp-1">
//             {livro.nomes_autores}
//           </p>
//         </div>
//       </CardContent>

//       {/* Linha separadora discreta */}
//       <div className="px-6 py-2">
//         <div className="h-[1px] w-full bg-slate-200/60" />
//       </div>

//       {/* Footer simplificado: Apenas o botão de ação */}
//       <CardFooter className="px-6 pb-6 pt-2">
//         <Button
//           onClick={handleReserva}
//           variant="secondary"
//           size="sm"
//           className="w-full bg-slate-200 text-slate-600 hover:bg-denin hover:text-white font-black text-[11px] h-10 uppercase tracking-widest transition-all rounded-xl border-none shadow-sm"
//         >
//           {!mounted ? (
//             <Loader2 size={16} className="animate-spin" />
//           ) : isLogged ? (
//             "Solicitar Reserva"
//           ) : (
//             "Entrar para Reservar"
//           )}
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// }
