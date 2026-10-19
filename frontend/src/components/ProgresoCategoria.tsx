import { IconoAlerta } from "./Iconos";

interface ProgresoCategoriaProps {
  facturado: number;
  tope: number;
  categoria: string;
}

export function ProgresoCategoria({
  facturado,
  tope,
  categoria,
}: ProgresoCategoriaProps) {
  const porcentaje = Math.min(Math.round((facturado / tope) * 100), 100);
  const cercaDeLimite = porcentaje >= 80;

  const estilo =
    porcentaje >= 100
      ? {
          stroke: "text-rose-500",
          barra: "bg-rose-500",
          texto: "text-rose-400",
          alertaCaja: "bg-rose-950/30 border-rose-900/50 text-rose-300",
          alertaIcono: "text-rose-400",
          mensaje: "Límite anual superado. Riesgo inminente de exclusión.",
        }
      : porcentaje >= 80
        ? {
            stroke: "text-sky-400",
            barra: "bg-gradient-to-r from-sky-500 to-amber-400/90",
            texto: "text-amber-300",
            alertaCaja: "bg-amber-950/20 border-amber-900/40 text-amber-200/90",
            alertaIcono: "text-amber-400",
            mensaje:
              "Superaste el 80% del tope anual. Vigilar próxima recategorización.",
          }
        : {
            stroke: "text-sky-400",
            barra: "bg-sky-400",
            texto: "text-white",
            alertaCaja: "bg-sky-950/30 border-sky-900/40 text-sky-200",
            alertaIcono: "text-sky-400",
            mensaje: "",
          };

  const formatoPesos = (valor: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(valor);

  return (
    <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 shadow-[0_0_20px_rgba(56,189,248,0.04)] transition-colors flex flex-col md:flex-row items-center gap-6">
      {/* MEDIDOR CIRCULAR */}
      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          {/* Círculo de fondo */}
          <path
            className="text-slate-800"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Arco con color dinámico */}
          <path
            className={`${estilo.stroke} transition-all duration-500`}
            strokeDasharray={`${porcentaje}, 100`}
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className={`text-xl font-black ${estilo.texto}`}>
            {porcentaje}%
          </span>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
            Consumido
          </span>
        </div>
      </div>

      {/* DATOS Y BARRAS */}
      <div className="flex-1 w-full space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-slate-300">
            Límite Anual ({categoria})
          </span>
          <div className="flex gap-4 font-mono text-[11px]">
            <span className="text-slate-400">
              Facturado (12m):{" "}
              <strong className="text-white">{formatoPesos(facturado)}</strong>
            </span>
            <span className="text-slate-400">
              Tope:{" "}
              <strong className="text-slate-200">{formatoPesos(tope)}</strong>
            </span>
          </div>
        </div>

        {/* BARRA HORIZONTAL CON COLOR DINÁMICO */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`${estilo.barra} h-full rounded-full transition-all duration-500`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        {/* ALERTA DE PROXIMIDAD */}
        {cercaDeLimite && (
          <div
            className={`${estilo.alertaCaja} text-xs p-3 rounded-xl border flex items-center gap-2.5 transition-colors`}
          >
            <IconoAlerta className={`w-4 h-4 ${estilo.alertaIcono} shrink-0`} />
            <span>
              <strong className="font-semibold">Atención:</strong>{" "}
              {estilo.mensaje}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
