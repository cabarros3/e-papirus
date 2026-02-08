import { AlertCircle } from 'lucide-react';

export const ErrorState = ({ message }: { message: string }) => (
  <div className="p-8 py-12 max-w-7xl mx-auto animate-in fade-in zoom-in duration-500">
    <div className="bg-red-50 border border-red-200 rounded-[32px] p-12 text-center shadow-xl shadow-red-100/50">
      <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-red-800">Ops! Algo travou</h2>
      <p className="text-red-600/80 mb-8 max-w-md mx-auto font-medium">
        {message}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
      >
        Tentar Novamente
      </button>
    </div>
  </div>
);
