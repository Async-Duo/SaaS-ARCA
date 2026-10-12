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
  tipo: "Web Service" | "Comprobanes en Línea";
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
