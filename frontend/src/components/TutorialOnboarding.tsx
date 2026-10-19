import { useState } from "react";

interface TutorialOnboardingProps {
  cuitRepresentante?: string;
  onFinalizar: () => void;
}

export function TutorialOnboarding({
  cuitRepresentante = "23352839159",
  onFinalizar,
}: TutorialOnboardingProps) {
  const [paso, setPaso] = useState(1);
  const [copiado, setCopiado] = useState(false);
  const [puntoVenta, setPuntoVenta] = useState("");

  const copiarCuit = () => {
    navigator.clipboard.writeText(cuitRepresentante);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-[0_0_35px_rgba(56,189,248,0.1)] space-y-6">
        {/* Encabezado y Progreso */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-sky-400 uppercase tracking-wider">
              Habilitación ARCA
            </span>
            <span className="text-slate-400 font-mono">Paso {paso} de 3</span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(paso / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Pasos */}
        {paso === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">
              1. Delegar el servicio en ARCA
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para que el sistema emita facturas por vos sin pedirte tu clave
              cada vez, autorizanos como representante informático:
            </p>
            <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <li>
                Ingresá a la web de <strong>ARCA</strong> con tu CUIT y Clave
                Fiscal.
              </li>
              <li>
                Buscá el servicio{" "}
                <strong>Administrador de Relaciones de Clave Fiscal</strong>.
              </li>
              <li>
                Hacé clic en <strong>Nueva Relación</strong> y buscá:{" "}
                <code className="text-sky-300">
                  Facturación Electrónica - WSFEv1
                </code>
                .
              </li>
              <li>En "Representante", pegá nuestro CUIT:</li>
            </ol>

            <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="font-mono text-xs text-white flex-1 pl-2">
                {cuitRepresentante}
              </span>
              <button
                type="button"
                onClick={copiarCuit}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {copiado ? "¡Copiado!" : "Copiar CUIT"}
              </button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">
              2. Crear tu Punto de Venta Web Service
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Las facturas automáticas requieren un Punto de Venta exclusivo
              separado de la web de ARCA:
            </p>
            <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <li>
                En ARCA, abrí{" "}
                <strong>Administración de Puntos de Venta y Domicilios</strong>.
              </li>
              <li>
                Seleccioná tu empresa y hacé clic en{" "}
                <strong>A/B/M Puntos de Venta</strong> →{" "}
                <strong>Agregar</strong>.
              </li>
              <li>
                Elegí en Sistema:{" "}
                <strong className="text-sky-300">
                  "Factura Electrónica - Web Services"
                </strong>
                .
              </li>
              <li>
                Guardá y recordá el número generado (por ejemplo:{" "}
                <code className="text-sky-300">00002</code>).
              </li>
            </ol>
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">
              3. Conectar tu Punto de Venta
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ingresá el número del Punto de Venta que creaste recién para
              empezar a emitir comprobantes:
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Número de Punto de Venta
              </label>
              <input
                type="number"
                min="1"
                value={puntoVenta}
                onChange={(e) => setPuntoVenta(e.target.value)}
                placeholder="ej. 2"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="bg-sky-950/30 border border-sky-800/40 p-3 rounded-xl text-xs text-sky-300">
              ¡Listo! Una vez confirmado, tu cuenta queda vinculada y lista para
              facturar en 1 clic.
            </div>
          </div>
        )}

        {/* Botones de Navegación del Stepper */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          {paso > 1 ? (
            <button
              type="button"
              onClick={() => setPaso(paso - 1)}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Anterior
            </button>
          ) : (
            <div />
          )}

          {paso < 3 ? (
            <button
              type="button"
              onClick={() => setPaso(paso + 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinalizar}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.25)] transition-all cursor-pointer"
            >
              Finalizar y Comenzar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
