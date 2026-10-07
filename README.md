# 🌿 Verdant Market - Full-Stack Grocery Web Application

Verdant Market is a modern, full-stack grocery shopping web platform inspired by the Google Stitch designs, featuring a **React (Vite) bilingual frontend** and a high-performance **Node.js & Express RESTful API backend** with **native SQLite persistent storage**.

---

## 📁 Repository Structure

```
project ai/
├── package.json               # Root workspace scripts (run both frontend + backend)
├── README.md                  # Project documentation & API reference
│
├── backend/                   # Node.js & Express.js REST API
│   ├── package.json           # Backend dependencies (express, cors, morgan, dotenv)
│   ├── .env                   # Environment variables (PORT=5000, CLIENT_URL)
│   ├── .env.example           # Example environment template
│   ├── verdant.db             # Persistent SQLite database (WAL mode)
│   └── src/
│       ├── server.js          # Express app entry & Visual API Explorer
│       ├── config/
│       │   └── db.js          # Native SQLite schema initialization & auto-seeding
│       ├── data/
│       │   └── seedData.js    # 26+ grocery items, 8 categories, coupons, locations
│       ├── routes/
│       │   ├── productRoutes.js   # Products CRUD, search, categories, reviews
│       │   ├── categoryRoutes.js  # 8 categories with product count badges
│       │   ├── orderRoutes.js     # Checkout, receipt generation & 4-step live tracking
│       │   ├── couponRoutes.js    # Promo code validation (VERDANT20, WELCOME10)
│       │   ├── locationRoutes.js  # Pincode serviceability & delivery ETA
│       │   ├── adminRoutes.js     # Business metrics, revenue, low-stock alerts
│       │   └── healthRoutes.js    # Uptime & DB connectivity check
│       ├── middleware/
│       │   └── errorHandler.js    # Centralized JSON error handling
│       └── scripts/
│           └── seed.js            # Manual database reseed runner
│
└── frontend/                  # React 18 + Vite Frontend Application
    ├── package.json           # React & Vite build configurations
    ├── vite.config.js         # Bundler config with /api proxy to port 5000
    ├── preview.html           # Zero-install standalone browser preview
    └── src/
        ├── App.jsx            # Master app controller & modal mount
        ├── context/
        │   ├── CartContext.jsx      # Global cart state & backend validation
        │   └── LanguageContext.jsx  # English / Hindi bilingual engine
        ├── services/
        │   └── api.js         # Centralized API service with offline fallback
        ├── components/
        │   ├── OrderTrackingModal.jsx # 4-step live delivery status timeline
        │   ├── Navbar.jsx             # Top bar with location, search, orders & cart
        │   ├── ProductCard.jsx        # Grid & compact product card
        │   ├── CategoryCard.jsx       # Category navigation tiles
        │   └── HeroBanner.jsx         # Promo banners
        └── pages/
            ├── LandingPage.jsx  # Storefront 8-category hub
            ├── HomePage.jsx     # Mobile grocery feed
            ├── CatalogPage.jsx  # All essentials catalog
            ├── BeveragesPage.jsx
            ├── IceCreamsPage.jsx
            ├── SnacksPage.jsx
            └── CartPage.jsx     # Cart bill breakdown & checkout integration
```

---

## 🚀 Quick Start (Running Locally)

### 1. Install Dependencies
Run the following from the project root:
```bash
npm run install:all
```
*(Or run `npm install` inside both `backend/` and `frontend/` folders)*

### 2. Start Both Backend & Frontend Concurrently
```bash
npm run dev
```
- **React Frontend**: [http://localhost:3000](http://localhost:3000)
- **Node.js REST Backend**: [http://localhost:5001](http://localhost:5001)
- **Interactive API Explorer**: [http://localhost:5001/api](http://localhost:5001/api)

---

## ⚡ Running Individual Services

- **Run Backend Only** (Port 5001 with hot-reload):
  ```bash
  npm run dev:backend
  ```
- **Run Frontend Only** (Port 3000):
  ```bash
  npm run dev:frontend
  ```
- **Reseed SQLite Database to Defaults**:
  ```bash
  npm run seed
  ```

---

## 📡 RESTful API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Get products with search, category, tag, & sort filters |
| `GET` | `/api/products/:id` | Get product details with customer reviews & related items |
| `POST` | `/api/products` | Add a new product (with stock and bilingual titles) |
| `PUT` | `/api/products/:id` | Update product details or stock |
| `DELETE` | `/api/products/:id` | Remove a product |
| `POST` | `/api/products/:id/reviews` | Add customer review & update average rating |
| `GET` | `/api/categories` | Get 8 grocery categories with live item counts |
| `GET` | `/api/categories/:id` | Get category details with filtered items |
| `POST` | `/api/orders` | Place order (recalculates totals, decrements stock, returns receipt) |
| `GET` | `/api/orders` | List order history |
| `GET` | `/api/orders/:id` | Real-time order tracking status (`placed` → `packing` → `out_for_delivery` → `delivered`) |
| `POST` | `/api/orders/:id/cancel` | Cancel an order |
| `GET` | `/api/coupons` | List active discount codes (`VERDANT20`, `WELCOME10`, etc.) |
| `POST` | `/api/coupons/validate` | Validate coupon against cart subtotal |
| `GET` | `/api/locations` | List serviceable delivery pincodes |
| `GET` | `/api/locations/check/:pincode` | Check delivery ETA for a given postal code |
| `GET` | `/api/admin/stats` | Business overview (revenue, low-stock alerts, order count) |
| `GET` | `/api/health` | Uptime and SQLite health status |
