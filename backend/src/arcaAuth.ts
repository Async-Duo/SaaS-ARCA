import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface WsaaResponse {
	token: string;
	sign: string;
	expirationTime: string;
}

// Variables en memoria para actuar como Caché
let cachedAuth: WsaaResponse | null = null;

// Ruta cache
const TA_FILE_PATH = path.join(__dirname, "../src/certificates/ta_wsfe.json");

// ---------------------------------------------------------
// PASO A: Generar y firmar el TRA con OpenSSL
// ---------------------------------------------------------
export async function generarYFirmarTRA(): Promise<string> {
	const now = new Date();
	// Restamos 10 minutos por el desfase de reloj con ARCA
	const generationTime = new Date(now.getTime() - 10 * 60 * 1000);
	const expirationTime = new Date(now.getTime() + 12 * 3600 * 1000);

	const uniqueId = Math.floor(Date.now() / 1000);

	// Ajustamos la etiqueta <destination> con el valor literal exacto esperado por ARCA
	const traXml = `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
    <header>
        <source>SERIALNUMBER=CUIT 23352839159, CN=miestadofiscalhomo</source>
        <destination>CN=wsaahomo, O=AFIP, C=AR, SERIALNUMBER=CUIT 33693450239</destination>
        <uniqueId>${uniqueId}</uniqueId>
        <generationTime>${generationTime.toISOString()}</generationTime>
        <expirationTime>${expirationTime.toISOString()}</expirationTime>
    </header>
    <service>wsfe</service>
</loginTicketRequest>`;

	const certPath = path.join(__dirname, "../src/certificates/homo.crt");
	const keyPath = path.join(__dirname, "../src/certificates/private_key.key");
	const traPath = path.join(__dirname, "../src/certificates/TRA.xml");
	const pemPath = path.join(__dirname, "../src/certificates/TRA.xml.pem");

	fs.writeFileSync(traPath, traXml);

	try {
		const command = `"C:\\Program Files\\Git\\usr\\bin\\openssl.exe" cms -sign -in "${traPath}" -out "${pemPath}" -signer "${certPath}" -inkey "${keyPath}" -outform DER -md sha256 -nodetach`;

		execSync(command);

		const firmadoDer = fs.readFileSync(pemPath);
		const cmsBase64 = firmadoDer.toString("base64");

		return cmsBase64;
	} catch (error) {
		console.error("Error al firmar el TRA con OpenSSL:", error);
		throw error;
	}
}
// ---------------------------------------------------------
// PASO B: Enviar por SOAP (con fetch) y obtener Token y Sign
// ---------------------------------------------------------
export async function obtenerTokenYSign(
	cmsBase64: string
): Promise<WsaaResponse> {
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

	try {
		const response = await fetch(wsaaUrl, {
			method: "POST",
			headers: {
				"Content-Type": "text/xml;charset=UTF-8",
				SOAPAction: '""',
			},
			body: soapEnvelope,
		});

		const xmlResponse = await response.text();

		// 🔍 Imprimimos la respuesta completa de ARCA para ver la codificación exacta
		console.log("📄 RESPUESTA BRUTA DE ARCA:\n", xmlResponse);

		if (!response.ok) {
			console.error("❌ RESPUESTA DE ERROR DE ARCA:\n", xmlResponse);
			throw new Error(
				`Error HTTP en WSAA: ${response.status} ${response.statusText}`
			);
		}

		// Regex ajustada para capturar tanto etiquetas normales como caracteres escapados (&lt;token&gt;)
		const tokenMatch = xmlResponse.match(
			/(?:<token>|&lt;token&gt;)(.*?)(?:<\/token>|&lt;\/token&gt;)/
		);
		const signMatch = xmlResponse.match(
			/(?:<sign>|&lt;sign&gt;)(.*?)(?:<\/sign>|&lt;\/sign&gt;)/
		);
		const expirationMatch = xmlResponse.match(
			/(?:<expirationTime>|&lt;expirationTime&gt;)(.*?)(?:<\/expirationTime>|&lt;\/expirationTime&gt;)/
		);

		if (!tokenMatch || !signMatch) {
			throw new Error(
				"No se pudo extraer el Token o Sign de la respuesta de ARCA."
			);
		}

		return {
			token: tokenMatch[1],
			sign: signMatch[1],
			expirationTime: expirationMatch ? expirationMatch[1] : "",
		};
	} catch (error: any) {
		console.error("Error al conectar con WSAA de ARCA:", error.message);
		throw error;
	}
}

// ---------------------------------------------------------
// FUNCIÓN PRINCIPAL CON CACHÉ INTEGREDADO
// ---------------------------------------------------------
export async function getAuthCredentials(): Promise<WsaaResponse> {
	const now = new Date();

	// 1. Intentar leer el token guardado en el archivo local
	if (fs.existsSync(TA_FILE_PATH)) {
		try {
			const rawData = fs.readFileSync(TA_FILE_PATH, "utf-8");
			const savedAuth: WsaaResponse = JSON.parse(rawData);
			const expirationDate = new Date(savedAuth.expirationTime);

			// Si faltan más de 10 minutos para que expire, usamos el token guardado
			if (expirationDate.getTime() - now.getTime() > 10 * 60 * 1000) {
				console.log(
					"⚡ Reutilizando Token y Sign desde caché local (ta_wsfe.json)"
				);
				return savedAuth;
			}
		} catch (e) {
			console.warn(
				"⚠️ No se pudo leer el caché local, solicitando uno nuevo..."
			);
		}
	}

	// 2. Si no existe archivo o ya expiró, pedimos un nuevo Token a ARCA
	console.log("🔑 Solicitando nuevo Token y Sign a ARCA...");
	const cmsBase64 = await generarYFirmarTRA();
	const newAuth = await obtenerTokenYSign(cmsBase64);

	// 3. Guardamos el nuevo Token y Sign en el archivo JSON
	fs.writeFileSync(TA_FILE_PATH, JSON.stringify(newAuth, null, 2), "utf-8");

	return newAuth;
}
