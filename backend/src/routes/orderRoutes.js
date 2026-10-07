import express from 'express';
import { getDatabase } from '../config/db.js';

const router = express.Router();

// Helper to determine real-time delivery status based on time elapsed
function calculateLiveStatus(order) {
  if (order.status === 'cancelled') return 'cancelled';
  if (order.status === 'delivered') return 'delivered';

  const orderTime = new Date(order.created_at).getTime();
  const now = Date.now();
  const minutesElapsed = (now - orderTime) / (1000 * 60);

  if (minutesElapsed >= 25) {
    return 'delivered';
  } else if (minutesElapsed >= 8) {
    return 'out_for_delivery';
  } else if (minutesElapsed >= 2) {
    return 'packing';
  } else {
    return 'placed';
  }
}

// POST /api/orders - Place a new order
router.post('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const {
      customerName = 'Valued Customer',
      customerEmail = 'shopper@verdantmarket.com',
      customerPhone = '+91 9876543210',
      deliveryAddress = 'Connaught Place, New Delhi 110001',
      items = [],
      couponCode = null,
      paymentMethod = 'Cash on Delivery'
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    // 1. Calculate subtotals directly from DB products to prevent client price tampering
    let subtotalInr = 0;
    let subtotalUsd = 0;
    const verifiedItems = [];

    for (const item of items) {
      const dbProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(item.id);
      const qty = Math.max(1, Number(item.quantity) || 1);

      if (dbProduct) {
        const itemPriceUsd = dbProduct.price;
        const itemPriceInr = dbProduct.priceInr;

        subtotalUsd += itemPriceUsd * qty;
        subtotalInr += itemPriceInr * qty;

        verifiedItems.push({
          id: dbProduct.id,
          name: dbProduct.name,
          nameHindi: dbProduct.nameHindi,
          price: itemPriceUsd,
          priceInr: itemPriceInr,
          weight: dbProduct.weight,
          image: dbProduct.image,
          quantity: qty
        });

        // Decrement product stock if available
        if (dbProduct.stock > 0) {
          const newStock = Math.max(0, dbProduct.stock - qty);
          db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(newStock, dbProduct.id);
        }
      } else {
        // Fallback to client item if not found in db
        const fallbackPrice = Number(item.price) || 1.99;
        const fallbackInr = Number(item.priceInr) || Math.round(fallbackPrice * 50);
        subtotalUsd += fallbackPrice * qty;
        subtotalInr += fallbackInr * qty;
        verifiedItems.push({ ...item, quantity: qty });
      }
    }

    // 2. Validate Coupon & compute discount
    let discountPercent = 0;
    let discountInr = 0;
    let discountUsd = 0;
    let validatedCoupon = null;

    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      const dbCoupon = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = ? AND isActive = 1').get(cleanCode);

      if (dbCoupon && subtotalInr >= dbCoupon.minCartValue) {
        discountPercent = dbCoupon.discountPercent;
        discountInr = Math.min(
          Math.round((subtotalInr * discountPercent) / 100),
          dbCoupon.maxDiscount || 500
        );
        discountUsd = Number(((subtotalUsd * discountPercent) / 100).toFixed(2));
        validatedCoupon = cleanCode;
      }
    }

    // 3. Compute Delivery Fee & Taxes
    const deliveryFeeInr = subtotalInr > 200 || subtotalInr === 0 ? 0 : 40;
    const deliveryFeeUsd = subtotalUsd > 25 || subtotalUsd === 0 ? 0 : 4.0;

    const taxesInr = subtotalInr > 0 ? 15 : 0;
    const taxesUsd = subtotalUsd > 0 ? 1.5 : 0;

    const grandTotalInr = Math.max(0, subtotalInr - discountInr + deliveryFeeInr + taxesInr);
    const grandTotalUsd = Number(Math.max(0, subtotalUsd - discountUsd + deliveryFeeUsd + taxesUsd).toFixed(2));

    // 4. Generate Order Reference
    const orderId = `VM-${Math.floor(100000 + Math.random() * 900000)}`;
    const estimatedMins = 25;

    // 5. Store Order in DB
    const insertStmt = db.prepare(`
      INSERT INTO orders (
        id, customerName, customerEmail, customerPhone, deliveryAddress,
        itemsJson, subtotalInr, subtotalUsd, deliveryFeeInr, deliveryFeeUsd,
        discountInr, discountUsd, taxesInr, taxesUsd, grandTotalInr, grandTotalUsd,
        couponCode, paymentMethod, status, estimatedMins
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      JSON.stringify(verifiedItems),
      subtotalInr,
      subtotalUsd,
      deliveryFeeInr,
      deliveryFeeUsd,
      discountInr,
      discountUsd,
      taxesInr,
      taxesUsd,
      grandTotalInr,
      grandTotalUsd,
      validatedCoupon,
      paymentMethod,
      'placed',
      estimatedMins
    );

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    createdOrder.items = JSON.parse(createdOrder.itemsJson);
    createdOrder.liveStatus = 'placed';

    res.status(201).json({
      success: true,
      message: 'Order created and confirmed successfully!',
      data: createdOrder
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders - List all orders
router.get('/', (req, res, next) => {
  try {
    const db = getDatabase();
    const { email, phone, limit = 20, offset = 0 } = req.query;

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (email) {
      query += ' AND customerEmail = ?';
      params.push(email);
    }

    if (phone) {
      query += ' AND customerPhone = ?';
      params.push(phone);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const orders = db.prepare(query).all(...params).map((o) => {
      let items = [];
      try {
        items = JSON.parse(o.itemsJson);
      } catch (e) {
        items = [];
      }
      return {
        ...o,
        items,
        liveStatus: calculateLiveStatus(o)
      };
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id - Get order details and live tracking state
router.get('/:id', (req, res, next) => {
  try {
    const db = getDatabase();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${req.params.id} not found`
      });
    }

    const items = JSON.parse(order.itemsJson);
    const liveStatus = calculateLiveStatus(order);

    // Tracking pipeline steps
    const steps = [
      {
        step: 1,
        key: 'placed',
        title: 'Order Placed',
        titleHindi: 'ऑर्डर स्वीकार किया गया',
        description: 'Your order has been received by Verdant Store',
        completed: true,
        active: liveStatus === 'placed'
      },
      {
        step: 2,
        key: 'packing',
        title: 'Freshly Picked & Packed',
        titleHindi: 'ताज़ा सामान पैक हो रहा है',
        description: 'Store associate is handpicking your items',
        completed: ['packing', 'out_for_delivery', 'delivered'].includes(liveStatus),
        active: liveStatus === 'packing'
      },
      {
        step: 3,
        key: 'out_for_delivery',
        title: 'Out for Delivery',
        titleHindi: 'डिलीवरी पार्टनर रास्ते में है',
        description: 'Rider is en route to your address on an EV scooter',
        completed: ['out_for_delivery', 'delivered'].includes(liveStatus),
        active: liveStatus === 'out_for_delivery'
      },
      {
        step: 4,
        key: 'delivered',
        title: 'Delivered',
        titleHindi: 'सफलतापूर्वक पहुंचाया गया',
        description: 'Package handed over at your doorstep',
        completed: liveStatus === 'delivered',
        active: liveStatus === 'delivered'
      }
    ];

    res.json({
      success: true,
      data: {
        ...order,
        items,
        liveStatus,
        tracking: {
          currentStatus: liveStatus,
          estimatedMins: order.estimatedMins,
          riderName: 'Vikram Singh',
          riderPhone: '+91 98112 34567',
          steps
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status - Update order status (Admin / Simulation)
router.patch('/:id/status', (req, res, next) => {
  try {
    const db = getDatabase();
    const { status } = req.body;
    const allowed = ['placed', 'packing', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowed.join(', ')}`
      });
    }

    const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Order #${req.params.id} not found`
      });
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    updated.items = JSON.parse(updated.itemsJson);

    res.json({
      success: true,
      message: `Order status updated to '${status}'`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:id/cancel - Cancel order
router.post('/:id/cancel', (req, res, next) => {
  try {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Order #${req.params.id} not found`
      });
    }

    if (existing.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Delivered orders cannot be cancelled.'
      });
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('cancelled', req.params.id);

    res.json({
      success: true,
      message: `Order #${req.params.id} has been cancelled successfully.`
    });
  } catch (err) {
    next(err);
  }
});

export default router;
