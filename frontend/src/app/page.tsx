import Header from "@/components/header";
import SearchBar from "@/components/search-bar";

export default function Home() {
  return (
    <main className="flex flex-col gap-14 px-4 md:px-8 lg:px-16">
      <Header />
      <div className="flex flex-col gap-6 md:gap-10 justify-center items-center text-center max-w-3xl mx-auto">

        
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          <span className="text-denin">e</span>-Papirus
        </h1>
        <p className="text-base sm:text-lg md:text-xl">
          Explore nosso acervo digital e descubra livros, artigos e conteúdos
          especiais ao seu alcance.
        </p>
        <div className="w-full sm:w-3/4 md:w-2/3">
          <SearchBar />
        </div>
      </div>
    </main>
  );
}
