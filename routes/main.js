const express = require('express');

const router = express.Router();
const mainController = require('../controllers/main');

router.get('/', mainController.all);
router.post('/', mainController.login);

module.exports = router;
