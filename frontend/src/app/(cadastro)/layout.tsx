"use client";

import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function CadastroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Função para identificar o nome da página atual
  const getPageName = () => {
    if (pathname.includes("/aluno")) return "Aluno";
    if (pathname.includes("/professor")) return "Professor";
    if (pathname.includes("/funcionario")) return "Funcionário";
    return "Cadastro";
  };

  return (
    <div className="min-h-screen bg-rudy-blue/50 flex flex-col">
      <div className="w-full max-w-md mx-auto text-center py-20 mt-[-30px] flex flex-col items-center">
        <div className="py-5">
          <Image
            src="/img/logo.png"
            alt="Logo e-Papirus"
            width={112}
            height={112}
            priority
            className="mx-auto mb-2"
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            <span className="text-denin">e</span>-Papirus
          </h1>
        </div>

        {/* Breadcrumb com links funcionais */}
        <Breadcrumb className="mb-6 ">
          <BreadcrumbList>
            <BreadcrumbItem className="text-black">
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem className="text-black">
              <BreadcrumbLink asChild>
                <Link href="/login">Login</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-gray-900">
                {getPageName()}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <main className="w-full">{children}</main>
      </div>
    </div>
  );
}
