// components/dashboard/BookCardFeatured.tsx
import { Book, Clock } from 'lucide-react';

export const BookCardFeatured = ({
  livro,
  index,
}: {
  livro: any;
  index: number;
}) => {
  // 1. Criamos objetos de data reais para comparar matematicamente
  const dataPrevista = new Date(livro.data_prevista);
  const hoje = new Date();

  // 2. Zeramos as horas, minutos e segundos para comparar apenas o dia
  dataPrevista.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);

  // 3. Agora a matemática funciona:
  const venceHoje = dataPrevista.getTime() === hoje.getTime();
  const isAtrasado = dataPrevista.getTime() < hoje.getTime();

  // 4. Definição da cor e texto
  // Prioridade: Atrasado (Vermelho) > Hoje (Laranja) > Resto (Cor da API)
  let corFinal = livro.cor;
  let textoFinal = livro.status_texto;

  if (isAtrasado) {
    corFinal = 'red';
    textoFinal = 'Atrasado';
  } else if (venceHoje) {
    corFinal = 'orange';
    textoFinal = 'Vence Hoje';
  }

  // Formatação apenas para exibição
  const dataFormatada = new Date(livro.data_prevista).toLocaleDateString(
    'pt-BR'
  );

  return (
    <div
      style={{ animationDelay: `${600 + index * 100}ms` }}
      className="group flex w-full bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
    >
      <div className="w-24 md:w-32 bg-gray-50 shrink-0 overflow-hidden relative border-r border-gray-50">
        {livro.capa ? (
          <img
            src={livro.capa}
            alt={livro.titulo}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Book size={24} />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col justify-center flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              corFinal === 'red'
                ? 'bg-red-600'
                : corFinal === 'orange'
                  ? 'bg-orange-600'
                  : 'bg-blue-600'
            }`}
          />
          <span
            className={`text-[9px] font-black uppercase tracking-widest ${
              corFinal === 'red'
                ? 'text-red-600'
                : corFinal === 'orange'
                  ? 'text-orange-600'
                  : 'text-blue-600'
            }`}
          >
            Leitura Atual
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 leading-tight truncate group-hover:text-blue-600 transition-colors">
          {livro.titulo}
        </h3>

        <div className="mt-3">
          <div className="flex flex-col justify-start text-xs text-gray-500 gap-2 font-medium">
            <div className="flex flex-row gap-1 items-center">
              <Clock
                size={14}
                className={
                  corFinal === 'red'
                    ? 'text-red-500'
                    : corFinal === 'orange'
                      ? 'text-orange-500'
                      : 'text-blue-500'
                }
              />
              <span>
                Devolução:{' '}
                <span className="text-gray-900 font-bold">{dataFormatada}</span>
              </span>
            </div>

            <span
              className={`w-fit whitespace-nowrap text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-tighter border ${
                corFinal === 'red'
                  ? 'bg-red-50 text-red-600 border-red-100'
                  : corFinal === 'orange'
                    ? 'bg-orange-50 text-orange-600 border-orange-100'
                    : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}
            >
              {textoFinal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
