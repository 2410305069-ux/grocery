import express from 'express';
import { getDatabase } from '../config/db.js';

const router = express.Router();

// GET /api/categories - List all categories with real-time product count
router.get('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const categories = db.prepare(`
      SELECT 
        c.*,
        COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON p.category = c.id
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `).all();

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:id - Get category details with its products
router.get('/:id', (req, res, next) => {
  try {
    const db = getDatabase();
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with ID '${req.params.id}' not found`
      });
    }

    const products = db.prepare('SELECT * FROM products WHERE category = ?').all(category.id);

    res.json({
      success: true,
      data: {
        ...category,
        productCount: products.length,
        products
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/categories - Create category (Admin)
router.post('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const {
      id,
      name,
      nameHindi,
      image,
      circleImage,
      bgColor,
      pageRoute,
      description
    } = req.body;

    if (!name || !image) {
      return res.status(400).json({
        success: false,
        message: 'Category name and image URL are required.'
      });
    }

    const categoryId = id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const stmt = db.prepare(`
      INSERT INTO categories (id, name, nameHindi, image, circleImage, bgColor, pageRoute, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      categoryId,
      name,
      nameHindi || null,
      image,
      circleImage || image,
      bgColor || 'bg-surface-container-low',
      pageRoute || categoryId,
      description || null
    );

    const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: created
    });
  } catch (err) {
    next(err);
  }
});

export default router;
