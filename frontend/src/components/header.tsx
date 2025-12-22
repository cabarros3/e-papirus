"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const router = useRouter();

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center p-4 md:px-8 lg:px-16">
        {/* Lado Esquerdo: Identidade */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/img/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="group-hover:rotate-3 transition-transform"
          />
          <span className="font-bold text-denin text-lg tracking-tight">
            e-Papirus
          </span>
        </Link>

        {/* Centro: Links de Navegação (Agora incluídos aqui) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-denin transition"
          >
            Início
          </Link>
          <Link
            href="/resultados"
            className="text-sm font-medium text-gray-600 hover:text-denin transition"
          >
            Acervo
          </Link>
          <Link
            href="/sobre"
            className="text-sm font-medium text-gray-600 hover:text-denin transition"
          >
            Sobre
          </Link>
        </nav>

        {/* Lado Direito: Ações de Acesso */}
        <div className="flex items-center gap-4 md:gap-6">
          <Button
            onClick={() => router.push("/login")}
            variant="default"
            size="sm"
            className="px-5 font-semibold shadow-sm"
          >
            Acessar o e-Papirus
          </Button>
        </div>
      </div>
    </header>
  );
}
// "use client"; // Necessário para usar hooks

// import { useRouter } from "next/navigation";
// import { Button } from "./ui/button";

// export default function Header() {
//   const router = useRouter();

//   return (
//     <header className="flex justify-center sm:justify-end p-4 sm:p-5">
//       <nav>
//         <Button
//           onClick={() => router.push("/login")}
//           variant="default"
//           size="lg"
//           className="w-full sm:w-auto"
//         >
//           Acessar o e-Papirus
//         </Button>
//       </nav>
//     </header>
//   );
// }
