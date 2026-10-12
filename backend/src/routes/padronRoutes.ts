import express from "express";
import {
	consultarPadronARCA,
	obtenerOSincronizarContribuyente,
} from "../padronService";
import { obtenerResumenMonotributo } from "../comprobanteService";

const padronRoutes = express.Router();

// GET /api/comprobantes/padron/:cuit
padronRoutes.route("/padron/:cuit").get(async (req, res) => {
	try {
		const cuitConsultado = req.params.cuit;
		const cuitEmisor = "23352839159"; // Tu CUIT principal

		const datosPersona = await consultarPadronARCA(cuitConsultado);

		res.json({
			ok: true,
			data: datosPersona,
		});
	} catch (error: any) {
		console.error("Error al consultar padrón:", error);
		res.status(500).json({
			ok: false,
			message: "Error al consultar los datos fiscales en ARCA.",
			error: error.message,
		});
	}
});

// GET /api/dashboard-metrics?cuit=23352839159&refresh=false
padronRoutes.route("/dashboard-metricas").get(async (req, res) => {
	console.log("Leyendo dashboard-metricas");
	try {
		const cuit = (req.query.cuit as string) || "23352839159";
		const refresh = req.query.refresh === "true"; // Opción para forzar re-sincronización si el usuario presiona un botón

		// 1. Trae los datos de la DB (o sincroniza con ARCA solo la primera vez)
		const contribuyente = await obtenerOSincronizarContribuyente(cuit, refresh);

		// 2. Calcula el acumulado de facturas emitidas desde PostgreSQL usando la categoría persistida
		const resumen = await obtenerResumenMonotributo(
			cuit,
			contribuyente.categoriaMonotributo
		);

		res.json({
			ok: true,
			data: {
				contribuyente: contribuyente.razonSocial,
				cuit: contribuyente.cuit,
				categoria: contribuyente.categoriaMonotributo,
				ultimaSincronizacion: contribuyente.ultimaSincronizacion,
				topeAnual: resumen.topeAnual,
				totalFacturado: resumen.totalFacturado,
				porcentajeUtilizado: resumen.porcentajeUtilizado,
				restanteParaExceder: resumen.restanteParaExceder,
				alertaRecategorizacion: resumen.alertaRecategorizacion,
			},
		});
	} catch (error: any) {
		console.error("Error en dashboard-metrics:", error);
		res.status(500).json({
			ok: false,
			message: "Error al obtener las métricas del dashboard.",
			error: error.message,
		});
	}
});

// ¿Cómo funciona el flujo ahora?
// Primera petición del Frontend (GET /api/comprobantes/dashboard-metrics):

// El backend detecta que el CUIT no existe en la base de datos local.

// Llama a ARCA una sola vez, guarda el contribuyente en PostgreSQL y devuelve las métricas.

// Siguientes peticiones (Recargar la página/navegar):

// El backend responde directamente de PostgreSQL de forma instantánea (0 llamadas a ARCA).

// Boton de "Actualizar Categoría / Padrón":

// Si Meli agrega un botón de recargar en el dashboard, se llama a GET /api/comprobantes/dashboard-metrics?refresh=true para forzar la sincronización con ARCA y actualizar la base de datos.

export default padronRoutes;
