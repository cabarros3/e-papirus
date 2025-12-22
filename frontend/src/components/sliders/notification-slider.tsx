"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import { BellRing } from "lucide-react";

const avisos = [
  {
    id: 1,
    tag: "Atualização",
    titulo: "Alteração no funcionamento",
    texto:
      "Informamos que a partir da próxima semana teremos novos horários de atendimento digital para suporte técnico.",
  },
  {
    id: 2,
    tag: "Novidade",
    titulo: "Nova coleção disponível",
    texto:
      "Confira os novos livros que acabaram de chegar na biblioteca. Temos romances, ficção científica e muito mais esperando por você.",
  },
  {
    id: 3,
    tag: "Feriado",
    titulo: "Aviso de Feriado",
    texto:
      "Neste próximo feriado, a biblioteca estará fechada. Retornaremos às atividades normais no dia seguinte às 08:00h.",
  },
];

export default function NotificationSlider() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      {/* Container com customização de Swiper via Tailwind 
          As classes [&_...] selecionam elementos internos do Swiper sem precisar de CSS externo
      */}
      <div
        className="relative overflow-hidden bg-white rounded-2xl shadow-xl shadow-denin/5 border border-denin/10
        [&_.swiper-pagination]:bottom-4
        [&_.swiper-pagination-bullet]:bg-gray-200 
        [&_.swiper-pagination-bullet]:opacity-100
        [&_.swiper-pagination-bullet-active]:bg-denin 
        [&_.swiper-pagination-bullet-active]:w-6
        [&_.swiper-pagination-bullet-active]:rounded-full
        [&_.swiper-pagination-bullet]:transition-all
        [&_.swiper-pagination-bullet]:duration-300"
      >
        {/* Detalhe lateral denin */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-denin z-10" />

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
                <div className="shrink-0 w-16 h-16 bg-denin/5 rounded-2xl flex items-center justify-center text-denin ring-1 ring-denin/10">
                  <BellRing className="w-8 h-8 animate-pulse" />
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  {/* Badge */}
                  <span className="px-3 py-1 rounded-full bg-denin/10 text-denin text-[10px] font-bold uppercase tracking-widest mb-3">
                    {aviso.tag}
                  </span>

                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                    {aviso.titulo}
                  </h2>

                  <p className="text-gray-500 leading-relaxed max-w-2xl text-sm md:text-base">
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
