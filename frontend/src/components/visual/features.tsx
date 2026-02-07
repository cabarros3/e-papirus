import { BookOpen, ShieldCheck, Zap } from 'lucide-react';

export default function Features() {
  const items = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: 'Vasto Acervo',
      desc: 'Acesso a milhares de títulos digitais.',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Acesso Rápido',
      desc: 'Sua leitura em qualquer dispositivo.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: 'Segurança',
      desc: 'Dados protegidos e leitura segura.',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 w-full mt-8 border-t border-gray-100">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left px-4"
        >
          <div className="p-3 bg-denin/5 rounded-full text-denin ring-1 ring-denin/10">
            {item.icon}
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-800">{item.title}</h3>
            <p className="text-xs text-gray-500 leading-tight mt-1">
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
