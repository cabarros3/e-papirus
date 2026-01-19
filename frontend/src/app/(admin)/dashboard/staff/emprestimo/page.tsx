"use client";

import { ArrowLeft, Calendar, Loader2, User, BookOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Emprestimo() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dados mockados do livro
    const livro = {
        capa: "https://covers.openlibrary.org/b/id/7984916-L.jpg",
        titulo: "Harry Potter: E O CÁLICE DE FOGO",
        autor: "J. K. Rowling",
        ano: 2000,
        sinopse:
            "Harry Potter e o Cálice de Fogo mostra Harry sendo inesperadamente escolhido para o Torneio Tribruxo, uma competição perigosa entre escolas de magia.",
    };

    // Mock de estudantes
    const estudantes = [
        { id_pessoa: 1, nome: "Camilla Silva" },
        { id_pessoa: 2, nome: "João Souza" },
        { id_pessoa: 3, nome: "Ana Lima" },
    ];

    // Mock de exemplares
    const exemplares = [
        { id_exemplar: 101, localizacao: "Estante A1" },
        { id_exemplar: 102, localizacao: "Estante B2" },
    ];

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => setIsSubmitting(false), 1200);
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
                        Realize o empréstimo de um exemplar para mu usuário.
                    </p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Informações do Livro */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <img
                            src={livro.capa}
                            alt={livro.titulo}
                            className="w-40 h-56 object-cover rounded-xl shadow-md"
                        />
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">{livro.titulo}</h2>
                            <p className="text-sm text-gray-700">Autor: {livro.autor}</p>
                            <p className="text-sm text-gray-700">Ano: {livro.ano}</p>
                            <p className="text-sm text-gray-700 mt-2">
                                <span className="font-bold">Sobre:</span> {livro.sinopse}
                            </p>
                        </div>
                    </div>

                    {/* Formulário de Empréstimo */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col justify-center space-y-8"
                    >
                        {/* Seleção do estudante */}
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} /> Selecionar Estudante
                            </h2>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-600">Estudante</label>
                                <select
                                    name="id_pessoa"
                                    required
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
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none bg-white"
                                >
                                    <option value="">Selecione...</option>
                                    {exemplares.map((ex) => (
                                        <option key={ex.id_exemplar} value={ex.id_exemplar}>
                                            {ex.id_exemplar} - {ex.localizacao}
                                        </option>
                                    ))}
                                </select>
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
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Data prevista para devolução</label>
                                    <input
                                        name="data_prevista"
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
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
