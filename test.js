const Afip = require('@afipsdk/afip.js');

const mercadopago = require('mercadopago');

const afip = new Afip({CUIT:20398050631});


async function asd(){

        result = await afip.RegisterScopeFour.getTaxpayerDetails(20398050631);
        console.log(result);
}

async function test(){

        mercadopago.configure({
                access_token: 'TEST-3468240649607797-042414-b3cc549bbd979fc20f529b3ce3db5a0c-181912221'
            });
let preference = {
        // el "purpose": "wallet_purchase" solo permite pagos registrados
        // para permitir pagos de guests puede omitir esta propiedad
        "purpose": "wallet_purchase",
        "items": [
          {
            "id": "item-ID-1234",
            "title": "Mi servicio",
            "quantity": 1,
            "unit_price": 500
          }
        ]
      };

        mercadopago.preferences.create(preference).then( (response) =>{

                const preferenceId = response.body.id;
                console.log(preferenceId);
        }).catch( (error) =>{
                console.log(error);
        })

}

test();