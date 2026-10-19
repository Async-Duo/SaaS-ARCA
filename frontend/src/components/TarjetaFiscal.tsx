import { useState } from "react";
import type { DatosFiscales } from "../types";
import { IconoRefresco, IconoUbicacion } from "./Iconos";

interface TarjetaFiscalProps {
  datos: DatosFiscales | null;
  alRefrescar?: () => Promise<void>;
  onIniciarSesion?: () => void;
}

export function TarjetaFiscal({
  datos,
  alRefrescar,
  onIniciarSesion,
}: TarjetaFiscalProps) {
  const [cargando, setCargando] = useState(false);

  const handleRefrescar = async () => {
    if (!alRefrescar || cargando) return;
    setCargando(true);
    try {
      await alRefrescar();
    } finally {
      setCargando(false);
    }
  };

  if (!datos) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center shadow-[0_0_20px_rgba(56,189,248,0.04)] flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl text-slate-400 mb-3">
          🔒
        </div>
        <h2 className="text-base font-bold text-white">Identidad Fiscal</h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Ingresá con tu CUIT para consultar tu categoría, domicilio y topes de
          ARCA.
        </p>
        <button
          onClick={onIniciarSesion}
          className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
        >
          Conectar con CUIT
        </button>
      </div>
    );
  }

  return (
    <div className="relative bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 text-center shadow-[0_0_20px_rgba(56,189,248,0.04)] transition-all flex flex-col items-center">
      {alRefrescar && (
        <button
          onClick={handleRefrescar}
          disabled={cargando}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800/60 rounded-xl border border-slate-800 transition-colors cursor-pointer"
          title="Refrescar datos con ARCA"
        >
          <IconoRefresco
            className={`w-4 h-4 ${cargando ? "animate-spin text-sky-400" : ""}`}
          />
        </button>
      )}

      <div className="w-20 h-20 rounded-full bg-slate-800/80 border-2 border-slate-700 flex items-center justify-center text-3xl mb-4 text-slate-400 mt-2">
        👤
      </div>

      <h2 className="text-base font-bold text-white tracking-tight">
        {datos.razonSocial}
      </h2>
      <p className="text-xs font-mono text-slate-400 mt-1">CUIT {datos.cuit}</p>

      <div className="mt-3.5">
        <span className="inline-block text-xs font-semibold text-sky-300 bg-sky-950/60 border border-sky-800/60 px-3.5 py-1 rounded-full">
          {datos.categoria} • {datos.tipoActividad}
        </span>
      </div>

      <div className="w-full border-t border-slate-800/80 my-5" />

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 max-w-70">
        <IconoUbicacion className="w-4 h-4 text-slate-500 shrink-0" />
        <span className="truncate">{datos.domicilioFiscal}</span>
      </div>
    </div>
  );
}
