"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import BackgroundShapes from "@/components/visual/background-shapes";
import {
  Github,
  GraduationCap,
  Code2,
  Users,
  Rocket,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SobrePage() {
  const desenvolvedores = [
    {
      nome: "Camilla Barros",
      função: "Full Stack Developer",
      github: "https://github.com/cabarros3",
      foto: "https://avatars.githubusercontent.com/u/72764345?v=4",
    },
    {
      nome: "Nome do Colega",
      função: "Frontend Developer",
      github: "https://github.com/colega-usuario",
      foto: "https://github.com/colega-usuario.png",
    },
    // Adicione mais se houver
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <BackgroundShapes />
      <Header />

      <main className="grow flex flex-col items-center">
        {/* HERO SECTION - CONTEXTO ACADÊMICO */}
        <section className="max-w-4xl w-full px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-denin/10 text-denin text-sm font-bold mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <GraduationCap size={18} />
            IFPE Campus Igarassu
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Sobre o Projeto <span className="text-denin">e-Papirus</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Este sistema foi desenvolvido como requisito avaliativo para a
            disciplina de
            <strong> Desenvolvimento Web 1</strong>. O objetivo é aplicar
            conceitos de arquitetura cliente-servidor, manipulação de APIs REST
            com PHP e construção de interfaces modernas com Next.js e Tailwind
            CSS.
          </p>
        </section>

        {/* SEÇÃO DESENVOLVEDORES */}
        <section className="w-full max-w-6xl px-6 py-16">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-denin rounded-xl text-white shadow-lg shadow-denin/20">
              <Users size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Equipe de Desenvolvimento
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {desenvolvedores.map((dev, index) => (
              <div
                key={index}
                className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-denin/10 group-hover:ring-denin transition-all">
                    <img
                      src={dev.foto}
                      alt={dev.nome}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{dev.nome}</h3>
                    <p className="text-sm text-gray-500">{dev.função}</p>
                  </div>
                </div>
                <Link
                  href={dev.github}
                  target="_blank"
                  className="mt-6 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gray-50 text-gray-700 font-medium hover:bg-gray-900 hover:text-white transition-colors"
                >
                  <Github size={18} /> GitHub Profile
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* SEÇÃO GITHUB & PROJETO */}
        <section className="w-full max-w-6xl px-6 py-16 mb-20">
          <div className="bg-gray-900 rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-2xl">
            {/* Elemento visual decorativo de fundo */}
            <div className="absolute top-0 right-0 p-10 opacity-10 text-white pointer-events-none">
              <Code2 size={200} />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 text-denin mb-4">
                  <Rocket size={24} />
                  <span className="font-bold tracking-widest uppercase text-sm">
                    Open Source
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Acompanhe o desenvolvimento no GitHub
                </h2>
                <p className="text-gray-400 text-lg mb-8 max-w-xl">
                  O projeto utiliza metodologias ágeis e controle de versão
                  rigoroso. Você pode conferir o backlog, issues e o progresso
                  das sprints através do nosso GitHub Project oficial.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="https://github.com/seu-repositorio"
                    target="_blank"
                    className="flex items-center gap-2 px-8 py-4 bg-denin text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-denin/30"
                  >
                    <Github size={20} /> Repositório do Código
                  </Link>
                  <Link
                    href="https://github.com/users/seu-usuario/projects/X"
                    target="_blank"
                    className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold hover:bg-white hover:text-gray-900 transition-all"
                  >
                    GitHub Project <ExternalLink size={18} />
                  </Link>
                </div>
              </div>

              <div className="flex-1 w-full max-w-md">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Code2 size={18} className="text-denin" /> Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Next.js 15",
                      "TypeScript",
                      "Tailwind CSS",
                      "PHP 8",
                      "MySQL",
                      "Lucide React",
                      "Shadcn/UI",
                    ].map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-white/5 text-gray-300 text-xs rounded-md border border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
