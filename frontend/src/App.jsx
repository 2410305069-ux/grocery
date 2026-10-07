import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { ProductCard } from './components/ProductCard';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { PRODUCTS } from './data/products';

// Converted Google Stitch Pages
import { HomePage } from './pages/HomePage';
import { LandingPage } from './pages/LandingPage';
import { CatalogPage } from './pages/CatalogPage';
import { IceCreamsPage } from './pages/IceCreamsPage';
import { BeveragesPage } from './pages/BeveragesPage';
import { SnacksPage } from './pages/SnacksPage';
import { CartPage } from './pages/CartPage';

export function App() {
  const [activePage, setActivePage] = useState('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  // Handle Search Filtering across entire product inventory
  const searchResults = searchQuery.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.nameHindi && p.nameHindi.includes(searchQuery)) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleNavigate = (page) => {
    setActivePage(page);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActivePage = () => {
    if (searchQuery.trim()) {
      return (
        <div className="max-w-screen-md mx-auto px-4 md:px-0 pb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline-md text-lg font-bold text-on-surface">
              Search Results for "{searchQuery}"
            </h2>
            <span className="text-xs text-on-surface-variant font-medium">
              {searchResults.length} products found
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
              <p className="text-sm">No products found matching your search.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-primary font-bold hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} variant="grid" />
              ))}
            </div>
          )}
        </div>
      );
    }

    switch (activePage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'catalog':
        return <CatalogPage onNavigate={handleNavigate} />;
      case 'ice-creams':
        return <IceCreamsPage onNavigate={handleNavigate} />;
      case 'beverages':
        return <BeveragesPage onNavigate={handleNavigate} />;
      case 'snacks':
        return <SnacksPage onNavigate={handleNavigate} />;
      case 'cart':
        return <CartPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={handleNavigate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenOrders={() => setIsOrdersModalOpen(true)}
      />

      {/* Main Page Body Container */}
      <main className="flex-1 pt-[115px] md:pt-[84px] pb-16">
        {renderActivePage()}
      </main>

      {/* Global Order Tracking & History Modal */}
      <OrderTrackingModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />

      {/* Floating Action / Toast Feedback */}
      <Toast />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav activePage={activePage} setActivePage={handleNavigate} />
    </div>
  );
}

export default App;
