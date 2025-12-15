import Image from 'next/image';

export default function Books() {
  return (

    <div className="bg-rudy-blue/50 min-h-screen flex justify-center items-center flex-col">

      <div className="w-full max-w-md mx-auto text-center mt-[-30px]">
        
      </div>

      <main className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <header className="mb-6">
          <Image
            src="/img/logo.png"
            alt="Logo e-Papirus"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-semibold text-gray-800 text-center">Cadastro de Livro</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">Área exclusiva para funcionários</p>
        </header>

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Código / Patrimônio"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />

            <input type="text" placeholder="Título do livro"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Autor"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />

            <input type="number" placeholder="Ano de publicação"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />

            <input type="text" placeholder="Gênero"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Editora"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />

            <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option>Status do livro</option>
              <option>Disponível</option>
              <option>Emprestado</option>
              <option>Reservado</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Cadastrar Livro
            </button>

            <a href="listar_livros.html"
              className="text-sm px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
              Ver lista de livros
            </a>
          </div>
        </form>

        <footer className="mt-6 text-xs text-gray-400">
          Acesso restrito — apenas funcionários podem cadastrar livros.
        </footer>
      </main>

    </div>

  );
}