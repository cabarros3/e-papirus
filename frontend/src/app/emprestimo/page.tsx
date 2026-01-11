
export default function emprestimo() {
    return (
        <div className="min-h-screen bg-rudy-blue/50 flex flex-col">

            {/* Conteúdo */}
            <div className="w-full max-w-5xl mx-auto text-center mt-16 flex flex-col items-center px-4 space-y-2">


                <img
                    src="/img/logo.png"
                    alt="Logo"
                    className="w-15 mx-auto -mt-15"
                />

                <h1 className="text-2xl sm:text-2xl md:text-2xl font-bold -mt-1">
                    <span className="text-denin">e</span>-Papirus
                </h1>



                <form className="w-full max-w-5xl bg-white rounded-2xl shadow-lg p-8 md:p-30 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20">


                    <div className="text-left space-y-2">
                        <h2 className="text-lg font-semibold text-gray-800">Detalhes do livro</h2>
                        <p className="text-sm text-gray-700">Aqui vai a capa, título, autor e sinopse para combinar com o layout da referência.</p>
                    </div>

                    <div className="space-y-6 md:border-l md:border-gray-400 md:pl-10">

                        <div className="grid grid-cols-1 gap-4">
                            <input type="text" placeholder="Nome completo"
                                className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label htmlFor="data-emprestimo" className="mb-1 text-sm text-gray-700">Data do Empréstimo</label>
                                    <input id="data-emprestimo" type="date"
                                        className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="data-devolucao" className="mb-1 text-sm text-gray-700">Data da Devolução</label>
                                    <input id="data-devolucao" type="date"
                                        className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                                </div>
                        </div>


                        <button className="w-full py-3 border-2 border-gray-500 rounded-xl text-gray-800 font-medium hover:bg-blue-500 hover:border-2 hover:border-white hover:text-white transition">
                            <a href="##">fazer empréstimo</a>
                        </button>
                    </div>

                </form>





            </div>

        </div>
    );
}
