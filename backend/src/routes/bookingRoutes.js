const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createBookingSchema } = require('../validators/bookingValidators');

const router = express.Router();
router.use(protect);
router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.get('/', bookingController.listBookings);
router.get('/:id', bookingController.getBooking);

module.exports = router;
