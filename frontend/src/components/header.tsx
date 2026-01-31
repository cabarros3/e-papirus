"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, LogIn, Menu, X } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 1. O estado começa como null. Isso evita que o React tente
  // comparar um "false" (server) com um "true" (client) imediatamente.
  const [isLogged, setIsLogged] = useState<boolean | null>(null);

  const checkAuth = useCallback(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("bib_token");
      const user = localStorage.getItem("bib_user");
      // Só atualizamos o estado se o valor for diferente do atual
      const loggedStatus = !!token && !!user;
      setIsLogged(loggedStatus);
    }
  }, []);

  useEffect(() => {
    // Usamos um timeout de 0 ou queueMicrotask para tirar a execução
    // do fluxo síncrono do efeito, resolvendo o aviso do React.
    const timeoutId = setTimeout(checkAuth, 0);

    window.addEventListener("storage", checkAuth);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("storage", checkAuth);
    };
  }, [checkAuth]);

  const handleAccessAction = () => {
    setIsMenuOpen(false);
    if (isLogged) {
      router.push("/dashboard/user");
    } else {
      router.push("/login");
    }
  };

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-[100]">
      {/* Container: Max-width 1600px | Padding-X: 32px (px-8) */}
      <div className="max-w-[1600px] mx-auto flex items-center h-20 px-8 relative">
        {/* ESQUERDA: LOGO */}
        <div className="flex-shrink-0 z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/img/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="group-hover:rotate-3 transition-transform"
            />
            <span className="font-black text-2xl tracking-tighter text-gray-900">
              <span className="text-denin">e</span>-Papirus
            </span>
          </Link>
        </div>

        {/* CENTRO: NAVEGAÇÃO CENTRALIZADA (LG+) */}
        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-12">
          <Link
            href="/"
            className="text-xl font-light text-gray-500 hover:text-denin transition-colors"
          >
            Início
          </Link>
          <Link
            href="/resultados"
            className="text-xl font-light text-gray-500 hover:text-denin transition-colors"
          >
            Acervo
          </Link>
          <Link
            href="/sobre"
            className="text-xl font-light text-gray-500 hover:text-denin transition-colors"
          >
            Sobre
          </Link>
        </nav>

        {/* DIREITA: AÇÕES */}
        <div className="flex items-center gap-4 ml-auto z-10">
          <div className="hidden md:block min-w-[180px]">
            {/* Enquanto isLogged for null, mostramos um estado neutro (Skeleton) */}
            {isLogged === null ? (
              <div className="w-full h-11 bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
            ) : (
              <Button
                onClick={handleAccessAction}
                variant={isLogged ? "outline" : "default"}
                className={`w-full px-6 h-11 font-black text-xs uppercase tracking-widest transition-all rounded-xl shadow-sm ${
                  isLogged
                    ? "border-2 border-denin text-denin hover:bg-denin hover:text-white"
                    : "bg-denin hover:bg-denin/90 text-white border-2 border-transparent"
                }`}
              >
                {isLogged ? (
                  <div className="flex items-center gap-2">
                    <LayoutDashboard size={16} /> Painel do Usuário
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn size={16} /> Acessar Sistema
                  </div>
                )}
              </Button>
            )}
          </div>

          <button
            className="p-2 text-gray-600 lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl z-50 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-6 gap-2 text-left">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-xl font-light text-gray-600 p-4 hover:bg-gray-50 rounded-2xl transition-colors"
            >
              Início
            </Link>
            <Link
              href="/resultados"
              onClick={() => setIsMenuOpen(false)}
              className="text-xl font-light text-gray-600 p-4 hover:bg-gray-50 rounded-2xl transition-colors"
            >
              Acervo
            </Link>
            <Link
              href="/sobre"
              onClick={() => setIsMenuOpen(false)}
              className="text-xl font-light text-gray-600 p-4 hover:bg-gray-50 rounded-2xl transition-colors"
            >
              Sobre
            </Link>

            <div className="h-px bg-gray-100 my-4 mx-4" />

            <div className="px-4 pb-4">
              <Button
                onClick={handleAccessAction}
                variant={isLogged ? "outline" : "default"}
                className={`w-full h-14 font-black text-sm uppercase tracking-widest rounded-2xl ${
                  isLogged
                    ? "border-2 border-denin text-denin"
                    : "bg-denin text-white"
                }`}
              >
                {isLogged ? "Ir para o Painel" : "Acessar Sistema"}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// "use client";

// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { Button } from "./ui/button";
// import Image from "next/image";
// import Link from "next/link";
// import { LayoutDashboard, LogIn } from "lucide-react";

// export default function Header() {
//   const router = useRouter();

//   // Inicialização síncrona para evitar o erro de cascading renders
//   const [isLogged, setIsLogged] = useState(() => {
//     if (typeof window !== "undefined") {
//       const token = localStorage.getItem("bib_token");
//       const user = localStorage.getItem("bib_user");
//       return !!token && !!user;
//     }
//     return false;
//   });

//   // Sincroniza o estado caso o localStorage mude em outras abas
//   useEffect(() => {
//     const checkAuth = () => {
//       const token = localStorage.getItem("bib_token");
//       const user = localStorage.getItem("bib_user");
//       setIsLogged(!!token && !!user);
//     };

//     window.addEventListener("storage", checkAuth);
//     return () => window.removeEventListener("storage", checkAuth);
//   }, []);

//   const handleAccessAction = () => {
//     if (isLogged) {
//       router.push("/dashboard/user");
//     } else {
//       router.push("/login");
//     }
//   };

