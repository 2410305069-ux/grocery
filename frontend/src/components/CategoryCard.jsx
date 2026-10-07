import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const CategoryCard = ({ category, onClick, variant = 'circle' }) => {
  const { language } = useLanguage();

  if (variant === 'circle') {
    return (
      <div
        onClick={onClick}
        className="flex flex-col items-center gap-1.5 snap-start shrink-0 cursor-pointer group w-[76px]"
      >
        <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-outline-variant/60 flex items-center justify-center group-hover:border-primary group-hover:scale-105 transition-all duration-200 overflow-hidden shadow-xs">
          <img
            src={category.circleImage || category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <span className="font-label-sm text-[11px] text-on-surface text-center leading-tight font-medium group-hover:text-primary transition-colors line-clamp-2">
          {language === 'hi' ? category.nameHindi : category.name}
        </span>
      </div>
    );
  }

  // Large square card (Page 2)
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-2 group cursor-pointer"
    >
      <div className={`w-full aspect-square rounded-2xl ${category.bgColor || 'bg-surface-container-low'} flex items-center justify-center border border-outline-variant/20 group-hover:border-primary group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-200 overflow-hidden relative p-3`}>
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="text-center">
        <span className="font-label-md text-xs md:text-sm font-semibold text-on-surface block group-hover:text-primary transition-colors">
          {category.name}
        </span>
        <span className="font-label-sm text-[10px] md:text-xs text-on-surface-variant">
          {category.nameHindi}
        </span>
      </div>
    </div>
  );
};
