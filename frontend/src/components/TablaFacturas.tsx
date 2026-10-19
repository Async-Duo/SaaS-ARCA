import type { Factura } from "../types";
import { IconoInfo, IconoWhatsApp } from "./Iconos";

interface TablaFacturasProps {
  facturas: Factura[];
}

export function TablaFacturas({ facturas }: TablaFacturasProps) {
  const enviarPorWhatsApp = (f: Factura) => {
    const pto = String(f.puntoVenta).padStart(4, "0");
    const nro = String(f.numeroComprobante).padStart(8, "0");
    const total = f.importeTotal.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    });
    const texto = encodeURIComponent(
      `Hola ${f.cliente.nombre}, adjunto Factura C N° ${pto}-${nro} por un total de $${total}. CAE: ${f.cae}`,
    );
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.04)] overflow-hidden">
      {/* Banner Informativo */}
      <div className="bg-slate-950/40 border-b border-slate-800/80 px-4 py-2.5 text-xs text-slate-400 flex items-center gap-2">
        <IconoInfo className="w-4 h-4 text-sky-400 shrink-0" />
        <span className="truncate">
          Solo comprobantes generados en esta plataforma.
        </span>
      </div>

      {/* 1. VISTA MÓVIL (Celulares como iPhone SE / pantallas < 768px) */}
      <div className="block md:hidden divide-y divide-slate-800/60">
        {facturas.map((f) => (
          <div key={f.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[11px] text-slate-400">
                  {f.fecha}
                </span>
                <h3 className="font-semibold text-sm text-white">
                  {f.cliente.nombre}
                </h3>
                <span className="font-mono text-[11px] text-slate-500">
                  {String(f.puntoVenta).padStart(4, "0")}-
                  {String(f.numeroComprobante).padStart(8, "0")}
                </span>
              </div>
              <div className="text-right">
                <span className="block font-mono font-bold text-white text-base">
                  $
                  {f.importeTotal.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-950/60 text-sky-400 border border-sky-800/50">
                  {f.estado}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/40">
              <span className="text-[10px] font-mono text-slate-500 truncate max-w-[170px]">
                CAE: {f.cae}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Descargando PDF ${f.id}...`)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 rounded-lg"
                >
                  PDF
                </button>
                <button
                  onClick={() => enviarPorWhatsApp(f)}
                  className="p-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:text-emerald-400"
                  title="WhatsApp"
                >
                  <IconoWhatsApp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. VISTA ESCRITORIO (Tablets y Desktop >= 768px) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="w-[12%] px-3 py-3">Fecha</th>
              <th className="w-[18%] px-3 py-3">Comprobante</th>
              <th className="w-[26%] px-3 py-3">Cliente</th>
              <th className="w-[16%] px-3 py-3 text-right">Importe</th>
              <th className="w-[12%] px-3 py-3 text-center">Estado / CAE</th>
              <th className="w-[16%] px-3 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {facturas.map((f) => (
              <tr
                key={f.id}
                className="hover:bg-slate-800/25 transition-colors"
              >
                <td className="px-3 py-3.5 font-mono text-slate-300 whitespace-nowrap">
                  {f.fecha}
                </td>
                <td className="px-3 py-3.5 font-mono font-medium text-slate-200 whitespace-nowrap">
                  {String(f.puntoVenta).padStart(4, "0")}-
                  {String(f.numeroComprobante).padStart(8, "0")}
                </td>
                <td className="px-3 py-3.5">
                  <div
                    className="font-semibold text-white truncate"
                    title={f.cliente.nombre}
                  >
                    {f.cliente.nombre}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    {f.cliente.documento}
                  </div>
                </td>
                <td className="px-3 py-3.5 text-right font-bold text-white font-mono text-sm whitespace-nowrap">
                  $
                  {f.importeTotal.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-3 py-3.5 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-950/50 text-sky-400 border border-sky-800/50">
                    {f.estado}
                  </span>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    CAE: {f.cae.slice(0, 8)}...
                  </div>
                </td>
                <td className="px-3 py-3.5 text-center">
                  <div className="inline-flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => alert(`Descargando PDF ${f.id}...`)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => enviarPorWhatsApp(f)}
                      className="p-1.5 text-slate-300 hover:text-emerald-300 bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-700/60 rounded-md transition-colors cursor-pointer"
                      title="Compartir por WhatsApp"
                    >
                      <IconoWhatsApp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
