export interface DatosFiscales {
  cuit: string;
  razonSocial: string;
  domicilioFiscal: string;
  categoria: string;
  tipoActividad: "Servicios" | "Productos" | "Ambos";
  topeCategoria: number;
  facturadoUltimos12Meses: number;
}

export interface PuntoVenta {
  numero: number;
  tipo: "Web Service" | "Comprobantes en Línea";
  bloqueado: boolean;
  ultimoNumero: number;
}

export interface Factura {
  id: string;
  fecha: string;
  tipoComprobante: "Factura C";
  puntoVenta: number;
  numeroComprobante: number;
  cliente: {
    nombre: string;
    documento: string;
    tipoDoc: "CUIT" | "DNI" | "Consumidor Final";
  };
  importeTotal: number;
  estado: "Autorizada" | "Rechazada";
  cae: string;
  vencimientoCae: string;
}

export interface UsuarioSesion {
  cuit: string;
  razonSocial: string;
  puntoVenta?: number;
  requiereOnBoarding?: boolean;
}

// Condiciones de IVA
export type CondicionIvaReceptor =
  | "Consumidor Final"
  | "Responsable Inscripto"
  | "Monotributista"
  | "Exento";

export interface OpcionCondicionIva {
  id: number; // Codigo exigido por ARCA
  etiqueta: CondicionIvaReceptor;
  docTipoPorDefecto: number; // 99 para Consumidor Final, 80 para CUIT
  requiereDoc: boolean;
}

export const CONDICIONES_IVA: OpcionCondicionIva[] = [
  {
    id: 5,
    etiqueta: "Consumidor Final",
    docTipoPorDefecto: 99,
    requiereDoc: false,
  },
  {
    id: 1,
    etiqueta: "Responsable Inscripto",
    docTipoPorDefecto: 80,
    requiereDoc: true,
  },
  {
    id: 6,
    etiqueta: "Monotributista",
    docTipoPorDefecto: 80,
    requiereDoc: true,
  },
  { id: 4, etiqueta: "Exento", docTipoPorDefecto: 80, requiereDoc: true },
];
