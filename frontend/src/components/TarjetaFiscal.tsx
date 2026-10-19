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
    <div className="relative bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-6 text-center shadow-[0_0_20px_rgba(56,189,248,0.06)] transition-all flex flex-col items-center">
      {/* Botón de refresco */}
      <button
        onClick={manejarRefresco}
        disabled={cargando}
        className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-sky-400 transition-colors cursor-pointer disabled:opacity-50"
      >
        <IconoRefresco
          className={`w-3 h-3 ${cargando ? "animate-spin text-sky-400" : ""}`}
        />
        <span>Sincronizar con ARCA</span>
      </button>

      {/* Avatar circular */}
      <div className="w-20 h-20 rounded-full bg-slate-800/80 border-2 border-slate-700 flex items-center justify-center text-3xl mb-4 text-slate-400 mt-2">
        👤
      </div>

      {/* Datos del contribuyente */}
      <h2 className="text-base font-bold text-white tracking-tight">
        {datos.razonSocial}
      </h2>
      <p className="text-xs font-mono text-slate-400 mt-1">CUIT {datos.cuit}</p>

      {/* Categoría */}
      <div className="mt-3.5">
        <span className="inline-block text-xs font-semibold text-sky-300 bg-sky-950/60 border border-sky-800/60 px-3.5 py-1 rounded-full">
          {datos.categoria} • {datos.tipoActividad}
        </span>
      </div>

      <div className="w-full border-t border-slate-800/80 my-5" />

      {/* Domicilio */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 max-w-[280px]">
        <IconoUbicacion className="w-4 h-4 text-slate-500 shrink-0" />
        <span className="truncate">{datos.domicilioFiscal}</span>
      </div>
    </div>
  );
}
