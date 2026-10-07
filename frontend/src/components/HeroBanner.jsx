import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const HeroBanner = ({ variant = 'home', onCtaClick }) => {
  const { language } = useLanguage();

  if (variant === 'landing') {
    return (
      <section className="relative rounded-3xl overflow-hidden min-h-[380px] md:min-h-[440px] flex items-center bg-surface-container-low border border-outline-variant/30 shadow-sm">
        <div className="absolute inset-0 w-full h-full">
          <img
            className="object-cover w-full h-full opacity-50"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz9AfnFaYR0WOkd14OuPdHV_ry6A-z8CY4D6Oaj9aLdifqRHggtyTXtAHI2hAmG1gxyaribHblHw702Szji-sZ-NCW0NJ-HxIq6RcNYn2N9wm3Cme3SZj3m_4HH20nhC-HJFxG8x61Ia9dxq2-tBIGnB5QWlZ-6VJneevi9Rg1FvJDmHeUCC0AplcDJ114JQprvqo1o_If2jajn_L1IHrgW2WL-BW97pN-_LSNYrEfxTTxEl5drhiN"
            alt="Fresh Kitchen Scene"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-bright via-surface-bright/90 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-xl p-6 md:p-12 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container font-semibold text-xs rounded-full w-fit shadow-xs">
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>30-Minute Delivery</span>
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-extrabold text-on-surface leading-tight">
            Fresh Groceries, Delivered to Your Door
            <span className="text-primary block mt-1 text-xl md:text-2xl font-bold">
              ताज़ा किराना, आपके दरवाज़े तक
            </span>
          </h1>
          <p className="font-body-md text-xs md:text-sm text-on-surface-variant max-w-md">
            Discover premium quality Indian groceries, fresh farm produce, and daily essentials delivered fast and fresh.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={onCtaClick}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md flex items-center gap-2 active:scale-95"
            >
              <span>{language === 'hi' ? 'अभी खरीदें' : 'Shop Now'}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Home / Mobile Hero Banner
  return (
    <section className="relative rounded-2xl overflow-hidden h-44 md:h-52 flex items-center bg-surface-container-low border border-outline-variant/30 shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-surface-container-highest to-transparent z-10 w-2/3 mix-blend-multiply opacity-60"></div>
      <img
        alt="Fresh Summer Drinks Banner"
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLnpgVznwtp-X86zS5q8znnahyQqtq3Mv7d-Y-L6IABd6m5nw3Dn5RyrdYe9Ja3QXyIn6GQQPad51Pyc6nKxm477rSn-VeK5bx8QNaBKdzw21HquCWVPZAS3BNnm2ZyXfpnuFPPwSzYXWxmnuMtCP4YEn3VjPW3mSdXcnY3zXU8FtwarEEMJoNLzfvSvOv0Kx0lMOgkz-WIOSZUgDwFYC_KtQ1oU5Pd5xJSQbIayZxEPu8owtiwVbC"
      />
      <div className="relative z-20 px-6 max-w-[65%]">
        <h2 className="font-headline-md text-lg md:text-2xl font-bold text-on-surface mb-1 leading-tight">
          Fresh Summer<br />Drinks
        </h2>
        <p className="text-xs text-on-surface-variant mb-3 font-medium">
          {language === 'hi' ? 'ठंडा और ताज़ा रहें।' : 'Stay cool and refreshed.'}
        </p>
        <button
          onClick={onCtaClick}
          className="bg-primary text-on-primary text-xs font-semibold py-1.5 px-4 rounded-full hover:bg-primary-container transition-all active:scale-95 shadow-sm"
        >
          {language === 'hi' ? 'देखें' : 'Shop Now'}
        </button>
      </div>
    </section>
  );
};
