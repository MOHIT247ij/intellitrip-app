const express = require('express');
const safetyController = require('../controllers/safetyController');

const router = express.Router();
router.get('/', safetyController.getSafetyInfo);

module.exports = router;
