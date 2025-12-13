import Image from "next/image";

export default function LoginScreen() {
  return (
    <div className="min-h-screen flex bg-rudy-blue/50 items-center justify-center  p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* usar o Image do nextjs */}
        <Image
          src="/img/papirus-img.png"
          width={200}
          height={200}
          alt="Logo do e-papirus"
          className="w-28 mx-auto"
        ></Image>

        {/* <img
          src="/img/papirus-img.png"
          alt="Logo"
          className="w-28 mx-auto"
        /> */}

        <h1 className="text-2xl font-semibold text-gray-800 text-center">
          Bem-vindo
        </h1>

        <p className="text-center text-gray-600">
          Selecione o seu tipo de conta
        </p>

        <div className="grid grid-cols-1 gap-3">
          {/* <button className="w-full py-3 rounded-xl bg-blue-400 text-white font-medium hover:bg-blue-600 transition"><a href="/aluno">Cadastrar como Aluno</a>
          </button>

          <button className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-400 transition">
            <a href="/professor">Cadastrar como Professor</a>  
          </button>
          
          <button className="w-full py-3 rounded-xl bg-blue-900 text-white font-medium hover:bg-blue-600 transition">
            <a href="/funcionario">Cadastrar como Funcionário</a>
          </button> */}

          <button className="w-full py-3 border-2 border-gray-500 rounded-xl text-gray-800 font-medium hover:bg-blue-500 hover:border-2 hover:border-white hover:text-white transition">
            <a href="/aluno">Cadastrar como Aluno</a>
          </button>

          <button className="w-full py-3 border-2 border-gray-500 rounded-xl text-gray-800 font-medium hover:bg-blue-500 hover:border-2 hover:border-white hover:text-white transition">
            <a href="/professor">Cadastrar como Professor</a>
          </button>

          <button className="w-full py-3 border-2 border-gray-500 rounded-xl text-gray-800 font-medium hover:bg-blue-500 hover:border-2 hover:border-white hover:text-white transition">
            <a href="/funcionario">Cadastrar como Funcionário</a>
          </button>
        </div>

          
        {/* <div className="mt-6 border-t pt-6">
          <h2 className="text-lg font-semibold text-center mb-3">
            Já possui uma conta?
          </h2>
          <form className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Senha"
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button className="w-full py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition">
              Entrar
            </button>
          </form>
        </div> */}
      </div>
    </div>
  );
}
