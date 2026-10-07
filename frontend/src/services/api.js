import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';

const API_BASE = '/api';

/**
 * Robust API helper with JSON parsing and fallback error handling
 */
async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.message || `API error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[API] Network or server warning on ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Products
  async getProducts(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await request(`/products${query ? `?${query}` : ''}`);
      return res.data;
    } catch {
      // Offline / fallback static filter
      let result = [...PRODUCTS];
      if (params.category) result = result.filter(p => p.category === params.category);
      if (params.subCategory) result = result.filter(p => p.subCategory === params.subCategory);
      if (params.search || params.q) {
        const q = (params.search || params.q).toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(q) || (p.nameHindi && p.nameHindi.includes(q)));
      }
      return result;
    }
  },

  async getProductById(id) {
    try {
      const res = await request(`/products/${id}`);
      return res.data;
    } catch {
      return PRODUCTS.find(p => p.id === id) || null;
    }
  },

  // Categories
  async getCategories() {
    try {
      const res = await request('/categories');
      return res.data;
    } catch {
      return CATEGORIES;
    }
  },

  // Coupons
  async validateCoupon(code, subtotalInr, subtotalUsd) {
    try {
      const res = await request('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotalInr, subtotalUsd })
      });
      return res;
    } catch (err) {
      // Local fallback validation
      const clean = code.trim().toUpperCase();
      if (clean === 'VERDANT20' || clean === 'PURE20' || clean === 'TAAZA20') {
        const discInr = Math.round((subtotalInr * 20) / 100);
        const discUsd = Number(((subtotalUsd * 20) / 100).toFixed(2));
        return {
          success: true,
          valid: true,
          message: 'Coupon applied! 20% OFF',
          data: { code: clean, discountPercent: 20, discountAmountInr: discInr, discountAmountUsd: discUsd }
        };
      } else if (clean === 'WELCOME10') {
        const discInr = Math.round((subtotalInr * 10) / 100);
        const discUsd = Number(((subtotalUsd * 10) / 100).toFixed(2));
        return {
          success: true,
          valid: true,
          message: 'Coupon applied! 10% OFF',
          data: { code: clean, discountPercent: 10, discountAmountInr: discInr, discountAmountUsd: discUsd }
        };
      }
      return {
        success: false,
        valid: false,
        message: err.message || 'Invalid coupon code. Try VERDANT20'
      };
    }
  },

  // Orders
  async createOrder(orderPayload) {
    try {
      const res = await request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });
      return res.data;
    } catch (err) {
      console.warn("Using local order fallback:", err);
      // Client-side fallback order creation
      const fallbackId = `VM-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        id: fallbackId,
        ...orderPayload,
        status: 'placed',
        liveStatus: 'placed',
        created_at: new Date().toISOString()
      };
    }
  },

  async getOrders() {
    try {
      const res = await request('/orders');
      return res.data;
    } catch {
      return [];
    }
  },

  async getOrderById(id) {
    try {
      const res = await request(`/orders/${id}`);
      return res.data;
    } catch (err) {
      return null;
    }
  },

  // Pincode / Locations
  async checkLocation(pincode) {
    try {
      const res = await request(`/locations/check/${pincode}`);
      return res.data;
    } catch {
      return {
        pincode,
        areaName: 'Local Zone',
        city: 'New Delhi',
        estimatedMins: 30,
        isServiceable: 1
      };
    }
  },

  // Health
  async checkHealth() {
    try {
      return await request('/health');
    } catch {
      return { status: 'offline' };
    }
  }
};

export default api;
