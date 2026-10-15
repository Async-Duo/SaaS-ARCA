import { prisma } from "./db";

// Mapeo de tipos de comprobantes según la codificación de ARCA
const TIPO_COMPROBANTE_MAP: Record<number, string> = {
	1: "Factura A",
	6: "Factura B",
	11: "Factura C",
	2: "Nota de Débito A",
	7: "Nota de Débito B",
	12: "Nota de Débito C",
	3: "Nota de Crédito A",
	8: "Nota de Crédito B",
	13: "Nota de Crédito C",
};

export async function listarComprobantes(cuitEmisor: string) {
	const comprobantes = await prisma.comprobante.findMany({
		where: { cuitEmisor },
		orderBy: { createdAt: "desc" },
	});

	return comprobantes.map((item) => {
		// Formato de número de comprobante estándar de AFIP (Ej: "00001-00000001")
		const ptoVtaFormatted = String(item.puntoVenta).padStart(5, "0");
		const nroCbteFormatted = String(item.numeroComprobante).padStart(8, "0");

		const tipoNombre =
			TIPO_COMPROBANTE_MAP[item.tipoComprobante] ||
			`Tipo ${item.tipoComprobante}`;

		return {
			id: item.id,
			fecha: item.createdAt.toISOString().split("T")[0], // YYYY-MM-DD
			fechaFormatted: new Intl.DateTimeFormat("es-AR", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			}).format(item.createdAt), // DD/MM/YYYY
			comprobanteTipo: tipoNombre,
			comprobanteNumero: `${ptoVtaFormatted}-${nroCbteFormatted}`,
			cliente: item.clienteNombre,
			docTipo: item.docTipo,
			docNro: item.docNro,
			importe: item.importeTotal,
			cae: item.cae || "-",
			caeVencimiento: item.caeVencimiento || "-",
			estado: item.resultado === "A" ? "Aprobado" : "Rechazado",
		};
	});
}
