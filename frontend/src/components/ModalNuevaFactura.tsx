import { useState } from "react";
import {
  CONDICIONES_IVA,
  type CondicionIvaReceptor,
  type Factura,
} from "../types";

interface ModalNuevaFacturaProps {
  cuitEmisor: string;
  puntoVenta: number;
  onCerrar: () => void;
  onFacturaCreada: (factura: Factura) => void;
}

export function ModalNuevaFactura({
  cuitEmisor,
  puntoVenta,
  onCerrar,
  onFacturaCreada,
}: ModalNuevaFacturaProps) {
  const [condicionIva, setCondicionIva] =
    useState<CondicionIvaReceptor>("Consumidor Final");
  const [clienteNombre, setClienteNombre] = useState("Consumidor Final");
  const [docNro, setDocNro] = useState("0");
  const [concepto, setConcepto] = useState<number>(1); // 1 = Productos, 2 = Servicios

  // Renglones
  const [descripcion, setDescripcion] = useState(
    "Servicios profesionales de desarrollo",
  );
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(5400);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const condicionSeleccionada = CONDICIONES_IVA.find(
    (c) => c.etiqueta === condicionIva,
  )!;
  const importeTotal = cantidad * precioUnitario;

  const handleCambiarCondicion = (nueva: CondicionIvaReceptor) => {
    setCondicionIva(nueva);
    if (nueva === "Consumidor Final") {
      setClienteNombre("Consumidor Final");
      setDocNro("0");
    } else {
      setClienteNombre("");
      setDocNro("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const payload = {
      cuitEmisor,
      puntoVenta,
      tipoComprobante: 11, // Factura C
      concepto,
      docTipo: condicionSeleccionada.docTipoPorDefecto,
      docNro: condicionSeleccionada.requiereDoc ? docNro : 0,
      clienteNombre: clienteNombre.trim() || "Consumidor Final",
      importeTotal,
    };

    try {
      const res = await fetch("http://localhost:3000/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message || "Error al emitir factura ante ARCA");
      }

      // Mapear respuesta del back al formato de la tabla
      const nueva: Factura = {
        id: json.data.id,
        fecha: new Date().toISOString().split("T")[0],
        tipoComprobante: "Factura C",
        puntoVenta: json.data.puntoVenta,
        numeroComprobante: json.data.numeroComprobante,
        cliente: {
          nombre: json.data.clienteNombre,
          documento: String(json.data.docNro),
          tipoDoc:
            condicionIva === "Consumidor Final" ? "Consumidor Final" : "CUIT",
        },
        importeTotal: json.data.importeTotal,
        estado: "Autorizada",
        cae: json.data.cae,
        vencimientoCae: json.data.caeVencimiento,
      };

      onFacturaCreada(nueva);
      onCerrar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-[0_0_35px_rgba(56,189,248,0.1)] space-y-6">
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Nueva Factura C
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Punto de Venta: {String(puntoVenta).padStart(4, "0")} • CUIT
              Emisor: {cuitEmisor}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs p-3 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Receptor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Condición frente al IVA
              </label>
              <select
                value={condicionIva}
                onChange={(e) =>
                  handleCambiarCondicion(e.target.value as CondicionIvaReceptor)
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              >
                {CONDICIONES_IVA.map((opt) => (
                  <option key={opt.id} value={opt.etiqueta}>
                    {opt.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Concepto
              </label>
              <select
                value={concepto}
                onChange={(e) => setConcepto(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              >
                <option value={1}>1 - Productos</option>
                <option value={2}>2 - Servicios</option>
                <option value={3}>3 - Productos y Servicios</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre o Razón Social
              </label>
              <input
                type="text"
                required
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="Consumidor Final o Empresa"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {condicionSeleccionada.requiereDoc
                  ? "CUIT / CUIL (Obligatorio)"
                  : "Doc / DNI (Opcional)"}
              </label>
              <input
                type="text"
                required={condicionSeleccionada.requiereDoc}
                disabled={!condicionSeleccionada.requiereDoc}
                value={docNro}
                onChange={(e) => setDocNro(e.target.value)}
                placeholder={
                  condicionSeleccionada.requiereDoc ? "30712345679" : "0"
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white disabled:opacity-40 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Renglón del producto */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
              Detalle del Comprobante
            </span>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">
                Descripción
              </label>
              <input
                type="text"
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-center focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  Precio Unitario ($)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={precioUnitario}
                  onChange={(e) => setPrecioUnitario(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-right focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center px-1 pt-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">
              Total Factura
            </span>
            <span className="text-xl font-black font-mono text-sky-400">
              $
              {importeTotal.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Botón emitir */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {enviando ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Solicitando CAE a ARCA...</span>
              </>
            ) : (
              <span>Emitir Factura Electrónica C</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
