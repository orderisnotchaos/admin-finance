const express = require('express');
const router = express.Router();
const authToken = require('../middlewares/authToken');
const userController = require('../controllers/user');
const businessRouter = require('./business');

router.get('/', authToken, userController.user);
router.post('/update', authToken, userController.updateUser);
router.post('/newBusiness', authToken, userController.newBusiness);
router.get('/preferenceId',authToken, userController.preferenceId);
router.post('/processPayment',authToken, userController.processPayment);
router.post('/acceptedTerms',authToken, userController.acceptedTerms);
router.get('/pageReload',authToken, userController.pageReload);
router.use('/business',businessRouter);



module.exports = router;