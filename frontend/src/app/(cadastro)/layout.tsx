"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CadastroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getPageName = () => {
    if (pathname.includes("/aluno")) return "Aluno";
    if (pathname.includes("/professor")) return "Professor";
    if (pathname.includes("/funcionario")) return "Funcionário";
    return "Cadastro";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rudy-blue/50 p-4 relative">
      {/* CARD PRINCIPAL DIVIDIDO */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-gray-100 min-h-[600px]">
        {/* LADO ESQUERDO: Identidade e Ação de Voltar */}
        <div className="p-8 md:p-12 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col items-center justify-center text-center space-y-8">
          <div className="flex flex-col items-center">
            <Image
              src="/img/logo.png"
              alt="Logo e-Papirus"
              width={120}
              height={120}
              priority
              className="mb-4"
            />
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
              <span className="text-denin">e</span>-Papirus
            </h1>
            <div className="mt-4 px-4 py-1.5 bg-denin/10 text-denin rounded-full text-xs font-bold uppercase tracking-widest">
              Cadastro {getPageName()}
            </div>
          </div>

          <div className="space-y-4 w-full max-w-[280px]">
            <p className="text-gray-500 text-sm leading-relaxed">
              Já possui uma conta ou escolheu o perfil errado?
            </p>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-denin/30 hover:bg-gray-50 hover:text-denin transition-all group shadow-sm"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Voltar para o Login
            </Link>
          </div>
        </div>

        {/* LADO DIREITO: O Formulário (children) */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
          <main className="w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import Image from "next/image";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { usePathname } from "next/navigation";
// import Link from "next/link";

// export default function CadastroLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();

//   // Função para identificar o nome da página atual
//   const getPageName = () => {
//     if (pathname.includes("/aluno")) return "Aluno";
//     if (pathname.includes("/professor")) return "Professor";
//     if (pathname.includes("/funcionario")) return "Funcionário";
//     return "Cadastro";
//   };

//   return (
//     <div className="min-h-screen bg-rudy-blue/50 flex flex-col">
//       <div className="w-full max-w-md mx-auto text-center py-20 mt-[-30px] flex flex-col items-center">
//         <div className="py-5">
//           <Image
//             src="/img/logo.png"
//             alt="Logo e-Papirus"
//             width={112}
//             height={112}
//             priority
//             className="mx-auto mb-2"
//           />
//           <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
//             <span className="text-denin">e</span>-Papirus
//           </h1>
//         </div>

//         {/* Breadcrumb com links funcionais */}
//         <Breadcrumb className="mb-6 ">
//           <BreadcrumbList>
//             <BreadcrumbItem className="text-black">
//               <BreadcrumbLink asChild>
//                 <Link href="/">Home</Link>
//               </BreadcrumbLink>
//             </BreadcrumbItem>

//             <BreadcrumbSeparator />

//             <BreadcrumbItem className="text-black">
//               <BreadcrumbLink asChild>
//                 <Link href="/login">Login</Link>
//               </BreadcrumbLink>
//             </BreadcrumbItem>

//             <BreadcrumbSeparator />

//             <BreadcrumbItem>
//               <BreadcrumbPage className="font-semibold text-gray-900">
//                 {getPageName()}
//               </BreadcrumbPage>
//             </BreadcrumbItem>
//           </BreadcrumbList>
//         </Breadcrumb>

//         <main className="w-full">{children}</main>
//       </div>
//     </div>
//   );
// }
