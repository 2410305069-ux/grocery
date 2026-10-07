import React, { createContext, useContext, useState, useEffect } from 'react';

import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Preload initial items matching Stitch Page 7 Cart for instant rich experience
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('verdant_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
    return [
      {
        id: "bev-1",
        name: "Fresh Orange Juice",
        nameHindi: "ताज़ा संतरे का रस",
        price: 4.99,
        priceInr: 50,
        weight: "500ml",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8KrnJbYTQiqg4JjH3J6Err8lPyprFyHOrXWA6vp2eHUWWEQGgD09lLbtk76nO1abzgW4O7ViN6bLhNo2DA1mwP1FK2qo30TGXrcu1iNYWAMlfL8EjlHtgK5otGzvjB-qqNQhxo2q5j3CfgSVlIiTcriCEmYqpTG4yG3iVxrwBud-n3h4gS2KbfFN-npJnR7ZX6Fd8djxzpvIvUxPK6TRle7atMX07wIR7YwB_Nb6HbYanAXtINVn6",
        quantity: 1
      },
      {
        id: "snack-1",
        name: "Masala Chips",
        nameHindi: "मसाला चिप्स",
        price: 1.50,
        priceInr: 50,
        weight: "150g",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt3Qdidb1Dede8rvuDeo1l32SlQuA92mWIVcONJ6kPj1V_CJ9kgk4dAOq7srRcAkX45ykNIZPfdCWaEUizhbn4dKl7KbrUHID8ScbBG4MHPZJ1o2U7jELnN7VS6rt0KqcaNu7nwAuOes1Kidg_yIbmUPybL3bTTn6io4QPd0mKgYYuGne06T5QSIHo97vo5Mmv23oon-x_ajj71HWotzRDLpuKbXSsTLM3Jcoudu2zhYVn8npbyZFC",
        quantity: 2
      },
      {
        id: "ice-1",
        name: "Vanilla Bean Tub",
        nameHindi: "वैनिला बीन टब",
        price: 6.50,
        priceInr: 120,
        weight: "500ml",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2Od-ExC4mww6VD9X1L_jKmL8RMvERZPLgq_dtYAslUv8qTkiRxfTMv-DaWI3aME0gP3l5FK6R54yLSAQC7vWYoKrW8qwvrwHRDwhC2ajZVvX7G8pKaM76uyRXMsL1VDOuLucG5DKVRXvl6FKIL551F4obOy4UylLeOfPQUQo3FAQrlZAYZhvVrU9HeWUwE74gvgeqMTs8upNSfYWoV4DNjRK9WAKa32l4mFBeMl4Rvff1j5jN_NKz",
        quantity: 1
      }
    ];
  });

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('verdant_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  }, [cartItems]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        showToast(`Increased quantity of ${product.name}`);
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        showToast(`Added ${product.name} to cart`);
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    showToast("Item removed from cart");
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const applyCoupon = async (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return { success: false, message: "Please enter a coupon code" };

    try {
      const res = await api.validateCoupon(cleanCode, subtotalInr, subtotalUsd);
      if (res.success && res.data) {
        setDiscountPercent(res.data.discountPercent);
        setCouponCode(res.data.code);
        showToast(`Coupon applied! ${res.data.discountPercent}% OFF`);
        return { success: true, message: res.message || `Coupon applied! ${res.data.discountPercent}% discount.` };
      } else {
        showToast(res.message || "Invalid coupon code");
        return { success: false, message: res.message || "Invalid coupon code" };
      }
    } catch {
      if (cleanCode === 'VERDANT20' || cleanCode === 'PURE20' || cleanCode === 'TAAZA20') {
        setDiscountPercent(20);
        setCouponCode(cleanCode);
        showToast("Coupon applied! 20% OFF");
        return { success: true, message: "Coupon applied! 20% discount." };
      } else if (cleanCode === 'WELCOME10') {
        setDiscountPercent(10);
        setCouponCode(cleanCode);
        showToast("Coupon applied! 10% OFF");
        return { success: true, message: "Coupon applied! 10% discount." };
      } else {
        showToast("Invalid promo code");
        return { success: false, message: "Invalid coupon code. Try VERDANT20" };
      }
    }
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalInr = cartItems.reduce((acc, item) => acc + (item.priceInr || Math.round(item.price * 50)) * item.quantity, 0);
  const subtotalUsd = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const deliveryFeeInr = subtotalInr > 200 || subtotalInr === 0 ? 0 : 40;
  const deliveryFeeUsd = subtotalUsd > 25 || subtotalUsd === 0 ? 0 : 4.0;

  const taxesInr = subtotalInr > 0 ? 15 : 0;
  const taxesUsd = subtotalUsd > 0 ? 1.5 : 0;

  const discountAmountInr = Math.round((subtotalInr * discountPercent) / 100);
  const discountAmountUsd = Number(((subtotalUsd * discountPercent) / 100).toFixed(2));

  const grandTotalInr = subtotalInr - discountAmountInr + deliveryFeeInr + taxesInr;
  const grandTotalUsd = Number((subtotalUsd - discountAmountUsd + deliveryFeeUsd + taxesUsd).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        subtotalInr,
        subtotalUsd,
        deliveryFeeInr,
        deliveryFeeUsd,
        taxesInr,
        taxesUsd,
        discountPercent,
        discountAmountInr,
        discountAmountUsd,
        grandTotalInr,
        grandTotalUsd,
        couponCode,
        toastMessage,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
