import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// Configurando a fonte Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // opcional, adiciona os pesos que você vai usar
});

export const metadata: Metadata = {
  title: "e-Papirus",
  description: "Biblioteca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>{children}</body>
    </html>
  );
}
