import { BookOpen, ShieldCheck, Zap } from 'lucide-react';

export default function Features() {
  const items = [
    {
      icon: <BookOpen className="w-7 h-7" />,
      title: 'Vasto Acervo',
      desc: 'Acesso a milhares de itens.',
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: 'Acesso Rápido',
      desc: 'A gestão da sua leitura em qualquer dispositivo.',
    },
    {
      icon: <ShieldCheck className="w-7 h-7" />,
      title: 'Segurança',
      desc: 'Dados protegidos e leitura segura.',
    },
  ];

  return (
    // Aumentado o gap e a margem superior (mt-12) para respirar melhor
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12 w-full mt-12 border-t border-gray-100">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left px-4 group"
        >
          {/* Container do ícone maior e com mais preenchimento */}
          <div className="p-4 bg-denin/5 rounded-2xl text-denin ring-1 ring-denin/10 group-hover:bg-denin group-hover:text-white transition-all duration-300">
            {item.icon}
          </div>
          <div>
            {/* Título: de text-sm para text-lg */}
            <h3 className="font-extrabold text-lg text-gray-900">
              {item.title}
            </h3>
            {/* Descrição: de text-xs para text-base */}
            <p className="text-base text-gray-500 leading-snug mt-1.5 font-medium">
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
