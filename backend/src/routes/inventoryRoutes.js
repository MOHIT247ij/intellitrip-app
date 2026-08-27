/**
 * inventoryRoutes.js — mounted four times in app.js at
 * /api/hotels, /api/flights, /api/cabs, /api/experiences
 * so each stays a clean top-level REST resource per the spec,
 * while sharing one small controller module.
 */
const express = require('express');
const inventoryController = require('../controllers/inventoryController');

function makeRouter(handler) {
  const router = express.Router();
  router.get('/', handler);
  return router;
}

module.exports = {
  hotels: makeRouter(inventoryController.getHotels),
  flights: makeRouter(inventoryController.getFlights),
  cabs: makeRouter(inventoryController.getCabs),
  experiences: makeRouter(inventoryController.getExperiences),
  restaurants: makeRouter(inventoryController.getRestaurants),
};
