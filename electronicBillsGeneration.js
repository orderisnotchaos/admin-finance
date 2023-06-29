
const xml2js = require( 'xml2js' );
const fs = require( 'fs' );
const path = require( 'path' );
const soap = require( 'soap' );
const forge = require( 'node-forge' );
const { resolveMx } = require('dns');
const CUIT = 20398050631;
const WSAA_WSDL = path.resolve('./afipFiles/wsaa.wsdl');
const WSFE_WSDL = path.resolve('./afipFiles/wsfe.wsdl');
const TA_FOLDER = path.resolve('./afipFiles/');
let WSAA_URL = 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms';
const options = {
    CUIT:'20398050631',
};

let service = 'wsfe';



let soapClient;
let soapClient2;

function formatDate(date) {
    return date.toString()
    .replace(/(\d{4})(\d{2})(\d{2})/, (string, year, month, day) => `${year}-${month}-${day}`);
}

async function getWSInitialRequest(operation){


		if (operation === 'FEDummy') {
			return {};
		}

        const value = await createServiceTA('wsfe');
        if(value === undefined){
            return {'Auth':{'Token':undefined,
                            'Sign':undefined,
                            'Cuit':CUIT}};
        }
		const { token, sign } = value;

		return {
			'Auth' : { 
				'Token' : token,
				'Sign' 	: sign,
				'Cuit' 	: CUIT
				}
		};
	}

async function executeRequest(operation, params = {}) {

    if (!soapClient2) {
        let soapClientOptions = { 
            disableCache: true, 
            forceSoap12Headers: false
        };

        soapClient2 = await soap.createClientAsync(WSFE_WSDL, soapClientOptions);

        soapClient2.setEndpoint('https://wswhomo.afip.gov.ar/wsfev1/service.asmx');
    }

    let [ result ] = await soapClient2[operation+'Async'](params);

    return result;
}

async function executeRequest2(operation, params = {}){   

    const initialRequest = await getWSInitialRequest(operation);

    Object.assign(params, initialRequest); 

    const results = await executeRequest(operation, params);

    return results[operation+'Result'];
}

const CERT =path.resolve('./afipFiles/cert');
const PRIVATEKEY = path.resolve('./afipFiles/key');
let date = new Date();

var xmlParser = new xml2js.Parser({
    normalizeTags: true,
    normalize: true,
    explicitArray: false,
    attrkey: 'header',
    tagNameProcessors: [key => key.replace('soapenv:', '')]
});

async function createServiceTA(service){


    if (options['production']) {
		WSAA_URL = 'https://wsaa.afip.gov.ar/ws/services/LoginCms';
	}
	else {
		WSAA_URL = 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms';
	}

    const tra = (`<?xml version="1.0" encoding="UTF-8" ?>
        <loginTicketRequest version="1.0">
            <header>
                <uniqueId>${Math.floor(date.getTime() / 1000)}</uniqueId>
                <generationTime>${new Date(date.getTime() - 600000).toISOString()}</generationTime>
                <expirationTime>${new Date(date.getTime() + 600000).toISOString()}</expirationTime>
            </header>
            <service>${service}</service>
        </loginTicketRequest>`).trim();

    const certPromise = new Promise((resolve, reject) => {
        fs.readFile(CERT, { encoding:'utf8' }, (err, data) => err ? reject(err) : resolve(data));
    });
    const keyPromise = new Promise((resolve, reject) => {
        fs.readFile(PRIVATEKEY, { encoding:'utf8' }, (err, data) => err ? reject(err) : resolve(data));
    });

    const [cert, key] = await Promise.all([certPromise, keyPromise]);

    const p7 = forge.pkcs7.createSignedData();
    p7.content = forge.util.createBuffer(tra, "utf8");
    p7.addCertificate(cert);
    p7.addSigner({
        authenticatedAttributes: [{
            type: forge.pki.oids.contentType,
            value: forge.pki.oids.data,
        }, 
        {
            type: forge.pki.oids.messageDigest
        }, 
        {
            type: forge.pki.oids.signingTime, 
            value: new Date()
        }],
        certificate: cert,
        digestAlgorithm: forge.pki.oids.sha256,
        key: key,
    });
    p7.sign();

    const bytes = forge.asn1.toDer(p7.toAsn1()).getBytes();
    const signedTRA = Buffer.from(bytes, "binary").toString("base64");

        
    const taFilePath = path.resolve(
        TA_FOLDER,
        `TA-${options['CUIT']}-${service}${options['production'] ? '-production' : ''}.json`
    );

    const taFileAccessError = await new Promise((resolve) => {
        fs.access(taFilePath, fs.constants.F_OK, resolve);
    }); 

    if (!taFileAccessError) {
        
        const taData = require( taFilePath );
        const actualTime = new Date(Date.now() + 600000);
        const expirationTime = new Date(taData.header[1].expirationtime);

        // Delete TA cache
        delete require.cache[require.resolve(taFilePath)];

        if (actualTime < expirationTime) {
            // Return token authorization
            return {
                token : taData.credentials.token,
                sign : taData.credentials.sign
            }
        }
    }

    const loginArguments = { in0: signedTRA };

    const soapClientOptions = {disableCache:true, endpoint: WSAA_URL};

    const soapClient = await soap.createClientAsync(WSAA_WSDL,soapClientOptions);
    
    const [ loginCmsResult ] = await soapClient.loginCmsAsync(loginArguments);

    const res = await xmlParser.parseStringPromise(loginCmsResult.loginCmsReturn);

    await (new Promise((resolve, reject) => {
        fs.writeFile(taFilePath, JSON.stringify(res.loginticketresponse), (err) => {
            if (err) {
                reject(err);
                return { 
                        token : taData.credentials.token,
                        sign : taData.credentials.sign
                    };
            }
            resolve();
        });
    }));
}

