"use client";
import { ArrowLeft, Calendar, Loader2, User, BookOpen } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import emprestimoService from "@/services/emprestimo-service";
import { ExemplaresService, LivroComExemplares } from "@/services/exemplar-service";

export default function Emprestimo() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [idExemplar, setIdExemplar] = useState("");
    const [idPessoa, setIdPessoa] = useState("");
    const [dataEmprestimo, setDataEmprestimo] = useState("");
    const [dataPrevista, setDataPrevista] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState<"sucesso" | "erro" | "">("");
    
    const [livrosComExemplares, setLivrosComExemplares] = useState<LivroComExemplares[]>([]);
    const [livroSelecionado, setLivroSelecionado] = useState("");
    const [livroDetalhes, setLivroDetalhes] = useState<any>(null);
    const [estudantes, setEstudantes] = useState<any[]>([]);
    const [exemplaresDisponiveis, setExemplaresDisponiveis] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Preencher automaticamente a data do empréstimo com a data atual
    useEffect(() => {
        const dataHoje = new Date().toISOString().split('T')[0];
        setDataEmprestimo(dataHoje);
    }, []);

    // Buscar pessoas e livros com exemplares
    useEffect(() => {
        const carregarDados = async () => {
            try {
                const [resPessoas, livrosData] = await Promise.all([
                    fetch('http://localhost:8000/api/pessoas/'),
                    ExemplaresService.getLivrosComExemplares()
                ]);
                
                const pessoas = await resPessoas.json();
                
                setEstudantes(pessoas.data || []);
                setLivrosComExemplares(livrosData || []);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setLoading(false);
            }
        };
        
        carregarDados();
    }, []);

    // Filtrar exemplares disponíveis quando um livro é selecionado
    useEffect(() => {
        if (livroSelecionado) {
            // Encontrar o livro selecionado
            const livro = livrosComExemplares.find(
                (l) => l.id_livro === parseInt(livroSelecionado)
            );
            
            if (livro) {
                // Filtrar apenas exemplares disponíveis
                const exemplaresFiltrados = livro.exemplares.filter(
                    (ex) => ex.disponibilidade === 'disponivel'
                );
                setExemplaresDisponiveis(exemplaresFiltrados);
                setIdExemplar(""); // Limpar seleção de exemplar
                
                // Buscar detalhes completos do livro selecionado
                const buscarDetalhesLivro = async () => {
                    try {
                        const response = await fetch(`http://localhost:8000/api/livros/?id=${livroSelecionado}`);
                        const data = await response.json();
                        if (data.data) {
                            setLivroDetalhes(data.data);
                        }
                    } catch (error) {
                        console.error('Erro ao buscar detalhes do livro:', error);
                    }
                };
                buscarDetalhesLivro();
            } else {
                setExemplaresDisponiveis([]);
                setLivroDetalhes(null);
            }
        } else {
            setExemplaresDisponiveis([]);
            setLivroDetalhes(null);
        }
    }, [livroSelecionado, livrosComExemplares]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        console.log('Estados:', { idExemplar, idPessoa, dataEmprestimo, dataPrevista });

        if (!idExemplar || !idPessoa || !dataEmprestimo || !dataPrevista) {
            alert('Preencha todos os campos!');
            setTipoMensagem("erro");
            setIsSubmitting(false);
            return;
        }

        try {
            const dados = {
                id_exemplar: parseInt(idExemplar),
                id_pessoa: parseInt(idPessoa),
                data_emprestimo: dataEmprestimo,
                data_prevista: dataPrevista,
            };
            
            console.log('Dados a enviar:', dados);
            const data = await emprestimoService.create(dados);
            console.log('Resposta:', data);
            
            if (data && (data.id_emprestimo || data.status === 'sucesso')) {
                alert('Empréstimo realizado com sucesso!');
                setTipoMensagem("sucesso");
                setIdExemplar("");
                setIdPessoa("");
                setLivroSelecionado("");
                setDataEmprestimo("");
                setDataPrevista("");
                setTimeout(() => {
                    router.push("/dashboard/staff/");
                }, 1500);
            }
        } catch (error: any) {
            console.error('Erro completo:', error);
            alert('Erro ao realizar empréstimo: ' + error.message);
            setTipoMensagem("erro");
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
                    <h1 className="text-2xl font-bold text-gray-900">Empréstimo de Livro</h1>
                    <p className="text-sm text-gray-500 font-medium">
                        Realize o empréstimo de um exemplar para um usuário.
                    </p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Informações do Livro */}
                    {livroDetalhes ? (
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <img
                                src={livroDetalhes.capa || 'https://via.placeholder.com/160x224?text=Sem+Capa'}
                                alt={livroDetalhes.titulo}
                                className="w-40 h-56 object-cover rounded-xl shadow-md"
                            />
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{livroDetalhes.titulo}</h2>
                                <p className="text-sm text-gray-700">Editora: {livroDetalhes.editora || 'N/A'}</p>
                                {livroDetalhes.cidade_publicacao && (
                                    <p className="text-sm text-gray-700">Cidade: {livroDetalhes.cidade_publicacao}</p>
                                )}
                                <p className="text-sm text-gray-700">Ano: {livroDetalhes.ano_publicacao || 'N/A'}</p>
                                {livroDetalhes.descricao_fisica && (
                                    <p className="text-sm text-gray-700">Descrição física: {livroDetalhes.descricao_fisica}</p>
                                )}
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
                            <p className="text-gray-500 font-medium">Selecione um livro para ver os detalhes</p>
                        </div>
                    )}

                    {/* Formulário de Empréstimo */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col justify-center space-y-8"
                    >
                        {/* Seleção do livro */}
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={14} /> Selecionar Livro
                            </h2>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600">Livro</label>
                                <select
                                    value={livroSelecionado}
                                    onChange={(e) => setLivroSelecionado(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none bg-white"
                                >
                                    <option value="">Nenhum Livro</option>
                                    {livrosComExemplares.map((livro) => {
                                        const exemplaresDisp = livro.exemplares.filter(
                                            ex => ex.disponibilidade === 'disponivel'
                                        ).length;
                                        return (
                                            <option key={livro.id_livro} value={livro.id_livro}>
                                                {livro.titulo} ({exemplaresDisp} disponível{exemplaresDisp !== 1 ? 'eis' : ''})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        {/* Seleção do estudante */}
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} /> Selecionar Estudante
                            </h2>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600">Estudante</label>
                                <select
                                    name="id_pessoa"
                                    value={idPessoa}
                                    onChange={(e) => setIdPessoa(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none bg-white"
                                >
                                    <option value="">Selecione...</option>
                                    {estudantes.map((e) => (
                                        <option key={e.id_pessoa} value={e.id_pessoa}>{e.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Seleção do exemplar */}
                        <div className="space-y-6 pt-6 border-t border-gray-50">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={14} /> Selecionar Exemplar
                            </h2>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600">Exemplar</label>
                                <select
                                    name="id_exemplar"
                                    value={idExemplar}
                                    onChange={(e) => setIdExemplar(e.target.value)}
                                    required
                                    disabled={loading || !livroSelecionado}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {!livroSelecionado ? 'Selecione um livro primeiro...' : 'Selecione um exemplar...'}
                                    </option>
                                    {exemplaresDisponiveis.map((ex) => (
                                        <option key={ex.id_exemplar} value={ex.id_exemplar}>
                                            Exemplar #{ex.numero_exemplar} - {ex.localizacao || 'Sem localização'}
                                        </option>
                                    ))}
                                </select>
                                {livroSelecionado && exemplaresDisponiveis.length === 0 && !loading && (
                                    <p className="text-xs text-red-500">Nenhum exemplar disponível para este livro</p>
                                )}
                            </div>
                        </div>

                        {/* Datas do empréstimo */}
                        <div className="space-y-6 pt-6 border-t border-gray-50">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} /> Datas do Empréstimo
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Data do Empréstimo</label>
                                    <input
                                        name="data_emprestimo"
                                        type="date"
                                        value={dataEmprestimo}
                                        onChange={(e) => setDataEmprestimo(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Data prevista para devolução</label>
                                    <input
                                        name="data_prevista"
                                        type="date"
                                        value={dataPrevista}
                                        onChange={(e) => setDataPrevista(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-denin text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-xl shadow-denin/20 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>Realizar Empréstimo</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}