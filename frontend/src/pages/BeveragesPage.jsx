import React, { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { FilterBar } from '../components/FilterBar';
import { PRODUCTS } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

export const BeveragesPage = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Juices', 'Tea & Coffee', 'Soft Drinks', 'Health Drinks'];

  const beverageProducts = PRODUCTS.filter((p) => p.category === 'beverages');

  const filteredProducts = beverageProducts.filter((product) => {
    if (selectedFilter === 'All') return true;
    return product.subCategory === selectedFilter;
  });

  return (
    <div className="flex flex-col gap-6 max-w-screen-md mx-auto px-4 md:px-0 pb-16">
      {/* Page Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={() => onNavigate('landing')}
            className="text-on-surface-variant hover:text-primary p-1 -ml-1 rounded-full"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <span className="text-xs font-semibold px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-container rounded-full">
            {language === 'hi' ? 'ताज़ा पेय' : 'Cold & Hot Drinks'}
          </span>
        </div>
        <h1 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface">
          Beverages <span className="font-normal text-on-surface-variant text-base">/ पेय पदार्थ</span>
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Refreshing drinks for every mood <span className="text-on-surface-variant/70">/ हर मूड के लिए ताज़ा पेय</span>
        </p>
      </div>

      {/* Filter Chips */}
      <FilterBar
        filters={filters}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} variant="grid" />
        ))}
      </div>
    </div>
  );
};
