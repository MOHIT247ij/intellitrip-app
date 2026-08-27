const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { verifySubscriptionSchema } = require('../validators/subscriptionValidators');

const router = express.Router();

// Public — the Premium pricing page shows plan details to visitors too.
router.get('/plan', subscriptionController.getPlan);

router.post('/create', protect, subscriptionController.createSubscription);
router.post('/verify', protect, validate(verifySubscriptionSchema), subscriptionController.verifySubscription);

module.exports = router;
