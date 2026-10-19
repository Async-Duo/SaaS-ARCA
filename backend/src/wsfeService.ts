import { getAuthCredentials } from "./arcaAuth";

const WSFE_URL = "https://wswhomo.afip.gov.ar/wsfev1/service.asmx";

export async function obtenerUltimoComprobante(
	cuit: string,
	puntoVenta: number,
	tipoComprobante: number
): Promise<number> {
	// 1. Obtenemos credenciales válidas (desde caché o pidiéndolas a WSAA)
	const { token, sign } = await getAuthCredentials();

	// 2. Sobre SOAP para consultar el último número emitido
	const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <FECompUltimoAutorizado xmlns="http://ar.gov.afip.dif.FEV1/">
      <Auth>
        <Token>${token}</Token>
        <Sign>${sign}</Sign>
        <Cuit>${cuit}</Cuit>
      </Auth>
      <PtoVta>${puntoVenta}</PtoVta>
      <CbteTipo>${tipoComprobante}</CbteTipo>
    </FECompUltimoAutorizado>
  </soap:Body>
</soap:Envelope>`;

	const response = await fetch(WSFE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "text/xml; charset=utf-8",
			SOAPAction: '"http://ar.gov.afip.dif.FEV1/FECompUltimoAutorizado"',
		},
		body: soapEnvelope,
	});

	const xmlText = await response.text();

	const cbteNroMatch = xmlText.match(/<CbteNro>(.*?)<\/CbteNro>/);

	if (!cbteNroMatch) {
		console.error("Respuesta WSFE Error:\n", xmlText);
		throw new Error("No se pudo obtener el último comprobante.");
	}

	return parseInt(cbteNroMatch[1], 10);
}

// ---------------------------------------------------------
// Emitir Factura Electrónica y Obtener CAE (FECAESolicitar)
// ---------------------------------------------------------
// Actualizamos la interface de entrada para aceptar opcionalmente la condición de IVA del receptor
interface FacturaInput {
	cuitEmisor: string;
	puntoVenta: number;
	tipoComprobante: number; // 11 = Factura C
	numeroComprobante: number;
	concepto: number; // 1 = Productos, 2 = Servicios, 3 = Productos y Servicios
	docTipo: number; // 99 = Consumidor Final, 80 = CUIT, 96 = DNI
	docNro: number; // 0 para Consumidor Final sin CUIT/DNI
	importeTotal: number;
	condicionIvaReceptorId?: number; // 5 para Consumidor Final, 1 para IVA Responsable Inscripto, etc.
}

export async function emitirFactura(factura: FacturaInput) {
	const { token, sign } = await getAuthCredentials();

	// Fecha actual en formato YYYYMMDD
	const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, "");

	const impNeto = factura.importeTotal;
	const impTotConc = 0;
	const impIVA = 0;
	const impTrib = 0;
	const impOpEx = 0;

	let fechasServicioXml = "";
	if (factura.concepto === 2 || factura.concepto === 3) {
		fechasServicioXml = `
            <FchServDesde>${hoy}</FchServDesde>
            <FchServHasta>${hoy}</FchServHasta>
            <FchVtoPago>${hoy}</FchVtoPago>`;
	}

	// RG 5616: Condición frente al IVA del receptor
	const condicionIva =
		factura.condicionIvaReceptorId ?? (factura.docTipo === 99 ? 5 : 6);

	const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <FECAESolicitar xmlns="http://ar.gov.afip.dif.FEV1/">
      <Auth>
        <Token>${token}</Token>
        <Sign>${sign}</Sign>
        <Cuit>${factura.cuitEmisor}</Cuit>
      </Auth>
      <FeCAEReq>
        <FeCabReq>
          <CantReg>1</CantReg>
          <PtoVta>${factura.puntoVenta}</PtoVta>
          <CbteTipo>${factura.tipoComprobante}</CbteTipo>
        </FeCabReq>
        <FeDetReq>
          <FECAEDetRequest>
            <Concepto>${factura.concepto}</Concepto>
            <DocTipo>${factura.docTipo}</DocTipo>
            <DocNro>${factura.docNro}</DocNro>
            <CbteDesde>${factura.numeroComprobante}</CbteDesde>
            <CbteHasta>${factura.numeroComprobante}</CbteHasta>
            <CbteFch>${hoy}</CbteFch>
            <ImpTotal>${factura.importeTotal.toFixed(2)}</ImpTotal>
            <ImpTotConc>${impTotConc.toFixed(2)}</ImpTotConc>
            <ImpNeto>${impNeto.toFixed(2)}</ImpNeto>
            <ImpOpEx>${impOpEx.toFixed(2)}</ImpOpEx>
            <ImpTrib>${impTrib.toFixed(2)}</ImpTrib>
            <ImpIVA>${impIVA.toFixed(2)}</ImpIVA>${fechasServicioXml}
           <CondicionIVAReceptorId>${condicionIva}</CondicionIVAReceptorId>
            <MonId>PES</MonId>
            <MonCotiz>1</MonCotiz>
          </FECAEDetRequest>
        </FeDetReq>
      </FeCAEReq>
    </FECAESolicitar>
  </soap:Body>
</soap:Envelope>`;

	const response = await fetch(WSFE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "text/xml; charset=utf-8",
			SOAPAction: '"http://ar.gov.afip.dif.FEV1/FECAESolicitar"',
		},
		body: soapEnvelope,
	});

	const xmlText = await response.text();

	const resultadoMatch = xmlText.match(/<Resultado>(.*?)<\/Resultado>/);
	const caeMatch = xmlText.match(/<CAE>(.*?)<\/CAE>/);
	const caeFchVtoMatch = xmlText.match(/<CAEFchVto>(.*?)<\/CAEFchVto>/);
	const obsMatch = xmlText.match(/<Msg>(.*?)<\/Msg>/g);

	if (resultadoMatch && resultadoMatch[1] === "A" && caeMatch) {
		return {
			exito: true,
			resultado: resultadoMatch[1],
			cae: caeMatch[1],
			caeVencimiento: caeFchVtoMatch ? caeFchVtoMatch[1] : "",
			comprobanteNumero: factura.numeroComprobante,
		};
	} else {
		console.error("❌ FACTURA RECHAZADA POR ARCA:\n", xmlText);
		return {
			exito: false,
			resultado: resultadoMatch ? resultadoMatch[1] : "R",
			errores: obsMatch
				? obsMatch.map((m) => m.replace(/<\/?Msg>/g, ""))
				: ["Error al autorizar el comprobante"],
		};
	}
}
