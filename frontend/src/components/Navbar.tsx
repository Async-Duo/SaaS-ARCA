import { useState, useRef, useEffect } from "react";
import type { PuntoVenta } from "../types";
import { AlertaExpiracion } from "./AlertaExpiracion";

interface NavbarProps {
  usuario: string | null;
  rutaActiva: string;
  puntoVenta?: PuntoVenta;
  diasVencimiento?: number;
  fechaVencimiento?: string;
  onAbrirAuth: (modo: "login" | "register") => void;
  onCerrarSesion: () => void;
  onAbrirTutorial: () => void;
}

export function Navbar({
  usuario,
  rutaActiva,
  puntoVenta,
  diasVencimiento = 6,
  fechaVencimiento = "20 Sep",
  onAbrirAuth,
  onCerrarSesion,
  onAbrirTutorial,
}: NavbarProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const enlaces = [
    { nombre: "Dashboard", href: "/dashboard" },
    { nombre: "Facturas", href: "/facturas" },
    { nombre: "Ajustes", href: "/ajustes" },
  ];

  useEffect(() => {
    function handleClickAfuera(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("click", handleClickAfuera);
    return () => document.removeEventListener("click", handleClickAfuera);
  }, []);

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-20">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* LADO IZQUIERDO: Logo + Navegación */}
        <div className="flex items-center gap-6 sm:gap-8">
          <span className="text-xl font-black text-sky-400 tracking-wider select-none shrink-0">
            FacturAR
          </span>

          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
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

        {/* LADO DERECHO: Metadatos o Botones */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {usuario ? (
            <>
              {puntoVenta && (
                <span className="hidden lg:inline-flex items-center text-xs font-mono bg-slate-950/80 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-800">
                  Pto. {String(puntoVenta.numero).padStart(4, "0")} · #
                  {String(puntoVenta.ultimoNumero).padStart(8, "0")}
                </span>
              )}

              <div className="hidden sm:block">
                <AlertaExpiracion
                  diasRestantes={diasVencimiento}
                  fechaVencimiento={fechaVencimiento}
                />
              </div>

              {/* Menú de Perfil por Clic */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuAbierto((prev) => !prev)}
                  className="flex items-center gap-2 bg-slate-950/50 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-white">
                    👤
                  </div>
                  <span className="text-xs font-medium text-slate-200 max-w-25 sm:max-w-none truncate">
                    {usuario}
                  </span>
                  <span
                    className={`text-[10px] text-slate-500 transition-transform ${menuAbierto ? "rotate-180" : ""}`}
                  >
                    ⌵
                  </span>
                </button>

                {menuAbierto && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-800 text-[11px] text-slate-400">
                      Contribuyente:{" "}
                      <strong className="text-white block truncate">
                        {usuario}
                      </strong>
                    </div>

                    {/* Botón Guía ARCA */}
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onAbrirTutorial();
                        setMenuAbierto(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-sky-400 hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      Guía de Habilitación ARCA
                    </button>

                    {/* Botón Cerrar Sesión */}
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onCerrarSesion();
                        setMenuAbierto(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer border-t border-slate-800/60"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAbrirAuth("login")}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all cursor-pointer"
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => onAbrirAuth("register")}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition-all cursor-pointer"
              >
                Registrate
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
