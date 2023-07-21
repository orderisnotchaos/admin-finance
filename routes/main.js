const express = require('express');

const router = express.Router();
const mainController = require('../controllers/main');
const authToken = require('../middlewares/authToken');

router.get('/',authToken,mainController.mAll)
router.get('/general-view',authToken, mainController.all);
router.post('/newUser',mainController.newUser);
router.get('/newUser',mainController.ill);
router.post('/', mainController.login);




module.exports = router;
