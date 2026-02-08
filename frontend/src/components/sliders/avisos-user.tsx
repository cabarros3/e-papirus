'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

// Importação necessária dos estilos do Swiper
import 'swiper/css';
import 'swiper/css/pagination';

import { BellRing, Megaphone, Info } from 'lucide-react';

const avisos = [
  {
    id: 1,
    tag: 'Atualização',
    titulo: 'Alteração no funcionamento',
    texto:
      'Informamos que a partir da próxima semana teremos novos horários de atendimento digital para suporte técnico.',
    icon: <Info className="w-6 h-6" />,
    color: 'blue',
  },
  {
    id: 2,
    tag: 'Novidade',
    titulo: 'Nova coleção disponível',
    texto:
      'Confira os novos livros que acabaram de chegar na biblioteca. Temos romances e ficção científica esperando por você.',
    icon: <Megaphone className="w-6 h-6" />,
    color: 'green',
  },
  {
    id: 3,
    tag: 'Feriado',
    titulo: 'Aviso de Feriado',
    texto:
      'Neste próximo feriado, a biblioteca estará fechada. Retornaremos às atividades normais no dia seguinte às 08:00h.',
    icon: <BellRing className="w-6 h-6" />,
    color: 'orange',
  },
];

export default function NotificationSliderUser() {
  return (
    <div className="w-full animate-in fade-in duration-700">
      <div
        className="relative overflow-hidden bg-white rounded-[32px] border border-gray-100 shadow-sm
        [&_.swiper-pagination]:bottom-6
        [&_.swiper-pagination-bullet]:bg-gray-200 
        [&_.swiper-pagination-bullet]:opacity-100
        [&_.swiper-pagination-bullet-active]:bg-blue-600 
        [&_.swiper-pagination-bullet-active]:w-6
        [&_.swiper-pagination-bullet-active]:rounded-full
        [&_.swiper-pagination-bullet]:transition-all
        [&_.swiper-pagination-bullet]:duration-300"
      >
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 8000 }}
          className="pb-10"
        >
          {avisos.map((aviso) => (
            <SwiperSlide key={aviso.id}>
              <div className="flex flex-col md:flex-row items-center gap-6 p-8 md:p-10">
                {/* Ícone Dinâmico */}
                <div className="shrink-0 w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 relative">
                  <div className="absolute inset-0 bg-blue-400/10 rounded-2xl" />
                  {aviso.icon}
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left min-w-0">
                  {/* Badge Pequena e "w-fit" como os cards de livro */}
                  <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.15em] mb-3 border border-blue-100 w-fit whitespace-nowrap">
                    {aviso.tag}
                  </span>

                  <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2 tracking-tight leading-tight">
                    {aviso.titulo}
                  </h2>

                  <p className="text-gray-500 font-medium leading-relaxed max-w-3xl text-sm md:text-base line-clamp-2 md:line-clamp-none">
                    {aviso.texto}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
