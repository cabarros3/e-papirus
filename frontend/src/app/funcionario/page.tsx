import { Button } from "@/components/ui/button";

export default function CadastroFuncionario() {
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
            <div className="w-full max-w-md mx-auto text-center mt-[-30px]">

                <img
                    src="/img/logo.png"
                    alt="Logo"
                    className="w-28 mx-auto"
                />

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                    <span className="text-denin">e</span>-Papirus
                </h1>
                <p className="text-gray-600 mt-1 mb-6">
                    Cadastro do funcionário
                </p>

                <form className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">

                    <div className="text-left">
                        <label className="font-medium">Nome Completo</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-xl bg-[#e8f1ff] outline-none mt-1"
                            placeholder="Digite o nome"
                        />
                    </div>

                    <div className="text-left">
                        <label className="font-medium">CPF (Apenas Números)</label>
                        <input
                            type="text"
                            maxLength={11}
                            className="w-full p-3 rounded-xl bg-[#e8f1ff] outline-none mt-1"
                            placeholder="00000000000"
                        />
                    </div>

                    <div className="text-left">
                        <label className="font-medium">Cargo (Função na Biblioteca)</label>
                        <select
                            className="w-full p-3 rounded-xl bg-[#e8f1ff] outline-none mt-1"
                        >
                            <option value="">Selecione...</option>
                            <option value="bibliotecario">Bibliotecário</option>
                            <option value="auxiliar">Auxiliar</option>
                            <option value="estagiario">Estagiário</option>
                        </select>
                    </div>

                    <button className="w-full py-3 border-2 border-gray-500 rounded-xl text-gray-800 font-medium hover:bg-blue-500 hover:border-2 hover:border-white hover:text-white transition">
                        <a href="/aluno">Cadastrar</a>
                    </button>

                </form>

            </div>

        </div>
    );
}
