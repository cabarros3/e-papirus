'use client';    

import React, { useState } from 'react';

export default function GerenciarExemplares() {
  const [exemplares, setExemplares] = useState([
    {
      id: 1,
      nomeObra: 'nome da obra',
      localizacao: 'localização',
      disponibilidade: 'disponível'
    },
    {
      id: 2,
      nomeObra: 'caixa de pássaros',
      localizacao: 'biblioteca da igapasu',
      disponibilidade: 'disponível'
    },
    {
      id: 3,
      nomeObra: 'caixa de pássaros',
      localizacao: 'biblioteca de Olinda',
      disponibilidade: 'emprestado'
    },
    {
      id: 4,
      nomeObra: 'caixa de pássaros',
      localizacao: 'biblioteca do Recife',
      disponibilidade: 'reservado'
    }
  ]);

  const [filtroNome, setFiltroNome] = useState('');
  const [filtroLocalizacao, setFiltroLocalizacao] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">
            Gerenciar Exemplares
          </h1>
          <p className="text-sm text-gray-500">
            Categorização de acervo.
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-4">
            NOVO EXEMPLAR
          </h2>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-2">
                Nome da Obra
              </label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="nome-obra">nome da obra</option>
                  <option value="caixa-passaros">caixa de pássaros</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-2">
                Localização
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filtroLocalizacao}
                onChange={(e) => setFiltroLocalizacao(e.target.value)}
              />
            </div>

            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              <span className="text-xl">+</span>
              Adicionar
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  nome da obra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  disponibilidade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {exemplares.map((exemplar) => (
                <tr key={exemplar.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exemplar.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {exemplar.nomeObra}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {exemplar.localizacao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {exemplar.disponibilidade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}