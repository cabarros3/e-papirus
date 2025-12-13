"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import { Megaphone } from "lucide-react";

const avisos = [
  {
    id: 1,
    titulo: "Alteração no horário de funcionamento",
    texto:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
  {
    id: 2,
    titulo: "Nova coleção disponível",
    texto:
      "Confira os novos livros que acabaram de chegar na biblioteca. Temos romances, ficção científica e muito mais esperando por você.",
  },
  {
    id: 3,
    titulo: "Aviso de Feriado",
    texto:
      "Neste próximo feriado, a biblioteca estará fechada. Retornaremos às atividades normais no dia seguinte às 08:00h.",
  },
];

export default function NotificationSlider() {
  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <div className="bg-slate-50 rounded-xl p-10 shadow-sm border border-slate-100">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          // 1. AUMENTEI O PADDING AQUI DE pb-10 PARA pb-12 OU pb-14
          className="pb-14"
        >
          {avisos.map((aviso) => (
            <SwiperSlide key={aviso.id}>
              {/* Adicionei 'h-full' para garantir alinhamento */}
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 md:px-12 h-full">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Megaphone className="w-8 h-8 text-slate-400 rotate-[-15deg]" />
                  <h2 className="text-xl md:text-2xl font-bold text-orange-500">
                    {aviso.titulo}
                  </h2>
                  <Megaphone className="w-8 h-8 text-slate-400 rotate-[15deg] scale-x-[-1]" />
                </div>

                <p className="text-gray-600 leading-relaxed max-w-2xl">
                  {aviso.texto}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <style jsx global>{`
          /* 2. ADICIONEI ESTA REGRA PARA EMPURRAR AS BOLINHAS PARA BAIXO */
          .swiper-pagination {
            bottom: 0px !important; /* Cola as bolinhas no fundo do padding */
          }

          .swiper-pagination-bullet {
            width: 10px;
            height: 10px;
            background-color: #cbd5e1;
            opacity: 1;
            margin: 0 6px !important; /* Um pouco mais de espaço entre elas */
          }
          .swiper-pagination-bullet-active {
            background-color: #f97316 !important;
            width: 12px;
            height: 12px;
          }
        `}</style>
      </div>
    </div>
  );
}
