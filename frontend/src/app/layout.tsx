import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';

// Configurando a fonte Poppins
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // opcional, adiciona os pesos que você vai usar
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500'], // Pesos para leitura
});

export const metadata: Metadata = {
  title: 'e-Papirus',
  description: 'Biblioteca',
  icons: {
    icon: '/img/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        // className={`${poppins.variable} ${inter.variable} font-sans antialiased`}
        className={`${poppins.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

// TODO: PARA QUANDO FOR USAR O AUTH

// import type { Metadata } from "next";
// import { Poppins } from "next/font/google";
// import "./globals.css";
// // 1. Importe o Provider que criamos
// import { AuthProvider } from "@/contexts/AuthContext";

// // Configurando a fonte Poppins
// const poppins = Poppins({
//   variable: "--font-poppins",
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"],
// });

// export const metadata: Metadata = {
//   title: "e-Papirus",
//   description: "Biblioteca",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     // Dica: Mudei para pt-br para acessibilidade correta no Brasil
//     <html lang="pt-br">
//       <body className={`${poppins.variable} antialiased`}>
//         {/* 2. Envolva o children com o AuthProvider */}
//         <AuthProvider>{children}</AuthProvider>
//       </body>
//     </html>
//   );
// }
