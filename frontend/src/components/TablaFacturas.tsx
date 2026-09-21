// src/components/TablaFacturas.tsx
// src/components/TablaFacturas.tsx
import type { Factura } from "../types";
import { IconoInfo } from "./Iconos";

interface TablaFacturasProps {
  facturas: Factura[];
}

export function TablaFacturas({ facturas }: TablaFacturasProps) {
  const enviarPorWhatsApp = (f: Factura) => {
    const pto = String(f.puntoVenta).padStart(4, "0");
    const nro = String(f.numeroComprobante).padStart(8, "0");
    const totalFormateado = f.importeTotal.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    });

    const texto = encodeURIComponent(
      `Hola ${f.cliente.nombre}, adjunto comprobante Factura C N° ${pto}-${nro} por un total de $${totalFormateado}. CAE: ${f.cae}`,
    );
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  };

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Aviso informativo legal/técnico */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 text-xs text-slate-600 flex items-center gap-2.5">
        <IconoInfo className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          Solo se listan las facturas generadas desde esta plataforma, no las
          históricas de ARCA.
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Comprobante</th>
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3 text-right">Importe</th>
              <th className="px-6 py-3 text-center">Estado / CAE</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {facturas.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-6 py-4 text-slate-600">{f.fecha}</td>
                <td className="px-6 py-4 font-mono font-medium text-slate-800">
                  {String(f.puntoVenta).padStart(4, "0")}-
                  {String(f.numeroComprobante).padStart(8, "0")}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">
                    {f.cliente.nombre}
                  </div>
                  <div className="text-xs text-slate-400">
                    {f.cliente.documento}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  $
                  {f.importeTotal.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {f.estado}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    CAE: {f.cae}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => alert(`Descargando comprobante ${f.id}...`)}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => enviarPorWhatsApp(f)}
                    className="px-2.5 py-1 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md transition-colors"
                  >
                    WhatsApp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
