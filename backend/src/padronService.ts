import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { prisma } from "./db";

const PADRON_URL =
	"https://awshomo.afip.gov.ar/sr-padron/webservices/personaServiceA5";

// Función interna para generar un TRA específico para el padrón (servicio ws_sr_padron_a5)
async function obtenerCredencialesPadron() {
	const now = new Date();
	const generationTime = new Date(now.getTime() - 10 * 60 * 1000);
	const expirationTime = new Date(now.getTime() + 12 * 3600 * 1000);
	const uniqueId = Math.floor(Date.now() / 1000);

	const traXml = `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
    <header>
        <source>SERIALNUMBER=CUIT 23352839159, CN=miestadofiscalhomo</source>
        <destination>CN=wsaahomo, O=AFIP, C=AR, SERIALNUMBER=CUIT 33693450239</destination>
        <uniqueId>${uniqueId}</uniqueId>
        <generationTime>${generationTime.toISOString()}</generationTime>
        <expirationTime>${expirationTime.toISOString()}</expirationTime>
    </header>
    <service>ws_sr_padron_a5</service>
</loginTicketRequest>`;

	const certPath = path.join(__dirname, "../src/certificates/homo.crt");
	const keyPath = path.join(__dirname, "../src/certificates/private_key.key");
	const traPath = path.join(__dirname, "../src/certificates/TRA_padron.xml");
	const pemPath = path.join(
		__dirname,
		"../src/certificates/TRA_padron.xml.pem"
	);

	fs.writeFileSync(traPath, traXml);

	const command = `"C:\\Program Files\\Git\\usr\\bin\\openssl.exe" cms -sign -in "${traPath}" -out "${pemPath}" -signer "${certPath}" -inkey "${keyPath}" -outform DER -md sha256 -nodetach`;
	execSync(command);

	const firmadoDer = fs.readFileSync(pemPath);
	const cmsBase64 = firmadoDer.toString("base64");

	// Petición SOAP al WSAA para obtener Token y Sign del padrón
	const wsaaUrl = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms";
	const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.afip.gov.ar/ws/services/LoginCms">
    <soapenv:Header/>
    <soapenv:Body>
        <wsaa:loginCms>
            <in0>${cmsBase64}</in0>
        </wsaa:loginCms>
    </soapenv:Body>
</soapenv:Envelope>`;

	const response = await fetch(wsaaUrl, {
		method: "POST",
		headers: { "Content-Type": "text/xml;charset=UTF-8", SOAPAction: '""' },
		body: soapEnvelope,
	});

	const xmlResponse = await response.text();
	const tokenMatch = xmlResponse.match(
		/(?:<token>|&lt;token&gt;)(.*?)(?:<\/token>|&lt;\/token&gt;)/
	);
	const signMatch = xmlResponse.match(
		/(?:<sign>|&lt;sign&gt;)(.*?)(?:<\/sign>|&lt;\/sign&gt;)/
	);

	if (!tokenMatch || !signMatch) {
		throw new Error("No se pudo obtener el Token para el servicio de Padrón.");
	}

	return { token: tokenMatch[1], sign: signMatch[1] };
}

// ---------------------------------------------------------
// CONSULTAR DATOS Y CATEGORÍA DEL CONTRIBUYENTE
// ---------------------------------------------------------
export async function consultarPadronARCA(cuitConsultado: string) {
	try {
		const response = await fetch(
			`https://soa.afip.gob.ar/sr-padron/v2/persona/${cuitConsultado}`
		);

		if (!response.ok) {
			throw new Error(`Error HTTP Padrón: ${response.status}`);
		}

		const data = await response.json();

		if (data && data.data) {
			const persona = data.data;
			return {
				cuit: cuitConsultado,
				razonSocial:
					persona.nombre || persona.apellido
						? `${persona.nombre || ""} ${persona.apellido || ""}`.trim()
						: "Contribuyente Monotributo",
				categoriaMonotributo: persona.monotributo?.categoria || "C", // Categoria oficial ("A", "B", "C"...)
				estado: persona.estado || "ACTIVO",
			};
		}

		return {
			cuit: cuitConsultado,
			razonSocial: "Contribuyente Monotributo",
			categoriaMonotributo: "C",
		};
	} catch (error: any) {
		console.error("Error al consultar Padrón:", error.message);
		return {
			cuit: cuitConsultado,
			razonSocial: "Contribuyente Monotributo",
			categoriaMonotributo: "C",
		};
	}
}

async function consultarARCADirecto(cuit: string) {
	try {
		const response = await fetch(
			`https://soa.afip.gob.ar/sr-padron/v2/persona/${cuit}`
		);
		if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

		const data = await response.json();
		if (data && data.data) {
			const persona = data.data;
			return {
				cuit,
				razonSocial:
					persona.nombre || persona.apellido
						? `${persona.nombre || ""} ${persona.apellido || ""}`.trim()
						: "Contribuyente Monotributo",
				categoriaMonotributo: persona.monotributo?.categoria || "C",
			};
		}
	} catch (error) {
		console.warn(
			"📌 ARCA Padrón respondió con fallback o error. Usando valores predeterminados de prueba."
		);
	}

	return {
		cuit,
		razonSocial: "Contribuyente Monotributo",
		categoriaMonotributo: "C",
	};
}

export async function obtenerOSincronizarContribuyente(
	cuit: string,
	forzarSincronizacion: boolean = false
) {
	// 1. Verificar si ya existe en la Base de Datos local
	let contribuyente = await prisma.contribuyente.findUnique({
		where: { cuit },
	});

	// 2. Si no existe en la DB o se solicita forzar sincronización, le pegamos a ARCA
	if (!contribuyente || forzarSincronizacion) {
		console.log(`🌐 Consultando Padrón ARCA para CUIT: ${cuit}...`);
		const datosArca = await consultarARCADirecto(cuit);

		contribuyente = await prisma.contribuyente.upsert({
			where: { cuit },
			update: {
				razonSocial: datosArca.razonSocial,
				categoriaMonotributo: datosArca.categoriaMonotributo,
				ultimaSincronizacion: new Date(),
			},
			create: {
				cuit,
				razonSocial: datosArca.razonSocial,
				categoriaMonotributo: datosArca.categoriaMonotributo,
				ultimaSincronizacion: new Date(),
			},
		});
		console.log(`💾 Datos guardados en PostgreSQL para CUIT: ${cuit}`);
	} else {
		console.log(
			`⚡ Devolviendo datos de Padrón desde caché local en PostgreSQL (CUIT: ${cuit})`
		);
	}

	return contribuyente;
}
