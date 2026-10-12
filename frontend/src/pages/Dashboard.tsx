import { useState } from "react";
import {
  mockDatosFiscales,
  mockFacturas,
  mockPuntoVentaActivo,
} from "../mocks/mockData";
import { TarjetaFiscal } from "../components/TarjetaFiscal";
import { ProgresoCategoria } from "../components/ProgresoCategoria";
import { TablaFacturas } from "../components/TablaFacturas";
import { IconoPlus } from "../components/Iconos";
import { Navbar } from "../components/Navbar";

export function Dashboard() {
  const [datosFiscales, setDatosFiscales] = useState(mockDatosFiscales);
  const [facturas] = useState(mockFacturas);

  const refrescarPadron = async () => {
    //Simula llamada a endpoint de back ws-sr-padron
    await new Promise((res) => setTimeout(res, 800));
    setDatosFiscales({ ...datosFiscales });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        usuario="M. L. Gómez"
        rutaActiva="Dashboard"
        puntoVenta={mockPuntoVentaActivo}
        diasVencimiento={6}
        fechaVencimiento="20 Sep"
      />

      {/* Contenedor central */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-4">
            <TarjetaFiscal
              datos={datosFiscales}
              alRefrescar={refrescarPadron}
            />
          </aside>

          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Facturación General
              </h1>
              <a
                href="/nueva-factura"
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
              >
                <IconoPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Nueva Factura</span>
              </a>
            </div>

            <ProgresoCategoria
              facturado={datosFiscales.facturadoUltimos12Meses}
              tope={datosFiscales.topeCategoria}
              categoria={datosFiscales.categoria}
            />

            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-bold text-slate-200">
                Facturas Emitidas
              </h2>
              <TablaFacturas facturas={facturas} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
