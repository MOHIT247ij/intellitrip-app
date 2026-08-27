const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.get('/bookings', adminController.listBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);
router.get('/places', adminController.listPlaces);
router.get('/trips', adminController.listTrips);

module.exports = router;
