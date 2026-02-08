'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 mt-24 w-full">
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20">
          {/* Coluna Logo e Manifesto */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Image src="/img/logo.png" alt="Logo" width={48} height={48} />
              <span className="text-black font-extrabold text-3xl md:text-4xl">
                <span className="text-denin">e</span>-Papirus
              </span>
            </div>
            <p className="text-base md:text-lg text-gray-500 leading-relaxed font-medium">
              Sua porta de entrada para o conhecimento.{' '}
              <br className="hidden lg:block" />
              Explore, aprenda e evolua conosco.
            </p>
          </div>

          {/* Links Rápidos - Plataforma */}
          <div>
            <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-8 text-gray-400">
              Plataforma
            </h4>
            <ul className="text-base md:text-lg font-bold text-gray-600 space-y-5">
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
            <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-8 text-gray-400">
              Suporte
            </h4>
            <ul className="text-base md:text-lg font-bold text-gray-600 space-y-5">
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

          {/* Newsletter */}
          <div>
            <h4 className="font-black text-sm uppercase tracking-[0.2em] mb-8 text-gray-400">
              Newsletter
            </h4>
            <p className="text-sm md:text-base font-medium text-gray-500 mb-6 leading-relaxed">
              Fique por dentro das novas obras e atualizações do acervo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-base w-full outline-none focus:ring-2 focus:ring-denin/10 focus:border-denin transition-all"
              />
              <button className="bg-denin text-white px-6 py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-denin/90 transition-all shadow-lg shadow-denin/20">
                OK
              </button>
            </div>
          </div>
        </div>

        {/* Linha Inferior de Copyright */}
        <div className="mt-24 pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            © {new Date().getFullYear()} e-Papirus. Tecnologia para Bibliotecas.
          </p>
          <div className="flex gap-6">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest cursor-default">
              Desenvolvido com Paixão
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
