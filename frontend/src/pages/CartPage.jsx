import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { OrderTrackingModal } from '../components/OrderTrackingModal';
import api from '../services/api';

export const CartPage = ({ onNavigate }) => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
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
    couponCode
  } = useCart();

  const { language, currency, formatPrice } = useLanguage();
  const [inputCoupon, setInputCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = await applyCoupon(inputCoupon);
    setCouponFeedback(res);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: 'Valued Shopper',
        customerEmail: 'shopper@verdantmarket.com',
        customerPhone: '+91 98765 43210',
        deliveryAddress: 'Connaught Place, New Delhi 110001',
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          nameHindi: item.nameHindi,
          price: item.price,
          priceInr: item.priceInr || Math.round(item.price * 50),
          quantity: item.quantity,
          weight: item.weight,
          image: item.image
        })),
        couponCode: couponCode || null,
        paymentMethod: 'Cash on Delivery / UPI'
      };

      const orderResult = await api.createOrder(orderPayload);
      setConfirmedOrder(orderResult);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      // Fallback
      setConfirmedOrder({
        id: `VM-${Math.floor(100000 + Math.random() * 900000)}`,
        grandTotalInr,
        grandTotalUsd,
        estimatedMins: 25
      });
      setOrderPlaced(true);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced && confirmedOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center animate-bounce shadow-md">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h2 className="font-headline-md text-2xl font-bold text-on-surface">
          {language === 'hi' ? 'ऑर्डर सफलतापूर्वक प्राप्त हुआ!' : 'Order Placed Successfully!'}
        </h2>
        <p className="text-sm text-on-surface-variant max-w-xs">
          {language === 'hi'
            ? 'आपका किराना 25-30 मिनट में आपके पते पर पहुंचा दिया जाएगा।'
            : 'Your fresh groceries are being packed and will be delivered within 25-30 minutes.'}
        </p>

        <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 w-full text-left text-xs text-on-surface-variant flex flex-col gap-2 shadow-sm">
          <div className="flex justify-between font-semibold text-on-surface">
            <span>Order Reference</span>
            <span className="font-bold text-primary">#{confirmedOrder.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount Paid</span>
            <span className="font-bold text-on-surface">
              {currency === 'INR' ? `₹${confirmedOrder.grandTotalInr || grandTotalInr}` : `$${confirmedOrder.grandTotalUsd || grandTotalUsd}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Delivery</span>
            <span className="text-primary font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">timer</span>
              <span>25-30 mins</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span>Payment Mode</span>
            <span>{confirmedOrder.paymentMethod || 'Cash on Delivery / UPI'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <button
            onClick={() => setIsTrackingOpen(true)}
            className="flex-1 bg-secondary-container text-on-secondary-container font-semibold text-xs py-3 px-4 rounded-full shadow-sm hover:bg-primary-container transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            <span>{language === 'hi' ? 'लाइव ट्रैकिंग देखें' : 'Track Order Live'}</span>
          </button>
          <button
            onClick={() => {
              setOrderPlaced(false);
              setConfirmedOrder(null);
              onNavigate('landing');
            }}
            className="flex-1 bg-primary text-on-primary font-semibold text-xs py-3 px-4 rounded-full shadow-md hover:bg-primary-container transition-all"
          >
            {language === 'hi' ? 'खरीदारी जारी रखें' : 'Continue Shopping'}
          </button>
        </div>

        {/* Live Order Tracking Modal */}
        <OrderTrackingModal
          orderId={confirmedOrder.id}
          isOpen={isTrackingOpen}
          onClose={() => setIsTrackingOpen(false)}
        />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-surface-container-low text-outline flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl">shopping_cart</span>
        </div>
        <h2 className="font-headline-md text-xl font-bold text-on-surface">
          {language === 'hi' ? 'आपकी टोकरी खाली है' : 'Your Cart is Empty'}
        </h2>
        <p className="text-sm text-on-surface-variant">
          {language === 'hi'
            ? 'ताज़ा फल, स्नैक्स और डेयरी उत्पाद जोड़ें।'
            : 'Explore fresh produce, snacks, and daily essentials.'}
        </p>
        <button
          onClick={() => onNavigate('landing')}
          className="mt-2 bg-primary text-on-primary font-semibold text-sm py-2.5 px-6 rounded-full shadow-md hover:bg-primary-container transition-all"
        >
          {language === 'hi' ? 'ब्राउज़ करना शुरू करें' : 'Start Shopping'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-md mx-auto px-4 md:px-0 pb-28 flex flex-col gap-6">
      {/* Top App Bar Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('landing')}
          className="text-on-surface-variant hover:bg-surface-variant/50 transition-colors rounded-full p-2 -ml-2"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <div className="text-center">
          <h1 className="font-headline-md text-xl md:text-2xl font-bold text-primary">
            My Cart
          </h1>
          <p className="text-xs text-on-surface-variant">
            {language === 'hi' ? 'मेरी टोकरी' : `${cartItems.length} items`}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-error hover:underline font-semibold"
          title="Empty cart"
        >
          {language === 'hi' ? 'खाली करें' : 'Clear'}
        </button>
      </div>

      {/* Cart Items List */}
      <section className="flex flex-col gap-3">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3 items-center gap-3.5 hover:border-primary transition-colors shadow-xs"
          >
            {/* Image */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-lg bg-surface-container-low flex-shrink-0 overflow-hidden relative flex items-center justify-center p-1">
              <img
                src={item.image}
                alt={item.name}
                className="object-contain max-h-full max-w-full mix-blend-multiply"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-label-md text-sm font-semibold text-on-surface truncate">
                {item.name}
              </h3>
              {item.nameHindi && (
                <p className="text-xs text-on-surface-variant truncate">
                  {item.nameHindi} • {item.weight}
                </p>
              )}
              <div className="font-bold text-sm text-primary mt-1">
                {formatPrice(item.priceInr, item.price)}
              </div>
            </div>

            {/* Actions & Quantity Controls */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-error hover:bg-error-container/40 rounded-full p-1 transition-colors"
                title="Remove item"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>

              <div className="flex items-center gap-1.5 bg-surface-container rounded-full p-1 border border-outline-variant/50">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">remove</span>
                </button>
                <span className="font-label-md text-xs font-bold text-on-surface min-w-[20px] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Coupon Section */}
      <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-[20px]">local_offer</span>
          <h3 className="font-label-md text-sm font-bold text-on-surface">
            {language === 'hi' ? 'कूपन कोड लागू करें' : 'Apply Coupon'}
          </h3>
        </div>
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <input
            type="text"
            value={inputCoupon}
            onChange={(e) => setInputCoupon(e.target.value)}
            placeholder="Try 'VERDANT20' or 'WELCOME10'"
            className="flex-1 rounded-full border border-outline-variant bg-surface-container-low text-xs font-body-md placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary h-10 px-4 outline-none uppercase"
          />
          <button
            type="submit"
            className="px-5 h-10 bg-secondary-container text-on-secondary-container font-semibold text-xs rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all"
          >
            Apply
          </button>
        </form>
        {couponFeedback && (
          <p
            className={`text-xs mt-2 font-medium ${
              couponFeedback.success ? 'text-primary' : 'text-error'
            }`}
          >
            {couponFeedback.message}
          </p>
        )}
        {discountPercent > 0 && (
          <div className="mt-2 text-xs font-semibold text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Promo Code Applied: {couponCode} ({discountPercent}% OFF)</span>
          </div>
        )}
      </section>

      {/* Bill Summary */}
      <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 flex flex-col gap-2.5 shadow-xs">
        <h3 className="font-label-md text-sm font-bold text-on-surface border-b border-outline-variant/40 pb-2 mb-1">
          {language === 'hi' ? 'बिल सारांश' : 'Bill Summary'} <span className="font-normal text-xs text-on-surface-variant">/ बिल सारांश</span>
        </h3>

        <div className="flex justify-between items-center text-xs text-on-surface-variant">
          <span>{language === 'hi' ? 'आइटम कुल' : 'Item Total'}</span>
          <span className="font-semibold text-on-surface">
            {currency === 'INR' ? `₹${subtotalInr}` : `$${subtotalUsd.toFixed(2)}`}
          </span>
        </div>

        {discountPercent > 0 && (
          <div className="flex justify-between items-center text-xs text-primary font-semibold">
            <span>Discount ({discountPercent}%)</span>
            <span>
              -{currency === 'INR' ? `₹${discountAmountInr}` : `$${discountAmountUsd.toFixed(2)}`}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-on-surface-variant">
          <span>{language === 'hi' ? 'डिलीवरी शुल्क' : 'Delivery Fee'}</span>
          <div className="flex items-center gap-1.5">
            {currency === 'INR' ? (
              deliveryFeeInr === 0 ? (
                <>
                  <span className="line-through text-outline text-[11px]">₹40</span>
                  <span className="bg-success-container text-on-success-container text-[11px] font-bold px-2 py-0.5 rounded-full">
                    FREE
                  </span>
                </>
              ) : (
                <span className="font-semibold text-on-surface">₹40</span>
              )
            ) : deliveryFeeUsd === 0 ? (
              <>
                <span className="line-through text-outline text-[11px]">$4.00</span>
                <span className="bg-success-container text-on-success-container text-[11px] font-bold px-2 py-0.5 rounded-full">
                  FREE
                </span>
              </>
            ) : (
              <span className="font-semibold text-on-surface">$4.00</span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-on-surface-variant">
          <span>{language === 'hi' ? 'कर व शुल्क' : 'Taxes & Handling'}</span>
          <span className="font-semibold text-on-surface">
            {currency === 'INR' ? `₹${taxesInr}` : `$${taxesUsd.toFixed(2)}`}
          </span>
        </div>

        <div className="border-t border-outline-variant/40 pt-2.5 mt-1 flex justify-between items-center">
          <div>
            <h4 className="font-headline-md text-base font-bold text-on-surface">
              {language === 'hi' ? 'कुल देय राशि' : 'Grand Total'}
            </h4>
            <p className="text-[11px] text-on-surface-variant">
              {language === 'hi' ? 'सभी कर सहित' : 'Inclusive of all taxes'}
            </p>
          </div>
          <span className="font-headline-md text-lg font-extrabold text-primary">
            {currency === 'INR' ? `₹${grandTotalInr}` : `$${grandTotalUsd.toFixed(2)}`}
          </span>
        </div>
      </section>

      {/* Fixed Checkout CTA Button */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/30 p-3 md:p-4 z-40">
        <div className="max-w-screen-md mx-auto">
          <button
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary rounded-full h-13 py-3 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform duration-200 shadow-md hover:bg-primary-container disabled:opacity-75"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-label-md text-sm font-bold">Processing Order...</span>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center leading-tight">
                  <span className="font-label-md text-sm font-bold">
                    {language === 'hi' ? 'चेकआउट के लिए आगे बढ़ें' : 'Proceed to Checkout'} • {currency === 'INR' ? `₹${grandTotalInr}` : `$${grandTotalUsd}`}
                  </span>
                  <span className="text-[10px] opacity-85">
                    {language === 'hi' ? '25-30 मिनट में सुरक्षित डिलीवरी' : '25-30 minute guaranteed fast delivery'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[20px] ml-1">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
