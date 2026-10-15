import { generarYFirmarTRA, obtenerTokenYSign } from "./arcaAuth";
import { emitirFactura, obtenerUltimoComprobante } from "./wsfeService";

// Obtener Token
async function testCompleto() {
	try {
		console.log("1. Generando y firmando el TRA...");
		const cmsBase64 = await generarYFirmarTRA();

		console.log("2. Enviando a ARCA WSAA mediante fetch...");
		const credenciales = await obtenerTokenYSign(cmsBase64);

		console.log("-----------------------------------------");
		console.log("🔑 TOKEN OBTENIDO:", credenciales.token);
		console.log("✍️ SIGN OBTENIDO:", credenciales.sign);
		console.log("⏰ EXPIRA EN:", credenciales.expirationTime);
		console.log("-----------------------------------------");
	} catch (e) {
		console.error("Falló la prueba completa:", e);
	}
}

// Obtener ultimo numero Facturacion
async function testFacturacion() {
	try {
		const CUIT = "23352839159";
		const PUNTO_VENTA = 1;
		const TIPO_FACTURA_C = 11; // 1 = Factura A, 6 = Factura B, 11 = Factura C

		console.log("🔍 Consultando último comprobante en ARCA WSFE...");
		const ultimoNro = await obtenerUltimoComprobante(
			CUIT,
			PUNTO_VENTA,
			TIPO_FACTURA_C
		);

		console.log(`-----------------------------------------`);
		console.log(`📄 Último comprobante autorizado: ${ultimoNro}`);
		console.log(
			`👉 El próximo comprobante a emitir será el N°: ${ultimoNro + 1}`
		);
		console.log(`-----------------------------------------`);
	} catch (e) {
		console.error("Falló la consulta a WSFE:", e);
	}
}

async function testFacturacionCompleta() {
	try {
		const CUIT = "23352839159";
		const PUNTO_VENTA = 1;
		const TIPO_FACTURA_C = 11;

		console.log("1. Consultando último comprobante...");
		const ultimoNro = await obtenerUltimoComprobante(
			CUIT,
			PUNTO_VENTA,
			TIPO_FACTURA_C
		);
		const proximoNro = ultimoNro + 1;

		console.log(`2. Emitiendo Factura C N° ${proximoNro}...`);

		const resultado = await emitirFactura({
			cuitEmisor: CUIT,
			puntoVenta: PUNTO_VENTA,
			tipoComprobante: TIPO_FACTURA_C,
			numeroComprobante: proximoNro,
			concepto: 1, // 1 = Productos
			docTipo: 99, // 99 = Consumidor Final
			docNro: 0,
			importeTotal: 1500.5, // Importe de prueba
		});

		if (resultado.exito) {
			console.log("-----------------------------------------");
			console.log("🎉 ¡FACTURA AUTORIZADA POR ARCA!");
			console.log("📄 N° COMPROBANTE:", resultado.comprobanteNumero);
			console.log("🔑 CAE:", resultado.cae);
			console.log("⏰ VENCIMIENTO CAE:", resultado.caeVencimiento);
			console.log("-----------------------------------------");
		} else {
			console.log("❌ Rechazado:", resultado.errores);
		}
	} catch (e) {
		console.error("Falló la prueba de emisión:", e);
	}
}

testFacturacionCompleta();
