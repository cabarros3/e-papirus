"use client";
import { ArrowLeft, Loader2, BookOpen, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Reserva() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [idExemplar, setIdExemplar] = useState("");
    const [exemplarStatus, setExemplarStatus] = useState<"disponivel" | "indisponivel" | null>(null);
    const [exemplarDetalhes, setExemplarDetalhes] = useState<any>(null);
    const [livroDetalhes, setLivroDetalhes] = useState<any>(null);
    const [verificando, setVerificando] = useState(false);

    // Verificar disponibilidade do exemplar quando ID é digitado
    useEffect(() => {
        const verificarExemplar = async () => {
            if (!idExemplar || idExemplar.trim() === "") {
                setExemplarStatus(null);
                setExemplarDetalhes(null);
                setLivroDetalhes(null);
                return;
            }

            setVerificando(true);
            try {
                const response = await fetch(`http://localhost:8000/api/exemplares/`);
                const data = await response.json();

                console.log('Resposta da API:', data);

                if (data.data && Array.isArray(data.data)) {
                    const exemplar = data.data.find((ex: any) => ex.id_exemplar === parseInt(idExemplar));
                    
                    if (exemplar) {
                        setExemplarDetalhes(exemplar);
                        console.log('Exemplar encontrado:', exemplar);
                        console.log('Disponibilidade:', exemplar.disponibilidade);
                        
                        // Buscar detalhes do livro
                        if (exemplar.id_livro) {
                            const resLivro = await fetch(`http://localhost:8000/api/livros/`);
                            const dataLivro = await resLivro.json();
                            if (dataLivro.data && Array.isArray(dataLivro.data)) {
                                const livro = dataLivro.data.find((l: any) => l.id_livro === exemplar.id_livro);
                                setLivroDetalhes(livro);
                                console.log('Livro encontrado:', livro);
                            }
                        }
                        
                        if (exemplar.disponibilidade === 'disponivel') {
                            setExemplarStatus("disponivel");
                        } else {
                            setExemplarStatus("indisponivel");
                        }
                    } else {
                        console.log('Exemplar não encontrado no array');
                        setExemplarStatus("indisponivel");
                        setExemplarDetalhes(null);
                        setLivroDetalhes(null);
                    }
                } else {
                    console.log('Formato de resposta inesperado');
                    setExemplarStatus("indisponivel");
                    setExemplarDetalhes(null);
                    setLivroDetalhes(null);
                }
            } catch (error) {
                console.error('Erro ao verificar exemplar:', error);
                setExemplarStatus("indisponivel");
                setExemplarDetalhes(null);
                setLivroDetalhes(null);
            } finally {
                setVerificando(false);
            }
        };

        const timeoutId = setTimeout(verificarExemplar, 500);
        return () => clearTimeout(timeoutId);
    }, [idExemplar]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!idExemplar) {
            alert('Digite o ID do exemplar!');
            setIsSubmitting(false);
            return;
        }

        if (exemplarStatus !== "disponivel") {
            alert('Este exemplar não está disponível para reserva!');
            setIsSubmitting(false);
            return;
        }

        try {
            // Preparar os dados exatamente como o PHP espera
            const dados = {
                id_exemplar: parseInt(idExemplar),
                disponibilidade: 'reservado'
            };

            console.log('Enviando dados:', dados);
            console.log('JSON stringificado:', JSON.stringify(dados));

            // Usar POST que é mais compatível (após ajustar o PHP)
            const response = await fetch(`http://localhost:8000/api/exemplares/update.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados),
            });

            console.log('Status da resposta:', response.status);
            const data = await response.json();
            console.log('Resposta completa:', data);

            if (response.ok || data.status === 'sucesso') {
                toast.success("Reserva realizada com sucesso!");
                setIdExemplar("");
                setExemplarStatus(null);
                setExemplarDetalhes(null);
                setLivroDetalhes(null);
                setTimeout(() => {
                    router.push("/dashboard/staff/");
                }, 1500);
            } else {
                throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
            }
        } catch (error: any) {
            console.error('Erro completo:', error);
            alert('Erro ao realizar reserva: ' + error.message);
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
                    <h1 className="text-2xl font-bold text-gray-900">Reserva de Exemplar</h1>
                    <p className="text-sm text-gray-500 font-medium">
                        Altere o status de um exemplar para reservado.
                    </p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Informações do Livro/Exemplar */}
                    {livroDetalhes && exemplarDetalhes ? (
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <img
                                src={livroDetalhes.capa || 'https://via.placeholder.com/160x224?text=Sem+Capa'}
                                alt={livroDetalhes.titulo}
                                className="w-40 h-56 object-cover rounded-xl shadow-md"
                            />
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{livroDetalhes.titulo}</h2>
                                {livroDetalhes.nomes_autores && (
                                    <p className="text-sm text-gray-700">Autor(es): {livroDetalhes.nomes_autores}</p>
                                )}
                                <p className="text-sm text-gray-700">Editora: {livroDetalhes.editora || 'N/A'}</p>
                                <p className="text-sm text-gray-700">Ano: {livroDetalhes.ano_publicacao || 'N/A'}</p>
                                
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs font-bold text-gray-500">Exemplar #{exemplarDetalhes.id_exemplar}</p>
                                    <p className="text-xs text-gray-600">Localização: {exemplarDetalhes.localizacao || 'N/A'}</p>
                                </div>
                                
                                <div className="mt-3">
                                    {exemplarStatus === "disponivel" ? (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <CheckCircle size={20} />
                                            <span className="font-bold">Disponível para reserva</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-600">
                                            <XCircle size={20} />
                                            <span className="font-bold">Não disponível</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <BookOpen size={64} className="text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">Digite o ID do exemplar para verificar disponibilidade</p>
                        </div>
                    )}

                    {/* Formulário de Reserva */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col justify-center space-y-8"
                    >
                        {/* ID do Exemplar */}
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={14} /> ID do Exemplar
                            </h2>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600">Digite o ID do exemplar</label>
                                <input
                                    type="number"
                                    value={idExemplar}
                                    onChange={(e) => setIdExemplar(e.target.value)}
                                    placeholder="Ex: 4"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
                                />
                                {verificando && (
                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                        <Loader2 size={12} className="animate-spin" />
                                        Verificando disponibilidade...
                                    </p>
                                )}
                                {exemplarStatus === "disponivel" && !verificando && (
                                    <p className="text-xs text-green-600 flex items-center gap-2">
                                        <CheckCircle size={12} />
                                        Exemplar disponível
                                    </p>
                                )}
                                {exemplarStatus === "indisponivel" && !verificando && (
                                    <p className="text-xs text-red-600 flex items-center gap-2">
                                        <XCircle size={12} />
                                        Exemplar não disponível ou não encontrado
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting || exemplarStatus !== "disponivel"}
                                className="w-full bg-denin text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-xl shadow-denin/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>Reservar Exemplar</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}