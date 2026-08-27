const express = require('express');
const placeController = require('../controllers/placeController');

const router = express.Router();

router.get('/', placeController.listPlaces);
router.get('/:id', placeController.getPlace);

module.exports = router;
