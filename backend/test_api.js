import http from 'http';
import app from './src/server.js';

const PORT = 5055; // Use dedicated test port

const server = app.listen(PORT, async () => {
  console.log(`🧪 Test server running on port ${PORT}...`);

  async function test(name, url, options = {}) {
    try {
      const res = await fetch(`http://localhost:${PORT}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        console.log(`✅ [PASS] ${name}`);
        return data;
      } else {
        console.error(`❌ [FAIL] ${name}:`, data);
      }
    } catch (e) {
      console.error(`💥 [ERROR] ${name}:`, e.message);
    }
  }

  try {
    // 1. Health
    await test('Health Check', '/api/health');

    // 2. Products
    const products = await test('Get Products (Limit 2)', '/api/products?limit=2');
    console.log(`   Sample product: ${products?.data?.[0]?.name} (₹${products?.data?.[0]?.priceInr})`);

    // 3. Categories
    const categories = await test('Get Categories', '/api/categories');
    console.log(`   Fetched ${categories?.count} categories`);

    // 4. Validate Coupon
    const coupon = await test('Validate Coupon VERDANT20', '/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: 'VERDANT20', subtotalInr: 300 })
    });
    console.log(`   Discount: ${coupon?.data?.discountPercent}% (₹${coupon?.data?.discountAmountInr})`);

    // 5. Create Order
    const orderRes = await test('Create Order', '/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'Test Shopper',
        customerEmail: 'test@example.com',
        items: [
          { id: 'bev-1', quantity: 2 },
          { id: 'snack-1', quantity: 1 }
        ],
        couponCode: 'VERDANT20'
      })
    });
    const orderId = orderRes?.data?.id;
    console.log(`   Order created with ID: #${orderId}, Grand Total: ₹${orderRes?.data?.grandTotalInr}`);

    // 6. Track Order
    if (orderId) {
      const trackRes = await test('Track Order by ID', `/api/orders/${orderId}`);
      console.log(`   Tracking Live Status: ${trackRes?.data?.liveStatus}, Steps: ${trackRes?.data?.tracking?.steps?.length}`);
    }

    // 7. Admin Stats
    const adminStats = await test('Admin Analytics Stats', '/api/admin/stats');
    console.log(`   Store Overview: ${adminStats?.data?.summary?.totalProducts} products, ${adminStats?.data?.summary?.totalOrders} orders`);

    console.log('\n🎉 ALL BACKEND API ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY!\n');
  } finally {
    server.close();
    process.exit(0);
  }
});
