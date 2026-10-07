import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_COUPONS,
  SEED_LOCATIONS,
  SEED_REVIEWS
} from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path (inside backend directory or project root)
const DB_PATH = process.env.DB_FILE || path.resolve(__dirname, '../../verdant.db');

// Ensure parent directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

export function getDatabase() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    // Enable WAL mode and foreign keys for high reliability and speed
    db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(database) {
  // Create tables
  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nameHindi TEXT,
      image TEXT NOT NULL,
      circleImage TEXT,
      bgColor TEXT,
      pageRoute TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nameHindi TEXT,
      category TEXT NOT NULL,
      subCategory TEXT,
      price REAL NOT NULL,
      priceInr INTEGER NOT NULL,
      weight TEXT,
      image TEXT NOT NULL,
      tag TEXT,
      tagType TEXT,
      stock INTEGER DEFAULT 50,
      rating REAL DEFAULT 4.5,
      reviewsCount INTEGER DEFAULT 0,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      discountPercent INTEGER NOT NULL,
      minCartValue INTEGER DEFAULT 0,
      maxDiscount INTEGER DEFAULT 500,
      isActive INTEGER DEFAULT 1,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customerName TEXT,
      customerEmail TEXT,
      customerPhone TEXT,
      deliveryAddress TEXT,
      itemsJson TEXT NOT NULL,
      subtotalInr INTEGER NOT NULL,
      subtotalUsd REAL NOT NULL,
      deliveryFeeInr INTEGER DEFAULT 0,
      deliveryFeeUsd REAL DEFAULT 0,
      discountInr INTEGER DEFAULT 0,
      discountUsd REAL DEFAULT 0,
      taxesInr INTEGER DEFAULT 0,
      taxesUsd REAL DEFAULT 0,
      grandTotalInr INTEGER NOT NULL,
      grandTotalUsd REAL NOT NULL,
      couponCode TEXT,
      paymentMethod TEXT DEFAULT 'Cash on Delivery',
      status TEXT DEFAULT 'placed',
      estimatedMins INTEGER DEFAULT 30,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS locations (
      pincode TEXT PRIMARY KEY,
      areaName TEXT NOT NULL,
      city TEXT NOT NULL,
      estimatedMins INTEGER DEFAULT 30,
      deliveryCharge INTEGER DEFAULT 0,
      isServiceable INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      author TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Create indexes for fast lookups
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subCategory);
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(productId);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  `);

  // Auto-seed if categories are empty
  const countCategories = database.prepare("SELECT COUNT(*) as count FROM categories").get();
  if (countCategories.count === 0) {
    console.log("🌱 Seeding Verdant Market database with initial data...");
    seedDatabase(database);
  }
}

export function seedDatabase(database = getDatabase()) {
  // 1. Seed Categories
  const insertCategory = database.prepare(`
    INSERT OR REPLACE INTO categories (id, name, nameHindi, image, circleImage, bgColor, pageRoute, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const cat of SEED_CATEGORIES) {
    insertCategory.run(
      cat.id,
      cat.name,
      cat.nameHindi || null,
      cat.image,
      cat.circleImage || null,
      cat.bgColor || null,
      cat.pageRoute || null,
      cat.description || null
    );
  }

  // 2. Seed Products
  const insertProduct = database.prepare(`
    INSERT OR REPLACE INTO products (id, name, nameHindi, category, subCategory, price, priceInr, weight, image, tag, tagType, stock, rating, reviewsCount, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const prod of SEED_PRODUCTS) {
    insertProduct.run(
      prod.id,
      prod.name,
      prod.nameHindi || null,
      prod.category,
      prod.subCategory || null,
      prod.price,
      prod.priceInr || Math.round(prod.price * 50),
      prod.weight || null,
      prod.image,
      prod.tag || null,
      prod.tagType || null,
      prod.stock ?? 50,
      prod.rating ?? 4.5,
      prod.reviewsCount ?? 0,
      prod.description || null
    );
  }

  // 3. Seed Coupons
  const insertCoupon = database.prepare(`
    INSERT OR REPLACE INTO coupons (code, discountPercent, minCartValue, maxDiscount, isActive, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const coupon of SEED_COUPONS) {
    insertCoupon.run(
      coupon.code,
      coupon.discountPercent,
      coupon.minCartValue || 0,
      coupon.maxDiscount || 500,
      coupon.isActive ?? 1,
      coupon.description || null
    );
  }

  // 4. Seed Locations
  const insertLocation = database.prepare(`
    INSERT OR REPLACE INTO locations (pincode, areaName, city, estimatedMins, deliveryCharge, isServiceable)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const loc of SEED_LOCATIONS) {
    insertLocation.run(
      loc.pincode,
      loc.areaName,
      loc.city,
      loc.estimatedMins || 25,
      loc.deliveryCharge || 0,
      loc.isServiceable ?? 1
    );
  }

  // 5. Seed Reviews
  const insertReview = database.prepare(`
    INSERT OR REPLACE INTO reviews (id, productId, author, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const rev of SEED_REVIEWS) {
    insertReview.run(
      rev.id,
      rev.productId,
      rev.author,
      rev.rating,
      rev.comment
    );
  }

  console.log(`✅ Seeded ${SEED_CATEGORIES.length} categories, ${SEED_PRODUCTS.length} products, ${SEED_COUPONS.length} coupons, ${SEED_LOCATIONS.length} delivery locations, and ${SEED_REVIEWS.length} reviews.`);
}

export default getDatabase;
