"use client";

import { useState } from "react";
import { pessoaService } from "@/services/pessoa-service";
import { useRouter } from "next/navigation";
import { CadastroPessoaDTO } from "@/types/pessoas";

export default function CadastroAluno() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<"sucesso" | "erro" | "">("");

  const criarItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !matricula || !cpf || !email) {
      setMensagem("Preencha os campos obrigatórios.");
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
        tipo: "aluno",
        cargo: null,
      };

      const data = await pessoaService.criar(dados);

      if (data && data.status === "sucesso") {
        setMensagem("Aluno cadastrado com sucesso!");
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
      {/* Título e Mensagem agora dentro do card branco */}
      <div className="text-center text-2xl">
        <p className="text-gray-600 font-medium mb-2">Cadastro de Aluno</p>

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

      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          placeholder="Nome completo"
          onChange={(e) => setNome(e.target.value)}
          value={nome}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Matrícula"
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

      <div className="grid grid-cols-1 gap-4">
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          placeholder="Telefone (opcional)"
          onChange={(e) => setTelefone(e.target.value)}
          value={telefone}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 border-2 border-gray-500 rounded-xl text-gray-800 font-medium hover:bg-blue-500 hover:border-white hover:text-white transition"
      >
        Cadastrar Aluno
      </button>
    </form>
  );
}
// "use client";

// import { Button } from "@/components/ui/button";
// import { useState } from "react";
// import { pessoaService } from "@/services/pessoa-service";
// import { useRouter } from "next/navigation"; // Importado para navegação correta

// export default function CadastroAluno() {
//   const router = useRouter();

//   const [nome, setNome] = useState("");
//   const [matricula, setMatricula] = useState("");
//   const [cpf, setCpf] = useState("");
//   const [email, setEmail] = useState("");
//   const [telefone, setTelefone] = useState("");
//   const [mensagem, setMensagem] = useState("");
//   const [tipoMensagem, setTipoMensagem] = useState<"sucesso" | "erro" | "">("");

//   const criarItem = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!nome || !matricula || !cpf || !email) {
//       setMensagem(
//         "Preencha os campos obrigatórios (Nome, Matrícula, CPF e Email)."
//       );
//       setTipoMensagem("erro");
//       return;
//     }

//     try {
//       const dados = {
//         nome,
//         matricula,
//         cpf,
//         email,
//         telefone,
//         tipo: "aluno",
//         cargo: null,
//       };

//       const data = await pessoaService.criar(dados);

//       if (data && data.status === "sucesso") {
//         setMensagem("Cadastro realizado com sucesso!");
//         setTipoMensagem("sucesso");

//         // Limpa os campos
//         setNome("");
//         setMatricula("");
//         setCpf("");
//         setEmail("");
//         setTelefone("");

//         // Redireciona após 2 segundos para dar tempo de ler a mensagem
//         setTimeout(() => {
//           router.push("/aluno");
//         }, 2000);
//       } else {
//         setMensagem(data?.message || "Erro ao cadastrar.");
//         setTipoMensagem("erro");
//       }
//     } catch (error) {
//       setMensagem("Erro técnico ao cadastrar. Verifique a conexão.");
//       setTipoMensagem("erro");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-rudy-blue/50 flex flex-col">
//       <header className="flex justify-end p-6 mt-2">
//         <Button variant="default" size="lg" className="w-full sm:w-auto">
//           Acessar o e-Papirus
//         </Button>
//       </header>

//       <div className="w-full max-w-md mx-auto text-center mt-[-30px] flex flex-col items-center">
//         <img src="/img/logo.png" alt="Logo" className="w-28 mx-auto" />
//         <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
//           <span className="text-denin">e</span>-Papirus
//         </h1>
//         <p className="text-gray-600 mt-1 mb-6">Cadastro do aluno</p>

//         {mensagem && (
//           <div
//             className={`mb-4 w-full text-center text-white rounded p-2 animate-fade-in ${
//               tipoMensagem === "sucesso" ? "bg-green-500" : "bg-red-500"
//             }`}
//           >
//             {mensagem}
//           </div>
//         )}

//         {/* Use o onSubmit no formulário em vez de onClick no botão */}
//         <form
//           onSubmit={criarItem}
//           className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6"
//         >
//           <div className="grid grid-cols-1 gap-4">
//             <input
//               type="text"
//               placeholder="Nome completo"
//               onChange={(e) => setNome(e.target.value)}
//               value={nome}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <input
//               type="text"
//               placeholder="Matrícula"
//               value={matricula}
//               onChange={(e) => setMatricula(e.target.value)}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
//             />
//             <input
//               type="text"
//               placeholder="CPF (apenas números)"
//               value={cpf}
//               maxLength={11}
//               onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
//             />
//           </div>

//           <div className="grid grid-cols-1 gap-4">
//             <input
//               type="email"
//               placeholder="Email"
//               onChange={(e) => setEmail(e.target.value)}
//               value={email}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
//             />
//           </div>

//           <div className="grid grid-cols-1 gap-4">
//             <input
//               type="text"
//               placeholder="Telefone (opcional)"
//               onChange={(e) => setTelefone(e.target.value)}
//               value={telefone}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full py-3 border-2 border-gray-500 rounded-xl text-gray-800 font-medium hover:bg-blue-500 hover:border-white hover:text-white transition"
//           >
//             Cadastrar
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
