'use client';

import { useState } from 'react';
import { pessoaService } from '@/services/pessoa-service';
import { useRouter } from 'next/navigation';
import { CadastroPessoaDTO, CargoFuncionario } from '@/types/pessoas';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function CadastroFuncionario() {
  const router = useRouter();

  // Estados dos campos
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cargo, setCargo] = useState<CargoFuncionario | ''>('');

  // Estados de controle de UI
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro' | ''>('');

  const criarItem = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (
      !nome ||
      !matricula ||
      !cpf ||
      !email ||
      !cargo ||
      !senha ||
      !confirmarSenha
    ) {
      setMensagem('Preencha todos os campos obrigatórios.');
      setTipoMensagem('erro');
      return;
    }

    // Validação de coincidência de senhas
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
        cpf: cpf.replace(/\D/g, ''), // Limpeza de caracteres não numéricos
        email: email.trim().toLowerCase(),
        senha,
        telefone: telefone.trim() || undefined,
        tipo: 'funcionario',
        cargo: cargo as CargoFuncionario,
      };

      const data = await pessoaService.criar(dados);

      if (data && data.status === 'sucesso') {
        setLoading(false);
        setSuccess(true); // Ativa o overlay de animação

        setTimeout(() => {
          router.push('/login');
        }, 2200);
      }
    } catch (error: any) {
      setLoading(false);
      setMensagem(error.message || 'Erro ao cadastrar.');
      setTipoMensagem('erro');
    }
  };

  return (
    <>
      {/* OVERLAY DE ANIMAÇÃO DE SUCESSO */}
      {success && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="flex flex-col items-center space-y-4 text-center px-4">
            <CheckCircle2 size={60} className="text-green-500 animate-bounce" />
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Funcionário cadastrado com sucesso!
              </h3>
              <p className="text-gray-500 text-sm">
                Redirecionando para a tela de login...
              </p>
            </div>
            <Loader2 className="animate-spin text-gray-400 mt-2" size={24} />
          </div>
        </div>
      )}

      <form onSubmit={criarItem} className="w-full space-y-6 text-left">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-700 tracking-tight">
            Cadastro de Funcionário
          </h2>
          <p className="text-gray-500 text-sm">
            Insira os dados do colaborador para acesso ao sistema.
          </p>
        </div>

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
          {/* NOME */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="Digite o nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loading || success}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white transition-all disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registro do Funcionário */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Registro do Funcionário
              </label>
              <input
                type="text"
                placeholder="0000000"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                disabled={loading || success}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white transition-all disabled:opacity-50"
              />
            </div>
            {/* CPF */}
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
                disabled={loading || success}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* EMAIL E CARGO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                E-mail
              </label>
              <input
                type="email"
                placeholder="email@biblioteca.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || success}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white transition-all disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Cargo
              </label>
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value as CargoFuncionario)}
                disabled={loading || success}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white text-gray-700 transition-all disabled:opacity-50"
              >
                <option value="">Selecione...</option>
                <option value="bibliotecario">Bibliotecário</option>
                <option value="auxiliar">Auxiliar</option>
                <option value="estagiario">Estagiário</option>
              </select>
            </div>
          </div>

          {/* SENHAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={loading || success}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white transition-all disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Confirmar Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                disabled={loading || success}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* TELEFONE */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Telefone (Opcional)
            </label>
            <input
              type="text"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              disabled={loading || success}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black bg-white transition-all disabled:opacity-50"
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
            'Finalizar Cadastro'
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
// import { CadastroPessoaDTO, CargoFuncionario } from "@/types/pessoas";

// export default function CadastroFuncionario() {
//   const router = useRouter();

//   // Estados dos campos
//   const [nome, setNome] = useState("");
//   const [matricula, setMatricula] = useState("");
//   const [cpf, setCpf] = useState("");
//   const [email, setEmail] = useState("");
//   const [senha, setSenha] = useState("");
//   const [confirmarSenha, setConfirmarSenha] = useState(""); // Novo estado
//   const [telefone, setTelefone] = useState("");
//   const [cargo, setCargo] = useState<CargoFuncionario | "">("");

//   const [mensagem, setMensagem] = useState("");
//   const [tipoMensagem, setTipoMensagem] = useState<"sucesso" | "erro" | "">("");

//   const criarItem = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validação atualizada
//     if (
//       !nome ||
//       !matricula ||
//       !cpf ||
//       !email ||
//       !cargo ||
//       !senha ||
//       !confirmarSenha
//     ) {
//       setMensagem("Preencha todos os campos obrigatórios.");
//       setTipoMensagem("erro");
//       return;
//     }

//     // Validação de coincidência de senhas
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
//         tipo: "funcionario",
//         cargo: cargo as CargoFuncionario,
//       };

//       const data = await pessoaService.criar(dados);

//       if (data && data.status === "sucesso") {
//         setMensagem("Funcionário cadastrado com sucesso!");
//         setTipoMensagem("sucesso");

//         setNome("");
//         setMatricula("");
//         setCpf("");
//         setEmail("");
//         setSenha("");
//         setConfirmarSenha("");
//         setTelefone("");
//         setCargo("");

//         setTimeout(() => router.push("/login"), 2000);
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
//           Cadastro de Funcionário
//         </h2>
//         <p className="text-gray-500 text-sm">
//           Insira os dados do colaborador para acesso ao sistema.
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
//             placeholder="Digite o nome completo"
//             value={nome}
//             onChange={(e) => setNome(e.target.value)}
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

//         {/* EMAIL E CARGO */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
//               E-mail Institucional
//             </label>
//             <input
//               type="email"
//               placeholder="email@biblioteca.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black bg-white transition-all"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
//               Cargo
//             </label>
//             <select
//               value={cargo}
//               onChange={(e) => setCargo(e.target.value as CargoFuncionario)}
//               className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white text-black transition-all"
//             >
//               <option value="">Selecione...</option>
//               <option value="bibliotecario">Bibliotecário</option>
//               <option value="auxiliar">Auxiliar</option>
//               <option value="estagiario">Estagiário</option>
//             </select>
//           </div>
//         </div>

//         {/* SENHAS */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
//               Senha
//             </label>
//             <input
//               type="password"
//               placeholder="••••••••"
//               value={senha}
//               onChange={(e) => setSenha(e.target.value)}
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
//               value={confirmarSenha}
//               onChange={(e) => setConfirmarSenha(e.target.value)}
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
//             value={telefone}
//             onChange={(e) => setTelefone(e.target.value)}
//             className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-black bg-white transition-all"
//           />
//         </div>
//       </div>

//       <button
//         type="submit"
//         className="w-full py-3.5 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 shadow-lg shadow-gray-200 transition-all active:scale-[0.98]"
//       >
//         Finalizar Cadastro
//       </button>
//     </form>
//   );
// }
