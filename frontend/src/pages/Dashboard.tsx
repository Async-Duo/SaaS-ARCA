import { useState } from "react";
import {
  mockDatosFiscales,
  mockFacturas,
  mockPuntoVentaActivo,
} from "../mocks/mockData";
import { AlertaExpiracion } from "../components/AlertaExpiracion";
import { TarjetaFiscal } from "../components/TarjetaFiscal";
import { ProgresoCategoria } from "../components/ProgresoCategoria";
import { TablaFacturas } from "../components/TablaFacturas";
import { IconoPlus } from "../components/Iconos";

export function Dashboard() {
  const [datosFiscales, setDatosFiscales] = useState(mockDatosFiscales);
  const [facturas] = useState(mockFacturas);
  const [puntoVenta] = useState(mockPuntoVentaActivo);

  const refrescarPadron = async () => {
    //Simula llamada a endpoint de back ws-sr-padron
    await new Promise((res) => setTimeout(res, 800));
    setDatosFiscales({ ...datosFiscales });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-12">
      {/* Barra superior */}
      <header className="bg-white border-b border-slate-200/80 shadow-xs sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Facturación ARCA
            </h1>
            <span className="hidden sm:inline-block text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
              Pto. Venta: {String(puntoVenta.numero).padStart(4, "0")} | Último:
              #{String(puntoVenta.ultimoNumero).padStart(8, "0")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <AlertaExpiracion diasRestantes={6} fechaVencimiento="20 Sep" />
            <a
              href="/nueva-factura"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <IconoPlus className="w-4 h-4" />
              <span>Nueva Factura</span>
            </a>
          </div>
        </div>
      </header>

      {/* Contenedor central */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Métricas */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TarjetaFiscal datos={datosFiscales} alRefrescar={refrescarPadron} />
          <ProgresoCategoria
            facturado={datosFiscales.facturadoUltimos12Meses}
            tope={datosFiscales.topeCategoria}
            categoria={datosFiscales.categoria}
          />
        </section>

        {/* Historial */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Facturas Emitidas
            </h2>
            <span className="text-xs text-slate-500">
              {facturas.length} comprobantes en esta sesión
            </span>
          </div>
          <TablaFacturas facturas={facturas} />
        </section>
      </main>
    </div>
  );
}
