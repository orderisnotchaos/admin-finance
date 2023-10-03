const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");
const businessController = require("../controllers/business");

router.post('/newSale', authToken, businessController.newSale);
router.post('/newProduct',authToken,businessController.newProduct);
router.post('/salesHistory',authToken,businessController.salesHistory);
router.post('/generateTicket',authToken,businessController.generateTicket);
router.post('/editProduct',authToken,businessController.editProduct);
router.post('/deleteProduct',authToken,businessController.deleteProduct);
router.post('/deleteSale',authToken,businessController.deleteSale);
router.get('/data',authToken, businessController.data);


module.exports= router;