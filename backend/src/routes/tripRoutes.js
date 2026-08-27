const express = require('express');
const tripController = require('../controllers/tripController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTripSchema, updateTripSchema } = require('../validators/tripValidators');

const router = express.Router();

router.use(protect);
router.post('/', validate(createTripSchema), tripController.createTrip);
router.get('/', tripController.listTrips);
router.get('/:id', tripController.getTrip);
router.get('/:id/export-pdf', tripController.exportTripPdf);
router.put('/:id', validate(updateTripSchema), tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

module.exports = router;
