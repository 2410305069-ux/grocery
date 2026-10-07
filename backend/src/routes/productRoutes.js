import express from 'express';
import { getDatabase } from '../config/db.js';

const router = express.Router();

// GET /api/products - List products with rich filtering and sorting
router.get('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const {
      category,
      subCategory,
      search,
      q,
      tag,
      minPrice,
      maxPrice,
      currency = 'INR',
      sort = 'default',
      limit = 100,
      offset = 0
    } = req.query;

    const searchTerm = (search || q || '').trim();
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (subCategory) {
      query += ' AND subCategory = ?';
      params.push(subCategory);
    }

    if (tag) {
      query += ' AND tag = ?';
      params.push(tag);
    }

    if (minPrice) {
      const priceCol = currency.toUpperCase() === 'USD' ? 'price' : 'priceInr';
      query += ` AND ${priceCol} >= ?`;
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      const priceCol = currency.toUpperCase() === 'USD' ? 'price' : 'priceInr';
      query += ` AND ${priceCol} <= ?`;
      params.push(Number(maxPrice));
    }

    if (searchTerm) {
      query += ' AND (name LIKE ? OR nameHindi LIKE ? OR category LIKE ? OR subCategory LIKE ? OR description LIKE ?)';
      const likePattern = `%${searchTerm}%`;
      params.push(likePattern, likePattern, likePattern, likePattern, likePattern);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += currency.toUpperCase() === 'USD' ? ' ORDER BY price ASC' : ' ORDER BY priceInr ASC';
        break;
      case 'price_desc':
        query += currency.toUpperCase() === 'USD' ? ' ORDER BY price DESC' : ' ORDER BY priceInr DESC';
        break;
      case 'rating_desc':
        query += ' ORDER BY rating DESC, reviewsCount DESC';
        break;
      case 'name_asc':
        query += ' ORDER BY name ASC';
        break;
      case 'newest':
        query += ' ORDER BY created_at DESC';
        break;
      default:
        query += ' ORDER BY id ASC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const stmt = db.prepare(query);
    const products = stmt.all(...params);

    // Get total count for pagination metadata
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const countParams = [];
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    if (subCategory) {
      countQuery += ' AND subCategory = ?';
      countParams.push(subCategory);
    }
    if (tag) {
      countQuery += ' AND tag = ?';
      countParams.push(tag);
    }
    if (minPrice) {
      const priceCol = currency.toUpperCase() === 'USD' ? 'price' : 'priceInr';
      countQuery += ` AND ${priceCol} >= ?`;
      countParams.push(Number(minPrice));
    }
    if (maxPrice) {
      const priceCol = currency.toUpperCase() === 'USD' ? 'price' : 'priceInr';
      countQuery += ` AND ${priceCol} <= ?`;
      countParams.push(Number(maxPrice));
    }
    if (searchTerm) {
      countQuery += ' AND (name LIKE ? OR nameHindi LIKE ? OR category LIKE ? OR subCategory LIKE ? OR description LIKE ?)';
      const likePattern = `%${searchTerm}%`;
      countParams.push(likePattern, likePattern, likePattern, likePattern, likePattern);
    }

    const total = db.prepare(countQuery).get(...countParams).total;

    res.json({
      success: true,
      count: products.length,
      total,
      data: products
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', (req, res, next) => {
  try {
    const db = getDatabase();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${req.params.id}' not found`
      });
    }

    // Also fetch reviews
    const reviews = db.prepare('SELECT * FROM reviews WHERE productId = ? ORDER BY created_at DESC').all(req.params.id);

    // Fetch related products in the same category
    const related = db.prepare('SELECT * FROM products WHERE category = ? AND id != ? LIMIT 4').all(product.category, product.id);

    res.json({
      success: true,
      data: {
        ...product,
        reviews,
        related
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/products - Create a new product (Admin)
router.post('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const {
      id,
      name,
      nameHindi,
      category,
      subCategory,
      price,
      priceInr,
      weight,
      image,
      tag,
      tagType,
      stock = 50,
      description = ''
    } = req.body;

    if (!name || !category || price == null) {
      return res.status(400).json({
        success: false,
        message: 'Product name, category, and price are required.'
      });
    }

    const generatedId = id || `prod-${Date.now().toString(36)}`;
    const calcInr = priceInr || Math.round(price * 50);

    const stmt = db.prepare(`
      INSERT INTO products (id, name, nameHindi, category, subCategory, price, priceInr, weight, image, tag, tagType, stock, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      generatedId,
      name,
      nameHindi || null,
      category,
      subCategory || null,
      Number(price),
      Number(calcInr),
      weight || null,
      image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
      tag || null,
      tagType || null,
      Number(stock),
      description || null
    );

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(generatedId);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: created
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', (req, res, next) => {
  try {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${req.params.id}' not found`
      });
    }

    const {
      name = existing.name,
      nameHindi = existing.nameHindi,
      category = existing.category,
      subCategory = existing.subCategory,
      price = existing.price,
      priceInr = existing.priceInr,
      weight = existing.weight,
      image = existing.image,
      tag = existing.tag,
      tagType = existing.tagType,
      stock = existing.stock,
      description = existing.description
    } = req.body;

    const stmt = db.prepare(`
      UPDATE products
      SET name = ?, nameHindi = ?, category = ?, subCategory = ?, price = ?, priceInr = ?, weight = ?, image = ?, tag = ?, tagType = ?, stock = ?, description = ?
      WHERE id = ?
    `);

    stmt.run(
      name,
      nameHindi,
      category,
      subCategory,
      Number(price),
      Number(priceInr),
      weight,
      image,
      tag,
      tagType,
      Number(stock),
      description,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', (req, res, next) => {
  try {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${req.params.id}' not found`
      });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);

    res.json({
      success: true,
      message: `Product '${existing.name}' deleted successfully`
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/products/:id/reviews - Add customer review & update rating
router.post('/:id/reviews', (req, res, next) => {
  try {
    const db = getDatabase();
    const { author = 'Anonymous Shopper', rating = 5, comment = '' } = req.body;
    const productId = req.params.id;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${productId}' not found`
      });
    }

    const reviewId = `rev-${Date.now().toString(36)}`;
    const insertReview = db.prepare(`
      INSERT INTO reviews (id, productId, author, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertReview.run(reviewId, productId, author, Number(rating), comment);

    // Recalculate average rating
    const stats = db.prepare(`
      SELECT AVG(rating) as avgRating, COUNT(*) as count
      FROM reviews
      WHERE productId = ?
    `).get(productId);

    const newRating = Number((stats.avgRating || rating).toFixed(1));
    const newCount = stats.count;

    db.prepare('UPDATE products SET rating = ?, reviewsCount = ? WHERE id = ?').run(newRating, newCount, productId);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: {
        reviewId,
        productId,
        author,
        rating: Number(rating),
        comment,
        updatedProductRating: newRating,
        totalReviews: newCount
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
