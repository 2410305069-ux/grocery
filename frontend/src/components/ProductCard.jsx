import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const ProductCard = ({ product, variant = 'grid' }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { language, formatPrice } = useLanguage();

  const cartItem = cartItems.find((item) => item.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const getTagBadgeClass = (tagType) => {
    switch (tagType) {
      case 'tertiary':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'error':
        return 'bg-error-container text-on-error-container';
      case 'secondary':
        return 'bg-secondary-container text-on-secondary-container';
      default:
        return 'bg-primary-container text-on-primary-container';
    }
  };

  // Compact card (used in Horizontal Scroll on Home Page)
  if (variant === 'compact') {
    return (
      <div className="snap-start shrink-0 w-[145px] flex flex-col bg-surface-container-lowest border border-outline-variant/60 rounded-xl overflow-hidden hover:border-primary transition-all duration-200 group card-hover shadow-sm">
        <div className="h-[120px] bg-surface relative p-2 flex items-center justify-center overflow-hidden">
          {product.tag && (
            <div className={`absolute top-2 left-2 font-label-sm text-[10px] leading-tight px-1.5 py-0.5 rounded font-semibold z-10 ${getTagBadgeClass(product.tagType)}`}>
              {product.tag}
            </div>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200 mix-blend-multiply"
            loading="lazy"
          />
        </div>
        <div className="p-2.5 flex flex-col flex-1">
          <h4 className="font-label-sm text-xs font-semibold text-on-surface line-clamp-1">
            {language === 'hi' ? product.nameHindi || product.name : product.name}
          </h4>
          <p className="text-[11px] text-on-surface-variant mb-2">{product.weight}</p>
          <div className="mt-auto flex justify-between items-center">
            <span className="font-bold text-xs text-primary">
              {formatPrice(product.priceInr, product.price)}
            </span>
            {inCartQty === 0 ? (
              <button
                onClick={() => addToCart(product)}
                aria-label="Add to cart"
                className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-colors active:scale-90"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            ) : (
              <div className="flex items-center bg-surface-container rounded-full p-0.5 border border-outline-variant/50">
                <button
                  onClick={() => updateQuantity(product.id, -1)}
                  className="w-5 h-5 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant"
                >
                  <span className="material-symbols-outlined text-[12px]">remove</span>
                </button>
                <span className="text-[11px] font-bold px-1">{inCartQty}</span>
                <button
                  onClick={() => updateQuantity(product.id, 1)}
                  className="w-5 h-5 flex items-center justify-center rounded-full bg-secondary text-on-secondary"
                >
                  <span className="material-symbols-outlined text-[12px]">add</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid Product Card
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl overflow-hidden flex flex-col hover:border-primary transition-all duration-200 group card-hover shadow-sm">
      <div className="aspect-square bg-surface-container-low p-4 relative flex items-center justify-center overflow-hidden">
        {product.tag && (
          <span className={`absolute top-2 left-2 text-[11px] px-2 py-0.5 rounded-full font-semibold z-10 ${getTagBadgeClass(product.tagType)}`}>
            {product.tag}
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
          loading="lazy"
        />
      </div>
      <div className="p-3 md:p-4 flex flex-col flex-grow justify-between gap-1">
        <div>
          <h3 className="font-label-md text-sm font-semibold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.nameHindi && (
            <p className="text-xs text-on-surface-variant line-clamp-1">
              {product.nameHindi}
            </p>
          )}
          <p className="text-xs text-outline mt-0.5">{product.weight}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-headline-md text-base md:text-lg font-bold text-primary">
            {formatPrice(product.priceInr, product.price)}
          </span>

          {inCartQty === 0 ? (
            <button
              onClick={() => addToCart(product)}
              className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-all active:scale-90 shadow-sm"
              title="Add to Cart"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          ) : (
            <div className="flex items-center bg-surface-container rounded-full p-1 border border-outline-variant/50">
              <button
                onClick={() => updateQuantity(product.id, -1)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">remove</span>
              </button>
              <span className="text-xs font-bold px-2 min-w-[20px] text-center text-on-surface">
                {inCartQty}
              </span>
              <button
                onClick={() => updateQuantity(product.id, 1)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
