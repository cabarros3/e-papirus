"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

/*

  ------------------ FRONT ---------------------------


  <div className="mb-4">
              <label className="block text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>



            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />



              <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {editando ? 'Atualizar' : 'Criar'}
              </button>
              {editando && (
                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancelar
                </button>
              )}
            </div>

*/

export default function CadastroAluno() {

  


// nome , matricula , cpf , email , telefone , tipo , cargo. esses são os atributos da tabela 

const [nome, setNome] = useState('');
const [matricula, setMatricula] = useState('');
const [cpf, setCpf] = useState('');
const [email, setEmail] = useState('');
const [telefone, setTelefone] = useState('');
const [mensagem, setMensagem] = useState('');
const [tipoMensagem, setTipoMensagem] = useState<'sucesso' | 'erro' | ''>('');


//http://localhost:8000/api/pessoas/create.php
const API_URL = 'http://localhost:8000/api/pessoas';

 // Criar novo item
  const criarItem = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação dos campos obrigatórios
    if (!nome || !matricula || !cpf || !email ) {
      setMensagem('Preencha os campos.');
      setTipoMensagem('erro');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, matricula , cpf , email , telefone })
      });
      const data = await response.json();
      if (data && data.status === 'sucesso') {
        setNome('');
        setMatricula('');
        setCpf('');
        setEmail('');
        setTelefone('');
        setMensagem('Cadastro realizado com sucesso!');
        setTipoMensagem('sucesso');
      } else {
        setMensagem(data?.message || 'Erro ao cadastrar.');
        setTipoMensagem('erro');
        console.log('Erro: ' + data?.message);
      }
    } catch (error) {
      setMensagem('Erro ao cadastrar.');
      setTipoMensagem('erro');
      console.log('Erro ao criar: ' + error);
    }
  };




  return (
    <div className="min-h-screen bg-rudy-blue/50 flex flex-col">

      {/* Topo */}
      <header className="flex justify-end p-6 mt-2">

        {/* Botão de Acesso componente */}
        <Button variant="default" size="lg" className="w-full sm:w-auto">
          Acessar o e-Papirus
        </Button>
      </header>

      {/* Conteúdo */}
      <div className="w-full max-w-md mx-auto text-center mt-[-30px] flex flex-col items-center">


        <img
          src="/img/logo.png"
          alt="Logo"
          className="w-28 mx-auto"
        />

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          <span className="text-denin">e</span>-Papirus
        </h1>
        <p className="text-gray-600 mt-1 mb-6">
          Cadastro do aluno
        </p>

        {mensagem && (
          <div
            className={`mb-4 text-center text-white rounded p-2 animate-fade-in ${
              tipoMensagem === 'sucesso' ? 'bg-green-500' : tipoMensagem === 'erro' ? 'bg-red-500' : ''
            }`}
          >
            {mensagem}
          </div>
        )}
        <form className="w-200 max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">



          <div className="grid grid-cols-1 md:grid-cols-1 gap-4"> 
            <input 
              type="text" 
              placeholder="Nome completo" 
              onChange= {(e) => setNome(e.target.value)}
              value={nome}
              className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <input type="text" placeholder="Matrícula"
              className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" /> */}

            <input 
              type="text" placeholder="Matrícula"
              value={matricula}
              onChange= {(e) => setMatricula(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
  

            <input
              type="text"
              placeholder="CPF (apenas números)"
              value={cpf}
              maxLength={11}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => {
                // Remove tudo que não for número
                const valor = e.target.value.replace(/\D/g, '');
                setCpf(valor);
              }}
              className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>


          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <input 
              type="text" 
              placeholder="Email"
              onChange= {(e) => setEmail(e.target.value)}
              value={email}
              className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <input 
              type="text" 
              placeholder="Telefone (opcional)"
              onChange= {(e) => setTelefone(e.target.value)}
              value={telefone}
              className="w-full px-4 py-2 border rounded-lg placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>



          <button 
            type="submit"
            onClick={criarItem}
            className="w-full py-3 border-2 border-gray-500 rounded-xl text-gray-800 font-medium hover:bg-blue-500 hover:border-2 hover:border-white hover:text-white transition">
            <a href="/aluno">Cadastrar</a>
          </button>

        </form>





      </div>

    </div>
  );
}
