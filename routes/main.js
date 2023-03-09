const express = require('express');

const router = express.Router();
const mainController = require('../controllers/main');

router.get('/', mainController.all);
router.get('/user', mainController.user);
router.post('/', mainController.login);
router.post('/newBusiness', mainController.newBusiness);
router.post('/newSale', mainController.newSale);
router.post('/newUser',mainController.newUser);

module.exports = router;
