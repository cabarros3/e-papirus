'use client';

import { useState } from 'react';
import { pessoaService } from '@/services/pessoa-service';
import { useRouter } from 'next/navigation';
import { CadastroPessoaDTO } from '@/types/pessoas';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function CadastroAluno() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro' | ''>('');

  const criarItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !matricula || !cpf || !email || !senha || !confirmarSenha) {
      setMensagem('Preencha os campos obrigatórios.');
      setTipoMensagem('erro');
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagem('As senhas não coincidem.');
      setTipoMensagem('erro');
      return;
    }

    setLoading(true);
    setMensagem('');

    try {
      const dados: CadastroPessoaDTO = {
        nome: nome.trim(),
        matricula: matricula.trim(),
        cpf: cpf.replace(/\D/g, ''), // Limpa pontos/traços para caber no varchar(11)
        email: email.trim().toLowerCase(),
        senha: senha,
        telefone: telefone.trim() || null, // Agora o banco aceita NULL corretamente
        tipo: 'aluno',
        cargo: null, // Resolvido com o seu ALTER TABLE
      };

      const data = await pessoaService.criar(dados);

      if (data && data.status === 'sucesso') {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2200);
      }
    } catch (error: any) {
      setLoading(false);
      setMensagem(error.message || 'Erro ao cadastrar.');
      setTipoMensagem('erro');
    }
  };

  return (
    <>
      {/* Overlay de Sucesso com Animação */}
      {success && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle2 size={60} className="text-green-500 animate-bounce" />
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800">
                Usuário criado com sucesso!
              </h3>
              <p className="text-gray-500 text-sm">
                Redirecionando para o login...
              </p>
            </div>
            <Loader2 className="animate-spin text-gray-400 mt-2" size={24} />
          </div>
        </div>
      )}

      <form onSubmit={criarItem} className="w-full space-y-6 text-left">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Crie sua conta
          </h2>
          <p className="text-gray-500 text-sm">
            Preencha os dados abaixo para se cadastrar como aluno.
          </p>
        </div>

        {/* Alerta com a cor #E97D7A para erros */}
        {mensagem && (
          <div
            style={{
              backgroundColor: tipoMensagem === 'erro' ? '#E97D7A' : '#22C55E',
            }}
            className="w-full flex items-center justify-center gap-2 text-white rounded-xl p-3 text-sm font-bold animate-in fade-in slide-in-from-top-1 shadow-sm"
          >
            {tipoMensagem === 'erro' ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {mensagem}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="Digite seu nome completo"
              onChange={(e) => setNome(e.target.value)}
              value={nome}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Matrícula
              </label>
              <input
                type="text"
                placeholder="0000000"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                CPF
              </label>
              <input
                type="text"
                placeholder="Apenas números"
                value={cpf}
                maxLength={11}
                onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              E-mail
            </label>
            <input
              type="email"
              placeholder="exemplo@email.com"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                onChange={(e) => setSenha(e.target.value)}
                value={senha}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Confirmar Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                onChange={(e) => setConfirmarSenha(e.target.value)}
                value={confirmarSenha}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Telefone (Opcional)
            </label>
            <input
              type="text"
              placeholder="(00) 00000-0000"
              onChange={(e) => setTelefone(e.target.value)}
              value={telefone}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className={`w-full py-3.5 bg-gray-800 text-white rounded-xl font-bold shadow-lg shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 
            ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-900'}`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Processando...</span>
            </>
          ) : (
            'Cadastrar Aluno'
          )}
        </button>
      </form>
    </>
  );
}

// "use client";

// import { useState } from "react";
// import { pessoaService } from "@/services/pessoa-service";
// import { useRouter } from "next/navigation";
// import { CadastroPessoaDTO } from "@/types/pessoas";

// export default function CadastroAluno() {
//   const router = useRouter();

//   const [nome, setNome] = useState("");
//   const [matricula, setMatricula] = useState("");
//   const [cpf, setCpf] = useState("");
//   const [email, setEmail] = useState("");
//   const [senha, setSenha] = useState("");
//   const [confirmarSenha, setConfirmarSenha] = useState("");
//   const [telefone, setTelefone] = useState("");
//   const [mensagem, setMensagem] = useState("");
//   const [tipoMensagem, setTipoMensagem] = useState<"sucesso" | "erro" | "">("");

