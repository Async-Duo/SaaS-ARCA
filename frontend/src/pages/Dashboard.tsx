import { useState } from "react";
import type { DatosFiscales, Factura, PuntoVenta } from "../types";
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
import { Auth } from "./Auth";
import { TutorialOnboarding } from "../components/TutorialOnboarding";
import { ModalNuevaFactura } from "../components/ModalNuevaFactura";

export function Dashboard() {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [datosFiscales, setDatosFiscales] = useState<DatosFiscales | null>(
    null,
  );
  const [facturas, setFacturas] = useState<Factura[]>([]);

  const [puntoVenta] = useState<PuntoVenta>({
    numero: 1,
    tipo: "Web Service",
    bloqueado: false,
    ultimoNumero: 3,
  });

  // Control de Modales
  const [modalAuth, setModalAuth] = useState<"login" | "register" | null>(null);
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [modalFacturaAbierto, setModalFacturaAbierto] = useState(false);

  // Al autenticarse con éxito
  const handleAuthSuccess = (
    esNuevoRegistro: boolean,
    datosUsuarioRemoto?: { razonSocial: string; cuit: string },
  ) => {
    setModalAuth(null);

    if (datosUsuarioRemoto) {
      // Setea el nombre real del usuario autenticado
      setUsuario(datosUsuarioRemoto.razonSocial);

      // Actualiza la tarjeta fiscal con la Razón Social y CUIT reales
      setDatosFiscales({
        cuit: datosUsuarioRemoto.cuit,
        razonSocial: datosUsuarioRemoto.razonSocial,
        domicilioFiscal: "Domicilio Fiscal no registrado en padrón",
        categoria: "Categoría C", // O la categoría por defecto
        tipoActividad: "Servicios",
        topeCategoria: 13325000,
        facturadoUltimos12Meses: 0, // Inicia en $0 para el usuario nuevo
      });
    } else {
      // Fallback si no llegaron datos
      setUsuario("Usuario Autenticado");
    }

    // Si es registro nuevo, abre el tutorial interactivo
    if (esNuevoRegistro) {
      setMostrarTutorial(true);
    }
  };

  const handleCerrarSesion = () => {
    setUsuario(null);
    setDatosFiscales(null);
    setFacturas([]);
  };

  const refrescarPadron = async () => {
    await new Promise((res) => setTimeout(res, 800));
    if (datosFiscales) setDatosFiscales({ ...datosFiscales });
  };

  const handleFacturaCreada = (nueva: Factura) => {
    setFacturas((prev) => [nueva, ...prev]);
    if (datosFiscales) {
      setDatosFiscales({
        ...datosFiscales,
        facturadoUltimos12Meses:
          datosFiscales.facturadoUltimos12Meses + nueva.importeTotal,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        usuario={usuario}
        rutaActiva="Dashboard"
        puntoVenta={puntoVenta}
        diasVencimiento={6}
        fechaVencimiento="20 Sep"
        onAbrirAuth={(modo) => setModalAuth(modo)}
        onCerrarSesion={handleCerrarSesion}
        onAbrirTutorial={() => setMostrarTutorial(true)}
      />

      <main className="max-w-350 mx-auto w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-10 space-y-8">
        {/* Banner preventivo de vencimiento (Recordatorio real al usuario) */}
        {usuario && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span>
                <strong>Próximo vencimiento Monotributo:</strong> Tenés plazo
                hasta el <strong>20 de Septiembre</strong> (quedan 6 días) para
                abonar la cuota mensual.
              </span>
            </div>
            <a
              href="https://auth.afip.gob.ar"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-lg border border-amber-500/30 whitespace-nowrap transition-colors"
            >
              Pagar VEP en ARCA →
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda */}
          <aside className="lg:col-span-4">
            <TarjetaFiscal
              datos={datosFiscales}
              alRefrescar={usuario ? refrescarPadron : undefined}
              onIniciarSesion={() => setModalAuth("login")}
            />
          </aside>

          {/* Columna Derecha */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Facturación General
                </h1>
                {!usuario && (
                  <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                    Iniciá sesión para emitir comprobantes con CAE.
                  </p>
                )}
              </div>

              {usuario ? (
                <button
                  type="button"
                  onClick={() => setModalFacturaAbierto(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <IconoPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>Nueva Factura</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setModalAuth("register")}
                  className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  Comenzar ahora
                </button>
              )}
            </div>

            {/* Progreso de Categoría */}
            <ProgresoCategoria
              facturado={datosFiscales?.facturadoUltimos12Meses || 0}
              tope={datosFiscales?.topeCategoria || 13325000}
              categoria={datosFiscales?.categoria || "Categoría C"}
            />

            {/* Listado de Facturas con soporte móvil */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-200">
                  Facturas Emitidas
                </h2>
                <span className="text-xs text-slate-500">
                  {facturas.length} comprobantes
                </span>
              </div>
              <TablaFacturas facturas={facturas} />
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Login / Registro */}
      {modalAuth && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setModalAuth(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs border border-slate-700 cursor-pointer z-10"
            >
              ✕
            </button>
            <Auth modoInicial={modalAuth} onSuccess={handleAuthSuccess} />
          </div>
        </div>
      )}

      {/* Modal Tutorial */}
      {mostrarTutorial && (
        <TutorialOnboarding onFinalizar={() => setMostrarTutorial(false)} />
      )}

      {/* Modal Nueva Factura */}
      {modalFacturaAbierto && (
        <ModalNuevaFactura
          cuitEmisor={datosFiscales?.cuit || "23352839159"}
          puntoVenta={puntoVenta.numero}
          onCerrar={() => setModalFacturaAbierto(false)}
          onFacturaCreada={handleFacturaCreada}
        />
      )}
    </div>
  );
}
