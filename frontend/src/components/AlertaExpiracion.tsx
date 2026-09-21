interface AlertaExpiracionProps {
  diasRestantes: number;
  fechaVencimiento: string;
}

export function AlertaExpiracion({
  diasRestantes,
  fechaVencimiento,
}: AlertaExpiracionProps) {
  const esUrgente = diasRestantes <= 7;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
        esUrgente
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${esUrgente ? "bg-amber-500 animate-pulse" : "bg-slate-400"}`}
      />
      <span>
        Vto. Cuota: {fechaVencimiento} ({diasRestantes}) días
      </span>
    </div>
  );
}
