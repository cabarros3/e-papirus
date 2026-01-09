"use client";

import Image from 'next/image';
import { useState, useEffect} from 'react';
import { AuthorService } from '@/services/author-service';
import { Autor } from '@/types/autores';

export default function Books() {


  // variáveis para criar autor
  const [autor, setAutor] = useState('');
  const authorService = new AuthorService();
 

  //  Criar novo autor
  const criarAutor = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação dos campos obrigatórios
    if (!autor) {
      alert('Preencha os campos.');
      return;
    }

    try {
      const dados = { nome_autor: autor };
      const resultado = await AuthorService.createAuthor(dados);
      setAutor('');

      window.dispatchEvent(new Event('autorCriado'));

    } catch (error) {
      console.log('Erro ao criar: ' + error);
    }
  };





  // variáveis para listar autores
  const [autores, setAutores] = useState<Autor[]>([]);
  const [autorSelecionado, setAutorSelecionado] = useState('');

  useEffect(() => {
    buscarAutores();

    // Escutar o evento de autor criado
    const handleAutorCriado = () => {
      buscarAutores();
    };

    window.addEventListener('autorCriado', handleAutorCriado);

    // Limpar o listener quando o componente desmontar
    return () => {
      window.removeEventListener('autorCriado', handleAutorCriado);
    };
  }, []);

  

  const buscarAutores = async () => {
    try {
      const resultado = await authorService.getAllAuthors();
      setAutores(resultado);
    } catch (error) {
      console.error('Erro ao buscar autores:', error);
    }
  };



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


              <input type="text" placeholder="Título do livro"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />

              <input type="text" placeholder="Editora"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="Cidade de publicação"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />

              <input type="number" placeholder="Ano de publicação"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />

              <input type="text" placeholder="Capa"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <textarea placeholder='Nota' className="w-full h-30 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" name="" id=""></textarea>
            </div>

            <div className="space-y-6">
              {/* Seção Autor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <select
                  value={autorSelecionado}
                  onChange={(e) => setAutorSelecionado(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Selecionar Autor</option>
                  {autores.map((autor) => (
                    <option key={autor.id_autor} value={autor.id_autor}>
                      {autor.nome_autor}
                    </option>
                  ))}
                </select>





                {/* Direita: Input + Botão */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar novo autor..."
                    onChange={(e) => setAutor(e.target.value)}
                    value={autor}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button onClick={criarAutor} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold">
                    +
                  </button>
                </div>




              </div>

              {/* Seção Assunto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Esquerda: Select */}
                <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                  <option value="">Selecionar Assunto</option>
                </select>

                {/* Direita: Input + Botão */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar novo Assunto..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold">
                    +
                  </button>
                </div>
              </div>
            </div>





            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">



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