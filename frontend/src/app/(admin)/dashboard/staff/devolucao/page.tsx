"use client";
import { ArrowLeft, Calendar, User, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import emprestimoService from "@/services/emprestimo-service";
import { toast } from "sonner";

export default function Devolucao() {
    const [emprestimoSelecionado, setEmprestimoSelecionado] = useState("");
    const [idExemplarBusca, setIdExemplarBusca] = useState("");
    const [emprestimosAtivos, setEmprestimosAtivos] = useState<any[]>([]);
    const [livroDetalhes, setLivroDetalhes] = useState<any>(null);
    const [pessoaNome, setPessoaNome] = useState("");
    const [dataEmprestimo, setDataEmprestimo] = useState("");
    const [dataPrevista, setDataPrevista] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mensagemErro, setMensagemErro] = useState("");



    // Buscar empréstimo por ID do exemplar
    const buscarEmprestimoPorExemplar = async () => {
        if (!idExemplarBusca) {
            setMensagemErro("Digite o ID do exemplar");
            return;
        }

        setLoading(true);
        setMensagemErro("");

        try {
            const response = await fetch('http://localhost:8000/api/emprestimos/');
            const data = await response.json();

            // Buscar empréstimo ativo desse exemplar
            const emprestimo = (data.data || []).find(
                (emp: any) => emp.id_exemplar === parseInt(idExemplarBusca) && emp.data_devolucao === null
            );

            if (emprestimo) {
                setEmprestimoSelecionado(emprestimo.id_emprestimo.toString());
                setPessoaNome(emprestimo.nome_pessoa || "Não encontrado");
                setDataEmprestimo(emprestimo.data_emprestimo);
                setDataPrevista(emprestimo.data_prevista);

                // Buscar detalhes do livro
                const responseLivro = await fetch(`http://localhost:8000/api/livros/?id=${emprestimo.id_livro}`);
                const dataLivro = await responseLivro.json();
                if (dataLivro.data) {
                    setLivroDetalhes(dataLivro.data);
                }
            } else {
                setMensagemErro("Nenhum empréstimo ativo encontrado para este exemplar");
                limparDados();
            }
        } catch (error) {
            console.error('Erro ao buscar empréstimo:', error);
            setMensagemErro("Erro ao buscar empréstimo");
            limparDados();
        } finally {
            setLoading(false);
        }
    };

    const limparDados = () => {
        setEmprestimoSelecionado("");
        setLivroDetalhes(null);
        setPessoaNome("");
        setDataEmprestimo("");
        setDataPrevista("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            buscarEmprestimoPorExemplar();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!emprestimoSelecionado) {
            alert("Selecione um empréstimo para devolver");
            return;
        }

        setIsSubmitting(true);
        try {
            await emprestimoService.devolver(parseInt(emprestimoSelecionado));
            try {
                toast.success("Devolução realizada com sucesso!");
            }
            catch (error) {
                console.error("Erro ao exibir toast:", error);
            }

            // Recarregar empréstimos ativos
            const response = await fetch('http://localhost:8000/api/emprestimos/');
            const data = await response.json();
            const ativos = (data.data || []).filter((emp: any) => emp.data_devolucao === null);
            setEmprestimosAtivos(ativos);

            // Limpar seleção
            setEmprestimoSelecionado("");
            setIdExemplarBusca("");
            limparDados();
        } catch (error: any) {
            alert("Erro ao realizar devolução: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/staff/"
                    className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                    <ArrowLeft size={20} className="text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Devolução de Livro</h1>
                    <p className="text-sm text-gray-500 font-medium">
                        Realize a devolução de um exemplar emprestado.
                    </p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Informações do Livro - Lado Esquerdo */}
                    {livroDetalhes ? (
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <img
                                src={livroDetalhes.capa || 'https://via.placeholder.com/160x224?text=Sem+Capa'}
                                alt={livroDetalhes.titulo}
                                className="w-40 h-56 object-cover rounded-xl shadow-md"
                            />
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{livroDetalhes.titulo}</h2>
                                <p className="text-sm text-gray-700">Autor: {livroDetalhes.nomes_autores || 'N/A'}</p>
                                <p className="text-sm text-gray-700">Ano: {livroDetalhes.ano_publicacao || 'N/A'}</p>
                                {livroDetalhes.nota_resumo && (
                                    <p className="text-sm text-gray-700 mt-2">
                                        <span className="font-bold">Sobre:</span> {livroDetalhes.nota_resumo}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <BookOpen size={64} className="text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">Selecione um empréstimo para ver os detalhes</p>
                        </div>
                    )}

                    {/* Formulário de Devolução - Lado Direito */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col justify-center space-y-8"
                    >
                        {/* Seleção do exemplar */}
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={14} /> Buscar por Exemplar
                            </h2>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600">ID do Exemplar</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={idExemplarBusca}
                                        onChange={(e) => setIdExemplarBusca(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Digite o ID do exemplar"
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={buscarEmprestimoPorExemplar}
                                        disabled={loading}
                                        className="px-6 py-3 bg-denin text-white rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Buscar"}
                                    </button>
                                </div>
                                {mensagemErro && (
                                    <p className="text-xs text-red-500 mt-1">{mensagemErro}</p>
                                )}
                            </div>
                        </div>

                        {/* CÓDIGO ANTIGO - Select com lista de empréstimos
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={14} /> Selecionar Empréstimo
                            </h2>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600">Empréstimo Ativo</label>
                                <select
                                    value={emprestimoSelecionado}
                                    onChange={(e) => setEmprestimoSelecionado(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none bg-white"
                                    required
                                >
                                    <option value="">Selecione um empréstimo...</option>
                                    {emprestimosAtivos.map((emp: any) => (
                                        <option key={emp.id_emprestimo} value={emp.id_emprestimo}>
                                            Empréstimo #{emp.id_emprestimo} - Exemplar #{emp.id_exemplar}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        */}

                        {/* Solicitado por */}
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} /> Solicitado por
                            </h2>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600">Estudante</label>
                                <input
                                    type="text"
                                    value={pessoaNome || "Selecione um empréstimo"}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Datas */}
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} /> Informações
                            </h2>

                            <div className="space-y-4">
                                {/* Data do empréstimo */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">
                                        Data do empréstimo :
                                    </label>
                                    <input
                                        type="date"
                                        value={dataEmprestimo}
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700"
                                    />
                                </div>

                                {/* Data prevista de devolução */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">
                                        Data prevista de devolução :
                                    </label>
                                    <input
                                        type="date"
                                        value={dataPrevista}
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botão */}
                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting || !emprestimoSelecionado}
                                className="w-full bg-denin text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-xl shadow-denin/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>Realizar Devolução</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
