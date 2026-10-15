import { prisma } from "./db";
import { emitirFactura, obtenerUltimoComprobante } from "./wsfeService";

interface EmitirFacturaInput {
	cuitEmisor: string;
	puntoVenta: number;
	tipoComprobante: number; // 11 = Factura C
	concepto: number; // 1 = Productos, 2 = Servicios
	docTipo: number; // 99 = Consumidor Final, 80 = CUIT, 96 = DNI
	docNro: string | number;
	clienteNombre?: string;
	importeTotal: number;
}

export async function crearYEmitirFactura(input: EmitirFacturaInput) {
	// 1. Consultar el último número autorizado en ARCA para calcular el correlativo
	const ultimoNro = await obtenerUltimoComprobante(
		input.cuitEmisor,
		input.puntoVenta,
		input.tipoComprobante
	);
	const proximoNro = ultimoNro + 1;

	// 2. Invocar a ARCA para obtener el CAE
	const resultadoArca = await emitirFactura({
		cuitEmisor: input.cuitEmisor,
		puntoVenta: input.puntoVenta,
		tipoComprobante: input.tipoComprobante,
		numeroComprobante: proximoNro,
		concepto: input.concepto,
		docTipo: input.docTipo,
		docNro: Number(input.docNro),
		importeTotal: input.importeTotal,
	});

	// 3. Si ARCA la rechaza, guardamos el intento fallido o devolvemos el error
	if (!resultadoArca.exito) {
		throw new Error(
			`ARCA rechazó el comprobante: ${JSON.stringify(resultadoArca.errores)}`
		);
	}

	// 4. Si fue aprobada ('A'), guardamos en PostgreSQL con Prisma
	const comprobanteGuardado = await prisma.comprobante.create({
		data: {
			cuitEmisor: input.cuitEmisor,
			puntoVenta: input.puntoVenta,
			tipoComprobante: input.tipoComprobante,
			numeroComprobante: proximoNro,
			concepto: input.concepto,
			docTipo: input.docTipo,
			docNro: String(input.docNro),
			clienteNombre: input.clienteNombre || "Consumidor Final",
			importeTotal: input.importeTotal,
			cae: resultadoArca.cae,
			caeVencimiento: resultadoArca.caeVencimiento,
			resultado: "A",
		},
	});

	return comprobanteGuardado;
}

// 1. Topes anuales por categoría del Monotributo
export const TOPES_MONOTRIBUTO: Record<
	string,
	{ topeAnual: number; descripcion: string }
> = {
	A: { topeAnual: 6450000, descripcion: "Categoría A" },
	B: { topeAnual: 9450000, descripcion: "Categoría B" },
	C: { topeAnual: 13325000, descripcion: "Categoría C" },
	D: { topeAnual: 16500000, descripcion: "Categoría D" },
	E: { topeAnual: 19400000, descripcion: "Categoría E" },
	F: { topeAnual: 24250000, descripcion: "Categoría F" },
	G: { topeAnual: 29000000, descripcion: "Categoría G" },
	H: { topeAnual: 44000000, descripcion: "Categoría H (Servicios Máximo)" },
};

// 2. Función para calcular el resumen acumulado y el % de la categoría
export async function obtenerResumenMonotributo(
	cuitEmisor: string,
	categoriaActual: string = "C"
) {
	// Fecha de hace 12 meses
	const haceUnAno = new Date();
	haceUnAno.setFullYear(haceUnAno.getFullYear() - 1);

	// Buscar todas las facturas aprobadas de los últimos 12 meses en PostgreSQL
	const facturas = await prisma.comprobante.findMany({
		where: {
			cuitEmisor,
			resultado: "A", // Solo comprobantes aprobados por ARCA
			createdAt: {
				gte: haceUnAno,
			},
		},
		select: {
			importeTotal: true,
			createdAt: true,
		},
	});

	// Sumar el importe total acumulado
	const totalFacturado = facturas.reduce(
		(acc, curr) => acc + curr.importeTotal,
		0
	);

	// Buscar el tope correspondiente a la categoría ingresada
	const infoCategoria =
		TOPES_MONOTRIBUTO[categoriaActual.toUpperCase()] || TOPES_MONOTRIBUTO["C"];
	const topeAnual = infoCategoria.topeAnual;

	// Calcular el porcentaje de consumo de la categoría
	const porcentajeUtilizado =
		topeAnual > 0 ? (totalFacturado / topeAnual) * 100 : 0;
	const alertaRecategorizacion = porcentajeUtilizado >= 80;

	return {
		categoria: categoriaActual.toUpperCase(),
		topeAnual,
		totalFacturado: Number(totalFacturado.toFixed(2)),
		porcentajeUtilizado: Number(porcentajeUtilizado.toFixed(2)),
		restanteParaExceder: Number((topeAnual - totalFacturado).toFixed(2)),
		alertaRecategorizacion,
		cantidadComprobantes: facturas.length,
	};
}
