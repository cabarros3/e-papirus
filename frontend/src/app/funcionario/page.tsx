import { Button } from "@/components/ui/button";

export default function CadastroFuncionario() {
    return (
        <div className="min-h-screen bg-background flex flex-col">

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

                <form className="bg-[#dfeafb] p-8 rounded-2xl shadow-sm flex flex-col gap-4">

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

                    <button
                        type="button"
                        className="bg-blue-600 text-white py-3 rounded-xl mt-4 text-lg hover:bg-blue-700 transition"
                    >
                        Cadastrar
                    </button>

                </form>

            </div>

        </div>
    );
}
