const express = require('express');
const destinationController = require('../controllers/destinationController');

const router = express.Router();

router.get('/', destinationController.listDestinations);
router.get('/:id', destinationController.getDestination);

module.exports = router;