//   return (
//     <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
//       {/* Container com padding lateral de 32px (px-8) */}
//       <div className="max-w-[1600px] mx-auto flex justify-between items-center h-20 px-8">
//         {/* Lado Esquerdo: Identidade */}
//         <div className="flex items-center gap-12">
//           <Link href="/" className="flex items-center gap-2 group shrink-0">
//             <Image
//               src="/img/logo.png"
//               alt="Logo"
//               width={40}
//               height={40}
//               className="group-hover:rotate-3 transition-transform"
//             />
//             <span className="font-black text-2xl">
//               <span className="text-denin">e</span>-Papirus
//             </span>
//           </Link>

//           {/* Navegação integrada ao lado da logo para melhor fluxo visual */}
//           <nav className="hidden md:flex items-center gap-8">
//             <Link
//               href="/"
//               className="text-xl font-light text-gray-500 hover:text-denin transition-colors"
//             >
//               Início
//             </Link>
//             <Link
//               href="/resultados"
//               className="text-xl font-light text-gray-500 hover:text-denin transition-colors"
//             >
//               Acervo
//             </Link>
//             <Link
//               href="/sobre"
//               className="text-xl font-light text-gray-500 hover:text-denin transition-colors"
//             >
//               Sobre
//             </Link>
//           </nav>
//         </div>

//         {/* Lado Direito: Ações */}
//         <div className="flex items-center gap-4">
//           <Button
//             onClick={handleAccessAction}
//             variant={isLogged ? "outline" : "default"}
//             size="sm"
//             className={`px-6 h-11 font-black text-xs uppercase tracking-widest transition-all rounded-xl shadow-sm ${
//               isLogged
//                 ? "border-2 border-denin text-denin hover:bg-denin hover:text-white"
//                 : "bg-denin hover:bg-denin/90 text-white"
//             }`}
//           >
//             {isLogged ? (
//               <div className="flex items-center gap-2">
//                 <LayoutDashboard size={16} />
//                 Painel do Usuário
//               </div>
//             ) : (
//               <div className="flex items-center gap-2">
//                 <LogIn size={16} />
//                 Acessar Sistema
//               </div>
//             )}
//           </Button>
//         </div>
//       </div>
//     </header>
//   );
// }

// "use client";

// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { Button } from "./ui/button";
// import Image from "next/image";
// import Link from "next/link";
// import { LayoutDashboard, LogIn } from "lucide-react";

// export default function Header() {
//   const router = useRouter();

//   // Inicialização síncrona: o React define o valor inicial antes do primeiro render
//   const [isLogged, setIsLogged] = useState(() => {
//     // Verificamos se estamos no navegador (Client Side) antes de acessar localStorage
//     if (typeof window !== "undefined") {
//       const token = localStorage.getItem("bib_token");
//       const user = localStorage.getItem("bib_user");
//       return !!token && !!user;
//     }
//     return false;
//   });

//   // Mantemos o useEffect apenas para sincronizar caso o localStorage mude em outra aba
//   // (Opcional, mas boa prática para evitar dessincronia)
//   useEffect(() => {
//     const checkAuth = () => {
//       const token = localStorage.getItem("bib_token");
//       const user = localStorage.getItem("bib_user");
//       setIsLogged(!!token && !!user);
//     };

//     window.addEventListener("storage", checkAuth);
//     return () => window.removeEventListener("storage", checkAuth);
//   }, []);

//   const handleAccessAction = () => {
//     if (isLogged) {
//       router.push("/dashboard/user");
//     } else {
//       router.push("/login");
//     }
//   };

//   return (
//     <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
//       <div className="max-w-[1440px] mx-auto flex justify-between items-center p-4 md:px-8 lg:px-16">
//         {/* Lado Esquerdo: Identidade */}
//         <Link href="/" className="flex items-center gap-2 group">
//           <Image
//             src="/img/logo.png"
//             alt="Logo"
//             width={32}
//             height={32}
//             className="group-hover:rotate-3 transition-transform"
//           />
//           <span className="font-bold text-denin text-lg tracking-tight">
//             e-Papirus
//           </span>
//         </Link>

//         {/* Centro: Navegação */}
//         <nav className="hidden md:flex items-center gap-8">
//           <Link
//             href="/"
//             className="text-sm font-medium text-gray-600 hover:text-denin transition"
//           >
//             Início
//           </Link>
//           <Link
//             href="/resultados"
//             className="text-sm font-medium text-gray-600 hover:text-denin transition"
//           >
//             Acervo
//           </Link>
//           <Link
//             href="/sobre"
//             className="text-sm font-medium text-gray-600 hover:text-denin transition"
//           >
//             Sobre
//           </Link>
//         </nav>

//         {/* Lado Direito: Ação Dinâmica */}
//         <div className="flex items-center gap-4 md:gap-6">
//           <Button
//             onClick={handleAccessAction}
//             variant={isLogged ? "outline" : "default"}
//             size="sm"
//             className={`px-5 font-semibold shadow-sm flex items-center gap-2 transition-all ${
//               isLogged ? "border-denin text-denin hover:bg-denin/5" : ""
//             }`}
//           >
//             {isLogged ? (
//               <>
//                 <LayoutDashboard size={16} />
//                 Ir para o Painel
//               </>
//             ) : (
//               <>
//                 <LogIn size={16} />
//                 Acessar o e-Papirus
//               </>
//             )}
//           </Button>
//         </div>
//       </div>
//     </header>
//   );
// }