//   const criarItem = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!nome || !matricula || !cpf || !email || !senha || !confirmarSenha) {
//       setMensagem("Preencha os campos obrigatórios.");
//       setTipoMensagem("erro");
//       return;
//     }

//     if (senha !== confirmarSenha) {
//       setMensagem("As senhas não coincidem.");
//       setTipoMensagem("erro");
//       return;
//     }

//     try {
//       const dados: CadastroPessoaDTO = {
//         nome,
//         matricula,
//         cpf,
//         email,
//         senha,
//         telefone: telefone || undefined,
//         tipo: "aluno",
//         cargo: null,
//       };

//       const data = await pessoaService.criar(dados);

//       if (data && data.status === "sucesso") {
//         setMensagem("Aluno cadastrado com sucesso!");
//         setTipoMensagem("sucesso");

//         setNome("");
//         setMatricula("");
//         setCpf("");
//         setEmail("");
//         setSenha("");
//         setConfirmarSenha("");
//         setTelefone("");

//         setTimeout(() => {
//           router.push("/login");
//         }, 2000);
//       }
//     } catch (error: any) {
//       setMensagem(error.message || "Erro ao cadastrar.");
//       setTipoMensagem("erro");
//     }
//   };

//   return (
//     <form onSubmit={criarItem} className="w-full space-y-6 text-left">
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
//           Crie sua conta
//         </h2>
//         <p className="text-gray-500 text-sm">
//           Preencha os dados abaixo para se cadastrar como aluno.
//         </p>
//       </div>

//       {mensagem && (
//         <div
//           className={`w-full text-center text-white rounded-xl p-3 text-sm animate-in fade-in slide-in-from-top-1 ${
//             tipoMensagem === "sucesso" ? "bg-green-500" : "bg-red-500"
//           }`}
//         >
//           {mensagem}
//         </div>
//       )}

//       <div className="space-y-4">
//         {/* NOME */}
//         <div>
//           <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
//             Nome Completo
//           </label>
//           <input
//             type="text"
//             placeholder="Digite seu nome completo"
//             onChange={(e) => setNome(e.target.value)}
//             value={nome}
//             className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black bg-white transition-all"
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* MATRÍCULA */}
//           <div>
//             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
//               Matrícula
//             </label>
//             <input
//               type="text"
//               placeholder="0000000"
//               value={matricula}
//               onChange={(e) => setMatricula(e.target.value)}
//               className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black bg-white transition-all"
//             />
//           </div>
//           {/* CPF */}
//           <div>
//             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
//               CPF
//             </label>
//             <input
//               type="text"
//               placeholder="Apenas números"
//               value={cpf}
//               maxLength={11}
//               onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
//               className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black bg-white transition-all"
//             />
//           </div>
//         </div>

//         {/* EMAIL */}
//         <div>
//           <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
//             E-mail
//           </label>
//           <input
//             type="email"
//             placeholder="exemplo@email.com"
//             onChange={(e) => setEmail(e.target.value)}
//             value={email}
//             className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black bg-white transition-all"
//           />
//         </div>

//         {/* GRID DE SENHAS */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
//               Senha
//             </label>
//             <input
//               type="password"
//               placeholder="••••••••"
//               onChange={(e) => setSenha(e.target.value)}
//               value={senha}
//               className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black bg-white transition-all"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
//               Confirmar Senha
//             </label>
//             <input
//               type="password"
//               placeholder="••••••••"
//               onChange={(e) => setConfirmarSenha(e.target.value)}
//               value={confirmarSenha}
//               className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black bg-white transition-all"
//             />
//           </div>
//         </div>

//         {/* TELEFONE */}
//         <div>
//           <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
//             Telefone (Opcional)
//           </label>
//           <input
//             type="text"
//             placeholder="(00) 00000-0000"
//             onChange={(e) => setTelefone(e.target.value)}
//             value={telefone}
//             className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black bg-white transition-all"
//           />
//         </div>
//       </div>

//       <button
//         type="submit"
//         className="w-full py-3.5 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 shadow-lg shadow-gray-200 transition-all active:scale-[0.98]"
//       >
//         Cadastrar Aluno
//       </button>
//     </form>
//   );
// }
