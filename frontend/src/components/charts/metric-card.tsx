// components/dashboard/MetricCard.tsx
export const MetricCard = ({ icon, label, value, color, bgColor }: any) => (
  <div
    className={`${bgColor} p-8 rounded-[32px] flex items-center gap-6 border border-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/40 group relative overflow-hidden`}
  >
    <div
      className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 transition-transform duration-700 group-hover:scale-[3] ${color.replace('text', 'bg')}`}
    />
    <div
      className={`p-5 bg-white rounded-[1.5rem] shadow-sm ${color} border border-gray-50 z-10 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}
    >
      {icon}
    </div>
    <div className="space-y-1 z-10">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
        {label}
      </p>
      <p className="text-5xl font-black text-gray-900 tabular-nums leading-none tracking-tighter">
        {value || 0}
      </p>
    </div>
  </div>
);
