import React from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

export const HomePage = ({ onNavigate }) => {
  const { language } = useLanguage();

  const popularSnacks = PRODUCTS.filter((p) => p.category === 'snacks').slice(0, 4);
  const dairyProducts = PRODUCTS.filter((p) => p.category === 'dairy');
  const kitchenEssentials = PRODUCTS.filter((p) => p.category === 'kitchen').slice(0, 4);

  return (
    <div className="flex flex-col gap-6 max-w-screen-md mx-auto px-4 md:px-0 pb-12">
      {/* Hero Banner */}
      <HeroBanner variant="home" onCtaClick={() => onNavigate('beverages')} />

      {/* Categories Horizontal Scroll */}
      <section className="py-1">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-headline-md text-base md:text-lg font-bold text-on-surface">
            {language === 'hi' ? 'श्रेणियाँ' : 'Categories'}
          </h3>
          <button
            onClick={() => onNavigate('landing')}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {language === 'hi' ? 'सभी देखें' : 'View All'}
          </button>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-4 snap-x pb-2">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              variant="circle"
              onClick={() => onNavigate(category.pageRoute)}
            />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-outline-variant/30"></div>

      {/* Popular Snacks Horizontal Scroll */}
      <section>
        <div className="flex justify-between items-end mb-3">
          <div>
            <h3 className="font-headline-md text-base md:text-lg font-bold text-on-surface">
              {language === 'hi' ? 'लोकप्रिय स्नैक्स' : 'Popular Snacks'}
            </h3>
            <p className="text-[11px] text-on-surface-variant">
              {language === 'hi' ? 'ताज़ा और क्रंची नमकीन' : 'Fresh & crunchy savory bites'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('snacks')}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {language === 'hi' ? 'सभी देखें' : 'See all'}
          </button>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 snap-x">
          {popularSnacks.map((product) => (
            <ProductCard key={product.id} product={product} variant="compact" />
          ))}
        </div>
      </section>

      {/* Fresh Dairy Horizontal Scroll */}
      <section className="bg-surface-container-low/60 -mx-4 px-4 py-4 rounded-2xl border border-outline-variant/30">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h3 className="font-headline-md text-base md:text-lg font-bold text-on-surface">
              {language === 'hi' ? 'ताज़ा डेयरी उत्पाद' : 'Fresh Dairy'}
            </h3>
            <p className="text-[11px] text-on-surface-variant">
              {language === 'hi' ? 'सीधे फार्म से शुद्ध' : 'Farm pure & nutritious'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {language === 'hi' ? 'सभी देखें' : 'See all'}
          </button>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 snap-x">
          {dairyProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="compact" />
          ))}
        </div>
      </section>

      {/* Kitchen Essentials Grid */}
      <section>
        <div className="flex justify-between items-end mb-3">
          <div>
            <h3 className="font-headline-md text-base md:text-lg font-bold text-on-surface">
              {language === 'hi' ? 'रसोई का सामान' : 'Kitchen Essentials'}
            </h3>
            <p className="text-[11px] text-on-surface-variant">
              {language === 'hi' ? 'रोज़ाना की आवश्यक वस्तुएं' : 'Daily eco-friendly cleaning & supplies'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {kitchenEssentials.map((product) => (
            <ProductCard key={product.id} product={product} variant="grid" />
          ))}
        </div>
      </section>
    </div>
  );
};
