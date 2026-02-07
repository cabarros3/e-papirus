"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-20 w-full">
      {/* Container com largura máxima de 1600px e padding lateral de 32px (px-8) */}
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
          {/* Coluna Logo e Manifesto */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Image src="/img/logo.png" alt="Logo" width={40} height={40} />
              <span className="text-black font-bold text-3xl">
                <span className="text-denin">e</span>-Papirus
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Sua porta de entrada para o conhecimento.{" "}
              <br className="hidden lg:block" />
              Explore, aprenda e evolua conosco.
            </p>
          </div>

          {/* Links Rápidos - Plataforma */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-gray-400">
              Plataforma
            </h4>
            <ul className="text-sm font-bold text-gray-600 space-y-4">
              <li>
                <Link href="/" className="hover:text-denin transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/resultados"
                  className="hover:text-denin transition-colors"
                >
                  Categorias
                </Link>
              </li>
              <li>
                <Link
                  href="/resultados"
                  className="hover:text-denin transition-colors"
                >
                  Novidades
                </Link>
              </li>
              <li>
                <Link
                  href="/resultados"
                  className="hover:text-denin transition-colors"
                >
                  Mais lidos
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-gray-400">
              Suporte
            </h4>
            <ul className="text-sm font-bold text-gray-600 space-y-4">
              <li>
                <Link
                  href="/ajuda"
                  className="hover:text-denin transition-colors"
                >
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link
                  href="/termos"
                  className="hover:text-denin transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="hover:text-denin transition-colors"
                >
                  Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="hover:text-denin transition-colors"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter e Engajamento */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-gray-400">
              Newsletter
            </h4>
            <p className="text-xs font-medium text-gray-500 mb-4 leading-relaxed">
              Fique por dentro das novas obras e atualizações do acervo.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm w-full outline-none focus:ring-2 focus:ring-denin/10 focus:border-denin transition-all"
              />
              <button className="bg-denin text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-denin/90 transition-all shadow-lg shadow-denin/20">
                OK
              </button>
            </div>
          </div>
        </div>

        {/* Linha Inferior de Copyright */}
        <div className="mt-20 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            © {new Date().getFullYear()} e-Papirus. Tecnologia para Bibliotecas.
          </p>
          <div className="flex gap-6">
            {/* Você pode adicionar ícones de redes sociais aqui no futuro */}
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest cursor-default">
              Desenvolvido com Paixão
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
