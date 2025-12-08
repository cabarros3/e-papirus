"use client"; // Necessário para usar hooks

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function Header() {
  const router = useRouter();

  return (
    <header className="flex justify-center sm:justify-end p-4 sm:p-5">
      <nav>
        <Button
          onClick={() => router.push("/login")}
          variant="default"
          size="lg"
          className="w-full sm:w-auto"
        >
          Acessar o e-Papirus
        </Button>
      </nav>
    </header>
  );
}
