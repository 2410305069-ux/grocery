import React from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage = ({ onNavigate }) => {
  const { language } = useLanguage();

  const featuredItems = PRODUCTS.slice(0, 6);

  return (
    <div className="flex flex-col gap-10 max-w-[1200px] mx-auto px-4 md:px-6 pb-16">
      {/* Large Storefront Hero Banner */}
      <HeroBanner variant="landing" onCtaClick={() => onNavigate('catalog')} />

      {/* Shop By Category 8-Grid */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface">
              {language === 'hi' ? 'श्रेणी के अनुसार खरीदारी करें' : 'Shop by Category'}
            </h2>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant">
              {language === 'hi' ? 'सभी श्रेणियों में ताज़ा और शुद्ध सामान' : 'Handpicked organic produce & pantry staples'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              variant="card"
              onClick={() => onNavigate(category.pageRoute)}
            />
          ))}
        </div>
      </section>

      {/* Featured Deals & Best Sellers Grid */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="inline-block px-2.5 py-0.5 bg-tertiary-fixed text-on-tertiary-container font-semibold text-[11px] rounded-full mb-1">
              {language === 'hi' ? 'विशेष ऑफर' : 'Handpicked for You'}
            </div>
            <h2 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface">
              {language === 'hi' ? 'आज के मुख्य आकर्षण' : 'Featured Essentials'}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs md:text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>{language === 'hi' ? 'पूरा कैटलॉग देखें' : 'Explore Full Catalog'}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {featuredItems.map((product) => (
            <ProductCard key={product.id} product={product} variant="grid" />
          ))}
        </div>
      </section>
    </div>
  );
};
