const Afip = require('@afipsdk/afip.js');


const afip = new Afip({CUIT: 20398050631});
afip.ElectronicBilling.getVoucherInfo(0,1,6);