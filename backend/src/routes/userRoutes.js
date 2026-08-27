/**
 * userRoutes.js
 *   GET /api/users/me
 *   PUT /api/users/profile
 */
const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/userValidators');

const router = express.Router();

router.get('/me', protect, userController.getMe);
router.put('/profile', protect, validate(updateProfileSchema), userController.updateProfile);

module.exports = router;
