import { useState } from "react";
import type { DatosFiscales } from "../types";
import { IconoRefresco, IconoUbicacion } from "./Iconos";

interface TarjetaFiscalProps {
  datos: DatosFiscales;
  alRefrescar: () => Promise<void>;
}

export function TarjetaFiscal({ datos, alRefrescar }: TarjetaFiscalProps) {
  const [cargando, setCargando] = useState(false);

  const manejarRefresco = async () => {
    setCargando(true);
    await alRefrescar();
    setCargando(false);
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
              {datos.categoria} • {datos.tipoActividad}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2.5">
              {datos.razonSocial}
            </h2>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              CUIT {datos.cuit}
            </p>
          </div>

          {/* Boton de refresco*/}
          <button
            onClick={manejarRefresco}
            disabled={cargando}
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/60 hover:border-slate-300 disabled:opacity-50 cursor-pointer"
            title="Refrescar datos con ARCA"
          >
            <IconoRefresco
              className={`w-4 h-4 ${cargando ? "animate-spin text-emerald-600" : ""}`}
            />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <IconoUbicacion className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{datos.domicilioFiscal}</span>
        </div>
      </div>
    </div>
  );
}
