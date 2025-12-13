import { Button } from "./ui/button";

export default function Header() {
  return (
    <header className="flex justify-center sm:justify-end p-4 sm:p-5">
      <nav>
        <a href="/login">
          <Button variant="default" size="lg" className="w-full sm:w-auto">
            <i className="bi bi-person-circle m-1" ></i>
            Acessar o e-Papirus
          </Button>
        </a>

      </nav>
    </header>
  );
}
