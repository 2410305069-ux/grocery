import express from 'express';
import { getDatabase } from '../config/db.js';

const router = express.Router();

// GET /api/coupons - List all active coupons
router.get('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const coupons = db.prepare('SELECT code, discountPercent, minCartValue, maxDiscount, description FROM coupons WHERE isActive = 1 ORDER BY discountPercent DESC').all();

    res.json({
      success: true,
      count: coupons.length,
      data: coupons
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/coupons/validate - Validate coupon code against cart amount
router.post('/validate', (req, res, next) => {
  try {
    const db = getDatabase();
    const { code = '', subtotalInr = 0, subtotalUsd = 0 } = req.body;

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required.'
      });
    }

    const coupon = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = ? AND isActive = 1').get(cleanCode);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: `Invalid promo code '${code}'. Try 'VERDANT20' or 'WELCOME10'.`
      });
    }

    const subtotal = Number(subtotalInr) || (Number(subtotalUsd) * 50);

    if (subtotal < coupon.minCartValue) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Minimum order value for ${coupon.code} is ₹${coupon.minCartValue}. Add more items to apply!`
      });
    }

    const discountAmountInr = Math.min(
      Math.round((subtotal * coupon.discountPercent) / 100),
      coupon.maxDiscount
    );
    const discountAmountUsd = Number(((Number(subtotalUsd) * coupon.discountPercent) / 100).toFixed(2));

    res.json({
      success: true,
      valid: true,
      message: `Coupon '${coupon.code}' applied successfully! ${coupon.discountPercent}% OFF`,
      data: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmountInr,
        discountAmountUsd,
        description: coupon.description
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/coupons - Create coupon (Admin)
router.post('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const {
      code,
      discountPercent,
      minCartValue = 0,
      maxDiscount = 500,
      description = ''
    } = req.body;

    if (!code || discountPercent == null) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and discount percentage are required.'
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const insert = db.prepare(`
      INSERT OR REPLACE INTO coupons (code, discountPercent, minCartValue, maxDiscount, isActive, description)
      VALUES (?, ?, ?, ?, 1, ?)
    `);

    insert.run(cleanCode, Number(discountPercent), Number(minCartValue), Number(maxDiscount), description);

    const created = db.prepare('SELECT * FROM coupons WHERE code = ?').get(cleanCode);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: created
    });
  } catch (err) {
    next(err);
  }
});

export default router;
