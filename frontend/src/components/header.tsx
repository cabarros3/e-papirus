import { Button } from "./ui/button";

export default function Header() {
  return (
    <header className="flex justify-center sm:justify-end p-4 sm:p-5">
      <nav>
        <Button variant="default" size="lg" className="w-full sm:w-auto">
          Acessar o e-Papirus
        </Button>
      </nav>
    </header>
  );
}
