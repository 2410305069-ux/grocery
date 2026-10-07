import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export const OrderTrackingModal = ({ orderId, isOpen, onClose }) => {
  const { language, formatPrice } = useLanguage();
  const [order, setOrder] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(orderId ? 'current' : 'history');

  const fetchOrderDetails = async () => {
    if (!orderId) {
      fetchOrderHistory();
      return;
    }
    setLoading(true);
    try {
      const data = await api.getOrderById(orderId);
      if (data) {
        setOrder(data);
      }
    } catch (e) {
      console.error('Failed to fetch order tracking', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const orders = await api.getOrders();
      setAllOrders(orders);
    } catch (e) {
      console.error('Failed to fetch orders history', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (orderId) {
        setActiveTab('current');
        fetchOrderDetails();
      } else {
        setActiveTab('history');
        fetchOrderHistory();
      }
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
            <div>
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                {language === 'hi' ? 'ऑर्डर ट्रैकिंग व इतिहास' : 'Order Tracking & History'}
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                {language === 'hi' ? 'लाइव डिलीवरी स्थिति' : 'Real-time delivery status'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-variant/40 text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-outline-variant/30 bg-surface-container-lowest px-6 pt-2">
          {orderId && (
            <button
              onClick={() => setActiveTab('current')}
              className={`pb-2.5 px-4 font-label-md text-xs font-bold border-b-2 transition-all ${
                activeTab === 'current'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {language === 'hi' ? 'वर्तमान ऑर्डर' : 'Current Order'}
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab('history');
              fetchOrderHistory();
            }}
            className={`pb-2.5 px-4 font-label-md text-xs font-bold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {language === 'hi' ? 'सभी पिछले ऑर्डर' : 'All Orders'}
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-on-surface-variant font-medium">
                {language === 'hi' ? 'ऑर्डर विवरण लोड हो रहा है...' : 'Connecting to store dispatcher...'}
              </span>
            </div>
          ) : activeTab === 'current' && order ? (
            <div className="flex flex-col gap-6">
              {/* Order Summary Top Bar */}
              <div className="flex justify-between items-start bg-surface-container-low rounded-2xl p-4 border border-outline-variant/40">
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold tracking-wider uppercase">Order Reference</span>
                  <div className="font-headline-md text-lg font-extrabold text-primary">#{order.id}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    {order.items?.length || 0} items • {formatPrice(order.grandTotalInr, order.grandTotalUsd)}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">Estimated ETA</span>
                  <div className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container mt-1">
                    <span className="material-symbols-outlined text-[14px]">timer</span>
                    <span>25-30 mins</span>
                  </div>
                </div>
              </div>

              {/* 4-Step Visual Tracking Timeline */}
              <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">
                    {language === 'hi' ? 'डिलीवरी प्रगति' : 'Delivery Progress'}
                  </h3>
                  <button
                    onClick={fetchOrderDetails}
                    className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="flex flex-col gap-3 relative pl-6 border-l-2 border-primary/20 ml-2">
                  {order.tracking?.steps?.map((step, idx) => (
                    <div key={step.key} className="relative flex flex-col gap-0.5">
                      {/* Step Circle Indicator */}
                      <div
                        className={`absolute -left-[31px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          step.completed
                            ? 'bg-primary text-on-primary shadow-xs'
                            : step.active
                            ? 'bg-secondary text-on-secondary ring-4 ring-secondary/20 animate-pulse'
                            : 'bg-surface-container-high text-outline'
                        }`}
                      >
                        {step.completed ? '✓' : idx + 1}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${step.completed || step.active ? 'text-on-surface' : 'text-outline'}`}>
                          {language === 'hi' ? step.titleHindi : step.title}
                        </span>
                        {step.active && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container animate-pulse">
                            IN PROGRESS
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        {step.description}
                      </p>
                    </div>
                  )) || (
                    <div className="text-xs text-on-surface-variant">Live tracking active</div>
                  )}
                </div>
              </div>

              {/* Delivery Rider & Address Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-low/60 rounded-xl p-3 border border-outline-variant/30 flex flex-col gap-1">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">Delivery Partner</span>
                  <div className="font-semibold text-xs text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">electric_moped</span>
                    <span>{order.tracking?.riderName || 'Vikram Singh'}</span>
                  </div>
                  <span className="text-[11px] text-primary font-medium">{order.tracking?.riderPhone || '+91 98112 34567'}</span>
                </div>

                <div className="bg-surface-container-low/60 rounded-xl p-3 border border-outline-variant/30 flex flex-col gap-1">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">Delivery Address</span>
                  <p className="text-xs text-on-surface font-medium truncate leading-tight">
                    {order.deliveryAddress || 'Connaught Place, New Delhi 110001'}
                  </p>
                  <span className="text-[10px] text-on-surface-variant">Payment: {order.paymentMethod || 'Cash on Delivery'}</span>
                </div>
              </div>

              {/* Items List in Order */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-on-surface">Items Ordered ({order.items?.length})</span>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-surface-container-low/40 rounded-lg text-xs">
                      <div className="flex items-center gap-2">
                        <img src={item.image} alt={item.name} className="w-8 h-8 object-contain rounded bg-white p-0.5" />
                        <div>
                          <span className="font-semibold text-on-surface">{item.name}</span>
                          <span className="text-[10px] text-on-surface-variant ml-1.5">x{item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-primary">{formatPrice(item.priceInr * item.quantity, item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Orders History Tab */
            <div className="flex flex-col gap-3">
              {allOrders.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-outline">receipt_long</span>
                  <p className="text-xs">No past orders found in local database yet.</p>
                </div>
              ) : (
                allOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      setOrder(o);
                      setActiveTab('current');
                    }}
                    className="p-3.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-primary">#{o.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                          {o.liveStatus || o.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant mt-1">
                        {new Date(o.created_at || Date.now()).toLocaleDateString()} • {o.items?.length || 1} items
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xs text-on-surface">
                        {formatPrice(o.grandTotalInr, o.grandTotalUsd)}
                      </span>
                      <div className="text-[10px] text-primary hover:underline flex items-center gap-0.5 justify-end">
                        <span>Track</span>
                        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-outline-variant/30 bg-surface-container-low/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container transition-all"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
