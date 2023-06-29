const mercadopago = require('mercadopago');

mercadopago.configure({
    access_token: 'TEST-3468240649607797-042414-b3cc549bbd979fc20f529b3ce3db5a0c-181912221'
})

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
    console.log(response);
    console.log(preferenceId);
  }).catch( (error) =>{
    console.log(error);
  })

console.log(mercadopago);

//fetch('https://api.mercadopago.com').then(res=> res.json()).then(res => console.log(res))
