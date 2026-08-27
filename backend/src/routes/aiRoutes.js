const express = require('express');
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');
const { planTripSchema, replanSchema } = require('../validators/tripValidators');
const { chatSchema } = require('../validators/aiValidators');

const router = express.Router();

router.post('/plan', protect, aiLimiter, validate(planTripSchema), aiController.plan);
router.post('/replan', protect, aiLimiter, validate(replanSchema), aiController.replan);
// Public (no `protect`) — the chat widget is available to visitors who
// aren't logged in yet, unlike the full itinerary planner.
router.post('/chat', aiLimiter, validate(chatSchema), aiController.chat);

module.exports = router;
