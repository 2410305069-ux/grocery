import express from 'express';
import { getDatabase } from '../config/db.js';

const router = express.Router();

// GET /api/locations - List all serviceable delivery areas
router.get('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const locations = db.prepare('SELECT * FROM locations WHERE isServiceable = 1 ORDER BY city, areaName').all();

    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/locations/check/:pincode - Check pincode serviceability & ETA
router.get('/check/:pincode', (req, res, next) => {
  try {
    const db = getDatabase();
    const pincode = req.params.pincode.trim();
    const location = db.prepare('SELECT * FROM locations WHERE pincode = ?').get(pincode);

    if (location && location.isServiceable) {
      return res.json({
        success: true,
        serviceable: true,
        message: `Fast delivery available at ${location.areaName}, ${location.city}!`,
        data: location
      });
    }

    // If exact pincode not in preset, simulate fast delivery within Indian metro or prompt
    return res.json({
      success: true,
      serviceable: true,
      message: `Delivery available for ${pincode} within standard delivery window.`,
      data: {
        pincode,
        areaName: 'Express Local Hub',
        city: 'Delhi NCR / Metro',
        estimatedMins: 35,
        deliveryCharge: 0,
        isServiceable: 1
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
