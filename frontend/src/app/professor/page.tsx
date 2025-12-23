import { Button } from "@/components/ui/button";

export default function CadastroProfessor() {
  return (
    <div className="min-h-screen bg-rudy-blue/50 flex flex-col">

      {/* Topo */}
      <header className="flex justify-end p-6 mt-2">

        {/* Botão de Acesso componente */}
        <Button variant="default" size="lg" className="w-full sm:w-auto">
          Acessar o e-Papirus
        </Button>
      </header>

      {/* Conteúdo */}
      <div className="w-full max-w-md mx-auto text-center mt-[-30px] flex flex-col items-center">


        <img
          src="/img/logo.png"
          alt="Logo"
          className="w-28 mx-auto"
        />

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          <span className="text-denin">e</span>-Papirus
        </h1>
        <p className="text-gray-600 mt-1 mb-6">
          Cadastro do professor
        </p>





        <form className="w-200 max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">



          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <input type="text" placeholder="Nome completo"
              className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="CNBD"
              className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />

            <input type="text" placeholder="CPF"
              className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <input type="text" placeholder="Email"
              className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <input type="text" placeholder="Telefone"
              className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>



          <button className="w-full py-3 border-2 border-gray-500 rounded-xl text-gray-800 font-medium hover:bg-blue-500 hover:border-2 hover:border-white hover:text-white transition">
            <a href="/aluno">Cadastrar</a>
          </button>

        </form>





      </div>

    </div>
  );
}
