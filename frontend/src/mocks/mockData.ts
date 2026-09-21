import type { DatosFiscales, PuntoVenta, Factura } from "../types";

export const mockDatosFiscales: DatosFiscales = {
  cuit: "27-38492018-4",
  razonSocial: "MARÍA LUZ GÓMEZ",
  domicilioFiscal: "Av. Colón 1245, Mar del Plata, Buenos Aires",
  categoria: "Categoría D",
  tipoActividad: "Servicios",
  topeCategoria: 16000000,
  facturadoUltimos12Meses: 13400000, // 83.75% -> Dispara alerta preventiva
};

export const mockPuntoVentaActivo: PuntoVenta = {
  numero: 2,
  tipo: "Web Service",
  bloqueado: false,
  ultimoNumero: 45,
};

export const mockFacturas: Factura[] = [
  {
    id: "fac-001",
    fecha: "2026-09-10",
    tipoComprobante: "Factura C",
    puntoVenta: 2,
    numeroComprobante: 45,
    cliente: {
      nombre: "Estudio Jurídico Martínez",
      documento: "30-71234567-9",
      tipoDoc: "CUIT",
    },
    importeTotal: 185000,
    estado: "Autorizada",
    cae: "74382910482910",
    vencimientoCae: "2026-09-20",
  },
  {
    id: "fac-002",
    fecha: "2026-09-02",
    tipoComprobante: "Factura C",
    puntoVenta: 2,
    numeroComprobante: 44,
    cliente: {
      nombre: "Consumidor Final",
      documento: "-",
      tipoDoc: "Consumidor Final",
    },
    importeTotal: 45000,
    estado: "Autorizada",
    cae: "74382098319203",
    vencimientoCae: "2026-09-12",
  },
];