async function electronicBillsGenerator( data, returnResponse = true){

    const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    const ultimo_comprobante_autorizado = await executeRequest2('FECompUltimoAutorizado',{PtoVta:data.ptoVta,CbteTipo:data.cbteTipo});
    const values = {
        'CantReg' 		: data.cantReg, // Cantidad de comprobantes a registrar
        'PtoVta' 		: data.ptoVta, // Punto de venta
        'CbteTipo' 		: data.cbteTipo, // Tipo de comprobante (ver tipos disponibles) 
        'Concepto' 		: data.concepto, // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
        'DocTipo' 		: data.docTipo, // Tipo de documento del comprador (ver tipos disponibles)
        'DocNro' 		: data.docNro, // Numero de documento del comprador
        'CbteDesde' 	: ultimo_comprobante_autorizado.CbteNro +1, // Numero de comprobante o numero del primer comprobante en caso de ser mas de uno
        'CbteHasta' 	: ultimo_comprobante_autorizado.CbteNro+1, // Numero de comprobante o numero del ultimo comprobante en caso de ser mas de uno
        'CbteFch' 		: parseInt(date.replace(/-/g, '')), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
        'ImpTotal' 		: data.impTotal, // Importe total del comprobante
        'ImpTotConc' 	: data.ImpTotConc, // Importe neto no gravado
        'ImpNeto' 		: data.impNeto, // Importe neto gravado
        'ImpOpEx' 		: data.impOpEx, // Importe exento de IVA
        'ImpTrib' 		: data.impTrib, //Importe total de tributos
        'FchServDesde' 	: data.fchServDesde, // (Opcional) Fecha de inicio del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
        'FchServHasta' 	: data.fchServHasta, // (Opcional) Fecha de fin del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
        'FchVtoPago' 	: data.fchVtoPago, // (Opcional) Fecha de vencimiento del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
        'MonId' 		: data.monId, //Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos) 
        'MonCotiz' 		: data.monCotiz, // Cotización de la moneda usada (1 para pesos argentinos)  
        'CbtesAsoc' 	: data.cbtesAsoc,
        'Tributos' 		: data.tributos, 
        'Opcionales' 	: data.opcionales, 
    };
    const req = {
        'FeCAEReq' : {
            'FeCabReq' : {
                'CantReg' 	: values['CbteHasta'] - values['CbteDesde'] + 1,
                'PtoVta' 	: values['PtoVta'],
                'CbteTipo' 	: values['CbteTipo']
            },
            'FeDetReq' : { 
                'FECAEDetRequest' : values
            }
        }
    };
    
		delete values['CantReg'];
		delete values['PtoVta'];
		delete values['CbteTipo'];

        if (values['Tributos']) 
			values['Tributos'] = { 'Tributo' : values['Tributos'] };

		if (values['Iva']) 
			values['Iva'] = { 'AlicIva' : values['Iva'] };
		
		if (values['CbtesAsoc']) 
			values['CbtesAsoc'] = { 'CbteAsoc' : values['CbtesAsoc'] };
		
		if (values['Compradores']) 
			values['Compradores'] = { 'Comprador' : values['Compradores'] };

		if (values['Opcionales']) 
			values['Opcionales'] = { 'Opcional' : values['Opcionales'] };

		const results = await executeRequest2('FECAESolicitar', req);

        if (returnResponse === true) {
			return results;
		}
		else{
			if (Array.isArray(results.FeDetResp.FECAEDetResponse)) {
				results.FeDetResp.FECAEDetResponse = results.FeDetResp.FECAEDetResponse[0];
			}

			return {
				'CAE' 		: results.FeDetResp.FECAEDetResponse.CAE,
				'CAEFchVto' : formatDate(results.FeDetResp.FECAEDetResponse.CAEFchVto),
			};
		}


}

async function getLastVoucher(salesPoint, type) {
    const req = {
        'PtoVta' 	: salesPoint,
        'CbteTipo' 	: type
    };

    return (await executeRequest2('FECompUltimoAutorizado', req));
}


async function getAllVouchers() {
    const req = {};

    return (await executeRequest2('FECompTotXRequest', req));
}
async function getVoucherInfo(number, salesPoint, type) {
    const req = {
        'FeCompConsReq' : {
            'CbteNro' 	: number,
            'PtoVta' 	: salesPoint,
            'CbteTipo' 	: type
        }
    };

    const result = await executeRequest2('FECompConsultar', req)
    .catch(err => { if (err.code === 602) { return null } else { throw err }});
    return result;
}

async function electronicBillGenerator(data){

    await createServiceTA(service);
    let res = await electronicBillsGenerator(data);
    return res;
}

async function serviceTA(service){
    const serviceTA = await createServiceTA(service);
    const bill = await electronicBillsGenerator();
} 


async function afipWebSerivceTest(){

const Request = await executeRequest2('FECompUltimoAutorizado',{PtoVta:85,CbteTipo:11});
console.log(Request);

}

//afipWebSerivceTest();


module.exports = {
    getVoucherInfo,
    electronicBillGenerator,
    getLastVoucher
}