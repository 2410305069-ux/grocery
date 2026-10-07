import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const BottomNav = ({ activePage, setActivePage }) => {
  const { totalItemsCount } = useCart();
  const { language } = useLanguage();

  const navItems = [
    {
      id: 'home',
      label: language === 'hi' ? 'होम' : 'Home',
      icon: 'home',
      activeOn: ['home', 'landing']
    },
    {
      id: 'catalog',
      label: language === 'hi' ? 'श्रेणियाँ' : 'Categories',
      icon: 'grid_view',
      activeOn: ['catalog', 'beverages', 'snacks', 'ice-creams']
    },
    {
      id: 'cart',
      label: language === 'hi' ? 'कार्ट' : 'Cart',
      icon: 'shopping_cart',
      activeOn: ['cart'],
      badge: totalItemsCount
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 shadow-[0px_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center px-4 py-2">
        {navItems.map((item) => {
          const isActive = item.activeOn.includes(activePage);
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center justify-center transition-all duration-150 relative py-1 px-3 rounded-full ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined text-[22px] mb-0.5"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-primary text-on-primary rounded-full text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
