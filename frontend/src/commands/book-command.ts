import { BookService } from "../services/book-service";
import { Livro } from "@/types/livros";

export class SearchBookCommand {
  constructor(
    private service: BookService,
    private query: string,
    private onSuccess: (livros: Livro[]) => void
  ) {}

  async execute(): Promise<void> {
    try {
      // Removi o alert para não atrapalhar a experiência do usuário
      const data = await this.service.getAllBooks(this.query);
      this.onSuccess(data);
    } catch (error) {
      console.error("Erro no SearchBookCommand:", error);
      this.onSuccess([]);
    }
  }
}

export class GetPopularBooksCommand {
  constructor(
    private service: BookService,
    private onSuccess: (livros: Livro[]) => void // Renomeei para manter padrão
  ) {}

  async execute(): Promise<void> {
    try {
      const dados = await this.service.getMostBorrowed();
      this.onSuccess(dados);
    } catch (error) {
      console.error("Erro no GetPopularBooksCommand:", error);
      // Retornar um array vazio evita que o componente quebre ao tentar fazer .map()
      this.onSuccess([]);
    }
  }
}
