import { Search, Check, Mail, CreditCard, Hash } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Pessoa } from "@/types/pessoas";

interface UserSearchInputProps {
  usuarios: Pessoa[];
  onSelect: (usuario: Pessoa) => void;
  selecionadoId: string;
  selecionadoNome: string;
}

export function UserSearchInput({
  usuarios,
  onSelect,
  selecionadoId,
  selecionadoNome,
}: UserSearchInputProps) {
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickFora = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setAberto(false);
    };
    document.addEventListener("mousedown", clickFora);
    return () => document.removeEventListener("mousedown", clickFora);
  }, []);

  const filtrados = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (u.cpf && u.cpf.includes(busca)) ||
      String(u.id_pessoa).includes(busca) ||
      (u.email && u.email.toLowerCase().includes(busca.toLowerCase())),
  );

  return (
    <div className="space-y-1 relative" ref={ref}>
      <label className="text-xs font-bold text-gray-600 flex justify-between">
        Usuário Selecionado
        {selecionadoId && (
          <span className="text-green-600 font-black flex items-center gap-1 animate-in zoom-in">
            <Check size={12} /> ID: {selecionadoId}
          </span>
        )}
      </label>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder={
            selecionadoNome || "Buscar por nome, CPF ou Matrícula..."
          }
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-denin transition-all ${
            selecionadoId
              ? "bg-green-50/30 border-green-200"
              : "bg-white border-gray-200"
          }`}
        />
      </div>

      {aberto && busca.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl max-h-64 overflow-y-auto overflow-x-hidden">
          {filtrados.length > 0 ? (
            filtrados.map((u) => (
              <div
                key={u.id_pessoa}
                onClick={() => {
                  onSelect(u);
                  setBusca("");
                  setAberto(false);
                }}
                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-gray-900">
                    {u.nome}
                  </span>
                  {u.tipo && (
                    <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 tracking-tighter">
                      {u.tipo}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Hash size={10} />
                    <span className="text-[10px] font-medium">
                      Matrícula: {u.id_pessoa}
                    </span>
                  </div>

                  {u.cpf && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <CreditCard size={10} />
                      <span className="text-[10px] font-medium">
                        CPF: {u.cpf}
                      </span>
                    </div>
                  )}

                  {u.email && (
                    <div className="flex items-center gap-1.5 text-gray-500 col-span-2">
                      <Mail size={10} />
                      <span className="text-[10px] font-medium truncate">
                        {u.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-xs text-gray-400 text-center italic">
              Nenhum usuário encontrado para &quot;{busca}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
