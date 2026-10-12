import express from "express";
import { listarComprobantes } from "../listarComprobantes";
import { crearYEmitirFactura } from "../comprobanteService";

const ComprobantesRouter = express.Router();

// GET /api/comprobantes?cuit=23352839159
// Obtener Comprobantes
ComprobantesRouter.route("/facturas").get(async (req, res) => {
	try {
		console.log("Leyendo ruta de comprobantes...");
		const cuit = (req.query.cuit as string) || "23352839159";

		const lista = await listarComprobantes(cuit);

		res.json({
			ok: true,
			total: lista.length,
			data: lista,
		});
	} catch (error: any) {
		console.error("Error al obtener comprobantes:", error);
		res.status(500).json({
			ok: false,
			message: "Error al obtener la lista de comprobantes.",
			error: error.message,
		});
	}
});

// POST /api/comprobantes/emitir
// POST Nueva factura
ComprobantesRouter.route("/facturas").post(async (req, res) => {
	try {
		console.log("Creando Factura...");
		const {
			cuitEmisor,
			puntoVenta,
			tipoComprobante,
			concepto,
			docTipo,
			docNro,
			clienteNombre,
			importeTotal,
		} = req.body;

		// Validaciones básicas de entrada
		if (!cuitEmisor || !puntoVenta || !importeTotal) {
			return res.status(400).json({
				ok: false,
				message:
					"Faltan campos obligatorios (cuitEmisor, puntoVenta, importeTotal).",
			});
		}

		const nuevaFactura = await crearYEmitirFactura({
			cuitEmisor,
			puntoVenta: Number(puntoVenta),
			tipoComprobante: Number(tipoComprobante || 11), // Por defecto Factura C
			concepto: Number(concepto || 1), // Por defecto Productos
			docTipo: Number(docTipo || 99), // Por defecto Consumidor Final
			docNro: docNro || 0,
			clienteNombre,
			importeTotal: Number(importeTotal),
		});

		res.status(201).json({
			ok: true,
			message: "¡Factura emitida y autorizada con éxito!",
			data: nuevaFactura,
		});
	} catch (error: any) {
		console.error("Error en emisión de factura:", error);
		res.status(500).json({
			ok: false,
			message: "Error al emitir el comprobante ante ARCA.",
			error: error.message,
		});
	}
});

export default ComprobantesRouter;
