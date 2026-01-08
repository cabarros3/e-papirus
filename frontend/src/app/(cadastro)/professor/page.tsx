"use client";

import { useState } from "react";
import { pessoaService } from "@/services/pessoa-service";
import { useRouter } from "next/navigation";
import { CadastroPessoaDTO } from "@/types/pessoas";

export default function CadastroProfessor() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState(""); // Usado para o CNBD
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"sucesso" | "erro" | "">("");

  const criarItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !matricula || !cpf || !email) {
      setMensagem("Preencha os campos obrigatórios (Nome, CNBD, CPF e Email).");
      setTipoMensagem("erro");
      return;
    }

    try {
      const dados: CadastroPessoaDTO = {
        nome,
        matricula,
        cpf,
        email,
        telefone: telefone || undefined,
        tipo: "professor",
        cargo: null,
      };

      const data = await pessoaService.criar(dados);

      if (data && data.status === "sucesso") {
        setMensagem("Professor cadastrado com sucesso!");
        setTipoMensagem("sucesso");

        setNome("");
        setMatricula("");
        setCpf("");
        setEmail("");
        setTelefone("");

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMensagem(error.message || "Erro ao cadastrar.");
      setTipoMensagem("erro");
    }
  };

  return (
    <form
      onSubmit={criarItem}
      className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6 text-left"
    >
      <div className="text-center">
        <p className="text-gray-600 font-medium mb-2">
          Cadastro de Professores
        </p>

        {mensagem && (
          <div
            className={`mb-4 w-full text-center text-white rounded p-2 text-sm animate-fade-in ${
              tipoMensagem === "sucesso" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {mensagem}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="CNBD"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="text"
            placeholder="CPF (apenas números)"
            value={cpf}
            maxLength={11}
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <input
          type="text"
          placeholder="Telefone (opcional)"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 border-2 border-gray-500 rounded-xl text-gray-800 font-medium hover:bg-blue-500 hover:border-white hover:text-white transition"
      >
        Cadastrar Professor
      </button>
    </form>
  );
}
