import React, { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { FilterBar } from '../components/FilterBar';
import { PRODUCTS } from '../data/products';
import { useLanguage } from '../context/LanguageContext';

export const CatalogPage = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Dairy', 'Produce', 'Grains', 'Spices', 'Cleaning'];

  const filteredProducts = PRODUCTS.filter((product) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Dairy') return product.category === 'dairy';
    if (selectedFilter === 'Produce') return product.category === 'fruits-veg';
    if (selectedFilter === 'Grains') return product.subCategory === 'Grains';
    if (selectedFilter === 'Spices') return product.subCategory === 'Spices';
    if (selectedFilter === 'Cleaning') return product.subCategory === 'Cleaning';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 max-w-screen-md mx-auto px-4 md:px-0 pb-16">
      {/* Header section */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={() => onNavigate('landing')}
            className="text-on-surface-variant hover:text-primary p-1 -ml-1 rounded-full"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <span className="text-xs font-semibold px-2 py-0.5 bg-primary-container text-on-primary-container rounded-full">
            {language === 'hi' ? 'ताज़ा उत्पाद' : 'Fresh & Pure'}
          </span>
        </div>
        <h1 className="font-headline-md text-xl md:text-2xl font-bold text-on-surface">
          Popular Essentials <span className="font-normal text-on-surface-variant text-base">| लोकप्रिय उत्पाद</span>
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          High-grade pantry staples, desi ghee, farm vegetables, and daily dairy.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} variant="grid" />
        ))}
      </div>
    </div>
  );
};
