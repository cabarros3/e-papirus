export default function BackgroundShapes() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Círculo no topo esquerdo */}
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-denin/3 blur-[80px]" />
      {/* Círculo no meio direita */}
      <div className="absolute top-[40%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-denin/5 blur-[100px]" />
      {/* Detalhe inferior esquerdo */}
      <div className="absolute bottom-[-10%] left-[10%] w-[20vw] h-[20vw] rounded-full bg-denin/2 blur-[60px]" />
    </div>
  );
}
