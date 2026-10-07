import express from 'express';
import { getDatabase, seedDatabase } from '../config/db.js';

const router = express.Router();

// GET /api/admin/stats - Overview analytics for the store
router.get('/stats', (req, res, next) => {
  try {
    const db = getDatabase();

    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
    const orderStats = db.prepare(`
      SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(grandTotalInr), 0) as totalRevenueInr,
        COALESCE(SUM(grandTotalUsd), 0) as totalRevenueUsd,
        COALESCE(AVG(grandTotalInr), 0) as avgOrderValueInr
      FROM orders
    `).get();

    const lowStockProducts = db.prepare(`
      SELECT id, name, category, stock, priceInr
      FROM products
      WHERE stock <= 30
      ORDER BY stock ASC
      LIMIT 5
    `).all();

    const recentOrders = db.prepare(`
      SELECT id, customerName, grandTotalInr, grandTotalUsd, status, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    const categoryDistribution = db.prepare(`
      SELECT c.name, COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON p.category = c.id
      GROUP BY c.id
    `).all();

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts: productCount,
          totalCategories: categoryCount,
          totalOrders: orderStats.totalOrders,
          totalRevenueInr: Math.round(orderStats.totalRevenueInr),
          totalRevenueUsd: Number(orderStats.totalRevenueUsd.toFixed(2)),
          avgOrderValueInr: Math.round(orderStats.avgOrderValueInr)
        },
        lowStockAlerts: lowStockProducts,
        recentOrders,
        categoryDistribution
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/reseed - Reseed database to default catalog
router.post('/reseed', (req, res, next) => {
  try {
    const db = getDatabase();
    seedDatabase(db);
    res.json({
      success: true,
      message: 'Database reseeded successfully with default grocery catalog!'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
