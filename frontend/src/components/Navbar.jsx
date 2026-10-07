import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = ({ activePage, setActivePage, searchQuery, setSearchQuery, onOpenOrders }) => {
  const { totalItemsCount } = useCart();
  const { language, toggleLanguage } = useLanguage();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 transition-colors duration-200">
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-6 py-2.5 flex flex-col gap-2">
        {/* Main Nav Bar */}
        <div className="flex items-center justify-between gap-4 h-12">
          {/* Logo & Location */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActivePage('landing')}
              className="text-left flex items-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary font-display font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
                V
              </div>
              <span className="font-headline-lg text-lg md:text-xl font-bold text-primary tracking-tight">
                Verdant Market
              </span>
            </button>

            {/* Location selector */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/60 hover:border-primary transition-colors cursor-pointer bg-surface-container-lowest text-on-surface text-xs">
              <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                location_on
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant font-medium leading-none">
                  {language === 'hi' ? 'डिलीवरी स्थान' : 'Deliver to'}
                </span>
                <span className="font-semibold text-on-surface leading-tight truncate max-w-[130px]">
                  New Delhi, 110001
                </span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'hi' ? 'प्रोडक्ट खोजें... (फल, स्नैक्स, दूध)' : 'Search essentials, snacks, beverages...'}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-2 pl-10 pr-4 text-sm font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/70 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons & Language Toggle */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold">
              <button
                onClick={() => setActivePage('landing')}
                className={`pb-1 border-b-2 transition-colors ${
                  activePage === 'landing' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                Storefront
              </button>
              <button
                onClick={() => setActivePage('home')}
                className={`pb-1 border-b-2 transition-colors ${
                  activePage === 'home' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                App Feed
              </button>
              <button
                onClick={() => setActivePage('catalog')}
                className={`pb-1 border-b-2 transition-colors ${
                  activePage === 'catalog' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                Catalog
              </button>
            </nav>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              title="Toggle Language"
              className="text-xs font-bold px-2.5 py-1 rounded-full border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary bg-surface-container-lowest transition-all"
            >
              {language === 'en' ? 'EN | हिंदी' : 'हिंदी | EN'}
            </button>

            {/* Order Tracking Button */}
            <button
              onClick={onOpenOrders}
              title="Track Orders & History"
              className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors flex items-center justify-center"
              aria-label="Order Tracking"
            >
              <span className="material-symbols-outlined text-[22px]">local_shipping</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setActivePage('cart')}
              className={`p-2 rounded-full relative transition-colors ${
                activePage === 'cart'
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'hover:bg-surface-container-high text-on-surface-variant'
              }`}
              aria-label="Cart"
            >
              <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-primary text-on-primary rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden w-full">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'प्रोडक्ट खोजें...' : 'Search essentials...'}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-1.5 pl-9 pr-4 text-xs font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
