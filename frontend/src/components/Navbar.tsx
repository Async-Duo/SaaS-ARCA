import type { PuntoVenta } from "../types";
import { AlertaExpiracion } from "./AlertaExpiracion";

interface NavbarProps {
  usuario: string;
  rutaActiva: string;
  puntoVenta: PuntoVenta;
  diasVencimiento: number;
  fechaVencimiento: string;
}

export function Navbar({
  usuario,
  rutaActiva,
  puntoVenta,
  diasVencimiento,
  fechaVencimiento,
}: NavbarProps) {
  const enlaces = [
    { nombre: "Dashboard", href: "/dashboard" },
    { nombre: "Facturas", href: "/facturas" },
    { nombre: "Ajustes", href: "/ajustes" },
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* LOGO + LINKS (con separación generosa) */}
        <div className="flex items-center gap-10">
          <span className="text-xl font-black text-sky-400 tracking-wider select-none">
            ARCA
          </span>

          <nav className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            {enlaces.map((enlace) => {
              const esActivo =
                enlace.nombre.toLowerCase() === rutaActiva.toLowerCase();
              return (
                <a
                  key={enlace.nombre}
                  href={enlace.href}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    esActivo
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  {enlace.nombre}
                </a>
              );
            })}
          </nav>
        </div>

        {/* METADATOS + PERFIL */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center text-xs font-mono bg-slate-950/80 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-800">
            Pto. {String(puntoVenta.numero).padStart(4, "0")} · #
            {String(puntoVenta.ultimoNumero).padStart(8, "0")}
          </span>

          <AlertaExpiracion
            diasRestantes={diasVencimiento}
            fechaVencimiento={fechaVencimiento}
          />

          <div className="flex items-center gap-2.5 bg-slate-950/50 border border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-white">
              👤
            </div>
            <span className="text-xs font-medium text-slate-200">
              {usuario}
            </span>
            <span className="text-[10px] text-slate-500">⌵</span>
          </div>
        </div>
      </div>
    </header>
  );
}
