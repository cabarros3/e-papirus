import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-4 md:px-8 lg:px-16 mt-20 w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Coluna Logo */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Image src="/img/logo.png" alt="Logo" width={40} height={40} />
            <span className="font-bold text-denin text-xl">e-Papirus</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Sua porta de entrada para o conhecimento digital. Explore, aprenda e
            evolua conosco.
          </p>
        </div>

        {/* Links Rápidos */}
        <div>
          <h4 className="font-bold mb-4 text-gray-800">Plataforma</h4>
          <ul className="text-sm text-gray-600 space-y-3">
            <li>
              <a href="#" className="hover:text-denin transition">
                Início
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-denin transition">
                Categorias
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-denin transition">
                Novidades
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-denin transition">
                Mais lidos
              </a>
            </li>
          </ul>
        </div>

        {/* Suporte */}
        <div>
          <h4 className="font-bold mb-4 text-gray-800">Suporte</h4>
          <ul className="text-sm text-gray-600 space-y-3">
            <li>
              <a href="#" className="hover:text-denin transition">
                Central de Ajuda
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-denin transition">
                Termos de Uso
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-denin transition">
                Privacidade
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-denin transition">
                Contato
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-bold mb-4 text-gray-800">Newsletter</h4>
          <p className="text-xs text-gray-500 mb-4">
            Receba avisos sobre novos livros.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Seu e-mail"
              className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-1 focus:ring-denin"
            />
            <button className="bg-denin text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-denin/90 transition">
              OK
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-50 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} e-Papirus. Todos os direitos reservados.
      </div>
    </footer>
  );
}
