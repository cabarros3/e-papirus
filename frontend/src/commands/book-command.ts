import { BookService } from "@/services/BookService";
import { Livro } from "@/types/livros"; // Confirme se o nome do arquivo é livro.ts ou livros.ts

export class SearchBookCommand {
  constructor(
    private service: BookService,
    private query: string,
    private onSuccess: (livros: Livro[]) => void // Callback para devolver os dados
  ) {}

  async execute(): Promise<void> {
    try {
      console.log(`Buscando por: ${this.query}`);
      const data = await this.service.getAllBooks(this.query);
      this.onSuccess(data);
    } catch (error) {
      console.error("Erro na busca:", error);
      alert("Erro ao buscar livros. Verifique o console.");
      this.onSuccess([]);
    }
  }
}
