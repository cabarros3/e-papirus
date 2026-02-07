/*'use client';

import { useState } from 'react';

export default function RenovacaoPage() {
  const [novaData, setNovaData] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function handleRenovar() {
    if (!novaData) {
      setMensagem('Selecione uma nova data de devolução');
      return;
    }

    try {
      setLoading(true);
      setMensagem(null);

      const response = await fetch(
        'http://localhost/e-papirus/backend-php/api/renovacoes/renovar.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emprestimo_id: 1,   // depois pode vir da URL
            nova_data_devolucao: novaData,
            staff_id: 1         // depois pode vir da sessão/login
          })
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        setMensagem('Livro renovado com sucesso');
      } else {
        setMensagem(data.mensagem || 'Erro ao renovar');
      }
    } catch (error) {
      setMensagem('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">
        Renovação de Livro
      </h1>

      <div className="bg-white shadow rounded p-4 mb-4">
        <p><strong>Livro:</strong> ---</p>
        <p><strong>Usuário:</strong> ---</p>
        <p><strong>Data de devolução:</strong> ---</p>
        <p><strong>Renovações:</strong> ---</p>
      </div>

      <label className="block text-sm font-medium mb-2">
        Nova data de devolução
      </label>

      <input
        type="date"
        className="border rounded px-3 py-2 w-full mb-4"
        value={novaData}
        onChange={(e) => setNovaData(e.target.value)}
      />

      <button
        onClick={handleRenovar}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Renovando...' : 'Renovar livro'}
      </button>

      {mensagem && (
        <p className="mt-4 text-sm">
          {mensagem}
        </p>
      )}
    </div>
  );
}
