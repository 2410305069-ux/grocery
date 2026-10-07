# Verdant Market - React Frontend Application

This folder (`frontend/`) contains the complete React conversion of the Google Stitch exported grocery application designs.

## 📁 Project Structure

```
frontend/
├── index.html                   # HTML template with Google Fonts & Material 3 Tailwind config
├── preview.html                 # Standalone zero-dependency browser preview (open anytime!)
├── package.json                 # React 18 & Vite dependency definitions
├── vite.config.js               # Vite development bundler configuration
└── src/
    ├── main.jsx                 # React root mounting point
    ├── App.jsx                  # Master controller handling page switching & search
    ├── index.css                # Material 3 tokens, font configuration & utilities
    │
    ├── context/
    │   ├── CartContext.jsx      # Global cart state (add/remove/quantities/coupons/taxes)
    │   └── LanguageContext.jsx  # Bilingual English/Hindi toggle & currency formatter
    │
    ├── data/
    │   ├── products.js          # Full catalog of grocery items with real Stitch image URLs
    │   └── categories.js        # 8 categories with image assets and routing keys
    │
    ├── components/
    │   ├── Navbar.jsx           # Top header with location bar, search, language toggle, cart badge
    │   ├── BottomNav.jsx        # Mobile bottom navigation bar
    │   ├── ProductCard.jsx      # Versatile product card (grid & compact carousel modes)
    │   ├── CategoryCard.jsx     # Circular and square category tiles
    │   ├── FilterBar.jsx        # Horizontally scrollable chip filter
    │   ├── HeroBanner.jsx       # Storefront & home hero promo banners
    │   └── Toast.jsx            # Floating action notification pill
    │
    └── pages/
        ├── HomePage.jsx         # [Page 1] Mobile-first Grocery App Home feed
        ├── LandingPage.jsx      # [Page 2] Verdant Market Storefront Hub (8-category grid)
        ├── CatalogPage.jsx      # [Page 3] Fresh Indian Groceries & Popular Essentials
        ├── IceCreamsPage.jsx    # [Page 4] Ice Creams & Desserts category view
        ├── BeveragesPage.jsx    # [Page 5] Cold Drinks & Juices category view
        ├── SnacksPage.jsx       # [Page 6] Snacks & Authentic Namkeen category view
        └── CartPage.jsx         # [Page 7] My Cart & Checkout with coupons and bill breakdown
```

## 🚀 How to Run

### Option 1: Using Node & Vite (Standard React Dev Server)
Once Node.js is installed on your computer:
```bash
cd frontend
npm install
npm run dev
```

### Option 2: Instant Browser Preview (Zero Installation)
Double-click `frontend/preview.html` or open it directly in Safari, Chrome, or Edge to preview the complete React application immediately.

## ✨ Features Converted from Google Stitch
- **Complete Visual Fidelity**: Preserved all original colors, typography (Plus Jakarta Sans, Inter), Material Symbols, and high-resolution grocery imagery.
- **Interactive Cart**: Real-time quantity adjustment, item deletion, coupon code application (`VERDANT20` or `WELCOME10`), free delivery threshold calculation, taxes, and checkout simulation.
- **Bilingual Support**: Toggle between English and Hindi (`EN | हिंदी`) from the navbar.
- **Global Search**: Type in the top search bar on desktop or mobile to find products instantly across all categories.
