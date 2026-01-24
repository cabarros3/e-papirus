"use client";

import { useState } from "react";
import { pessoaService } from "@/services/pessoa-service";
import { useRouter } from "next/navigation";
import { CadastroPessoaDTO } from "@/types/pessoas";

export default function CadastroProfessor() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState(""); // Representa o CNBD
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState(""); // Novo estado para senha
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"sucesso" | "erro" | "">("");

  const criarItem = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação atualizada incluindo a senha
    if (!nome || !matricula || !cpf || !email || !senha) {
      setMensagem(
        "Preencha os campos obrigatórios (Nome, CNBD, CPF, Email e Senha).",
      );
      setTipoMensagem("erro");
      return;
    }

    try {
      const dados: CadastroPessoaDTO = {
        nome,
        matricula,
        cpf,
        email,
        senha, // Enviando a senha para criação do usuario_sistema
        telefone: telefone || undefined,
        tipo: "professor",
        cargo: null,
      };

      const data = await pessoaService.criar(dados);

      if (data && data.status === "sucesso") {
        setMensagem("Professor cadastrado com sucesso!");
        setTipoMensagem("sucesso");

        // Limpar campos
        setNome("");
        setMatricula("");
        setCpf("");
        setEmail("");
        setSenha("");
        setTelefone("");

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
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
        <p className="text-gray-600 font-medium mb-2 text-xl">
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
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="CNBD"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black"
          />
          <input
            type="text"
            placeholder="CPF (apenas números)"
            value={cpf}
            maxLength={11}
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black"
          />
        </div>

        <input
          type="email"
          placeholder="E-mail Institucional"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black"
        />

        {/* CAMPO DE SENHA */}
        <input
          type="password"
          placeholder="Defina uma senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black"
        />

        <input
          type="text"
          placeholder="Telefone (opcional)"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black"
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
