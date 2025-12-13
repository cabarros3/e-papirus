import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="flex sm:flex-row gap-3 w-full max-w-md mx-auto">
      <input
        type="search"
        className="bg-alice-blue p-3 rounded-md w-full sm:w-auto flex-1"
        placeholder="Buscar..."
      />
      <button className="bg-alice-blue p-3 rounded-md flex justify-center items-center">
        <Search className="text-black" size={18} />
      </button>
    </div>
  );
}
