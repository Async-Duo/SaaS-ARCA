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

  const formatoPesos = (valor: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(valor);

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex- items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-700">
            Límite Anual ({categoria})
          </h3>
          <span
            className={`text-sm font-bold ${cercaDeLimite ? "text-amber-600" : "text-slate-800"}`}
          >
            {porcentaje}% consumido
          </span>
        </div>

        {/*Barra de progreso*/}
        <div className="w-full bg-state-100 rounded-full h-3 overflow-hidden mb-3">
          <div
            className={`h- full transition-all duration-500 rounded-full ${cercaDeLimite ? "bg-amber-500" : "bg-emerald-500"}`}
            style={{ width: `${porcentaje}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-slate-500 mb-4">
          <span>Facturado (12m): {formatoPesos(facturado)}</span>
          <span>Tope: {formatoPesos(tope)}</span>
        </div>
      </div>

      {cercaDeLimite && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg flex items-center gap-2.5">
          <IconoAlerta className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong className="font-semibold">Atención:</strong> Superaste el
            80% del tope anual. Vigilar próxima recategorización.
          </span>
        </div>
      )}
    </div>
  );
}
