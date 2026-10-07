import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // 'en' or 'hi'
  const [currency, setCurrency] = useState('INR'); // 'INR' or 'USD'

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'INR' ? 'USD' : 'INR'));
  };

  const formatPrice = (priceInr, priceUsd) => {
    if (currency === 'INR') {
      return `₹${priceInr || Math.round(priceUsd * 50)}`;
    }
    return `$${priceUsd ? priceUsd.toFixed(2) : (priceInr / 50).toFixed(2)}`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        currency,
        setLanguage,
        setCurrency,
        toggleLanguage,
        toggleCurrency,
        formatPrice,
        isHindi: language === 'hi'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
