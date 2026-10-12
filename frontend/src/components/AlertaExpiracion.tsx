interface AlertaExpiracionProps {
  diasRestantes: number;
  fechaVencimiento: string;
}

export function AlertaExpiracion({
  diasRestantes,
  fechaVencimiento,
}: AlertaExpiracionProps) {
  return (
    <div className="hidden sm:inline-flex items-center gap-2 text-xs font-mono bg-slate-950/80 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-800">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      <span>
        Vto:{" "}
        <strong className="text-amber-300 font-semibold">
          {fechaVencimiento}
        </strong>{" "}
        ({diasRestantes}d)
      </span>
    </div>
  );
}
