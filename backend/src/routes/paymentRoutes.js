const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createPaymentSchema, verifyPaymentSchema } = require('../validators/bookingValidators');

const router = express.Router();
router.use(protect);
router.post('/create', validate(createPaymentSchema), paymentController.createPayment);
router.post('/verify', validate(verifyPaymentSchema), paymentController.verifyPayment);

module.exports = router;
