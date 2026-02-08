// components/dashboard/States.tsx
import { Loader2, AlertCircle } from 'lucide-react';

export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
    <div className="relative">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <div className="absolute inset-0 blur-xl bg-blue-400/20 animate-pulse"></div>
    </div>
    <p className="text-gray-400 font-medium mt-4 tracking-widest uppercase text-xs">
      Sincronizando biblioteca...
    </p>
  </div>
);
