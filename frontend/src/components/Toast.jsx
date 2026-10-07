import React from 'react';
import { useCart } from '../context/CartContext';

export const Toast = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform animate-bounce">
      <div className="bg-primary text-on-primary px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-primary-container text-sm font-medium">
        <span className="material-symbols-outlined text-[18px] text-primary-fixed">check_circle</span>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
