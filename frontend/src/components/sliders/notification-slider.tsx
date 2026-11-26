'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import { BellRing } from 'lucide-react';

const avisos = [
  {
    id: 1,
    tag: 'Atualização',
    titulo: 'Alteração no funcionamento',
    texto:
      'Informamos que a partir da próxima semana teremos novos horários de atendimento digital para suporte técnico.',
  },
  {
    id: 2,
    tag: 'Novidade',
    titulo: 'Nova coleção disponível',
    texto:
      'Confira os novos livros que acabaram de chegar na biblioteca. Temos romances, ficção científica e muito mais esperando por você.',
  },
  {
    id: 3,
    tag: 'Feriado',
    titulo: 'Aviso de Feriado',
    texto:
      'Neste próximo feriado, a biblioteca estará fechada. Retornaremos às atividades normais no dia seguinte às 08:00h.',
  },
];

export default function NotificationSlider() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      {/* Container com customização de Swiper via Tailwind 
          As classes [&_...] selecionam elementos internos do Swiper sem precisar de CSS externo
      */}
      <div
        className="relative overflow-hidden 
        bg-[#F8F4E3] dark:bg-[#1e1715] /* Cosmic Latte / Liver escuro */
        rounded-2xl 
        shadow-xl shadow-[#5C4033]/5 dark:shadow-none
        border border-[#A9A9A9]/30 dark:border-[#008080]/30 /* Silver / Teal */
        backdrop-blur-xl
        transition-all duration-300
        hover:shadow-[0_0_20px_rgba(0,127,255,0.15)] /* LED Azure */
        [&_.swiper-pagination]:bottom-4
        [&_.swiper-pagination-bullet]:bg-[#A9A9A9]/50 
        dark:[&_.swiper-pagination-bullet]:bg-[#008080]/50
        [&_.swiper-pagination-bullet]:opacity-100
        [&_.swiper-pagination-bullet-active]:bg-[#007FFF] 
        dark:[&_.swiper-pagination-bullet-active]:bg-[#008080]
        [&_.swiper-pagination-bullet-active]:w-6
        [&_.swiper-pagination-bullet-active]:rounded-full
        [&_.swiper-pagination-bullet]:transition-all
        [&_.swiper-pagination-bullet]:duration-300"
      >
        {/* Detalhe lateral Teal/Azure */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#007FFF] dark:bg-[#008080] z-10 transition-colors" />

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000 }}
          className="pb-12"
        >
          {avisos.map((aviso) => (
            <SwiperSlide key={aviso.id}>
              <div className="flex flex-col md:flex-row items-center gap-6 p-8 md:p-12">
                {/* Ícone de Destaque */}
                <div className="shrink-0 w-16 h-16 
                  bg-[#007FFF]/10 dark:bg-[#008080]/20 
                  rounded-2xl flex items-center justify-center 
                  text-[#007FFF] dark:text-[#008080] 
                  ring-1 ring-[#007FFF]/20 dark:ring-[#008080]/30 
                  transition-colors"
                >
                  <BellRing className="w-8 h-8 animate-pulse" />
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  {/* Badge */}
                  <span className="px-3 py-1 rounded-full 
                    bg-[#007FFF]/10 dark:bg-[#008080]/20 
                    text-[#007FFF] dark:text-[#008080] 
                    text-[10px] font-bold uppercase tracking-widest mb-3 
                    transition-colors"
                  >
                    {aviso.tag}
                  </span>

                  <h2 className="text-xl md:text-2xl font-bold 
                    text-[#5C4033] dark:text-[#F8F4E3] 
                    mb-2 transition-colors"
                  >
                    {aviso.titulo}
                  </h2>

                  <p className="text-[#5C4033]/80 dark:text-[#F8F4E3]/80 
                    leading-relaxed max-w-2xl text-sm md:text-base transition-colors"
                  >
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
