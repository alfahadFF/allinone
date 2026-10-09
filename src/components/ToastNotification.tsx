import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, X, ShoppingBag, Sparkles, Flame, 
  ArrowLeft, Plus, Tag, ChevronLeft 
} from 'lucide-react';
import { Product, Store } from '../types';

export interface ToastData {
  id: string;
  product: Product;
  quantity: number;
  store: Store;
  promoOffer?: {
    product?: Product;
    discountPercent?: number;
    savingsAmount?: number;
    title: string;
    message: string;
  } | null;
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
  onViewCart: () => void;
  onAddPromoProduct?: (product: Product, store: Store) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onClose,
  onViewCart,
  onAddPromoProduct,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const duration = 5000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return Math.max(0, prev - step);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast]);

  if (!toast) return null;

  const { product, quantity, store, promoOffer } = toast;

  return (
    <div className="fixed top-4 start-4 end-4 sm:start-auto sm:end-4 z-50 sm:max-w-md w-auto animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-orange-200/90 overflow-hidden ring-1 ring-black/5 backdrop-blur-md">
        
        {/* Countdown Progress Bar */}
        <div className="h-1 bg-gray-100 w-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-orange-500 via-amber-500 to-emerald-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-3.5 space-y-3">
          {/* Main Added Item Header */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 end-0 bg-emerald-500 text-white rounded-tl-md p-0.5">
                  <CheckCircle2 size={11} strokeWidth={3} />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>تمت الإضافة للسلة</span>
                    <span>✓</span>
                  </span>
                  <span className="text-[10px] text-gray-400 truncate">
                    {store.name}
                  </span>
                </div>

                <h4 className="text-xs font-black text-gray-900 truncate">
                  {quantity > 1 ? `${quantity} × ` : ''}{product.name}
                </h4>

                <span className="text-xs font-extrabold text-orange-600 block mt-0.5">
                  {(product.price * quantity).toLocaleString()} ل.س
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              title="إغلاق الإشعار"
            >
              <X size={16} />
            </button>
          </div>

          {/* Promotional Special Offer Box (عرض خاص على أصناف أخرى في نفس المتجر) */}
          {promoOffer && (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 rounded-xl p-2.5 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-900 font-extrabold">
                  <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Flame size={12} className="fill-white" />
                  </span>
                  <span className="text-[11px]">{promoOffer.title}</span>
                </div>

                {promoOffer.discountPercent ? (
                  <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-md animate-pulse shrink-0">
                    خصم {promoOffer.discountPercent}%
                  </span>
                ) : (
                  <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-md shrink-0">
                    عرض مميز
                  </span>
                )}
              </div>

              {promoOffer.product ? (
                <div className="flex items-center justify-between gap-2 bg-white/80 p-2 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                      <img
                        src={promoOffer.product.image}
                        alt={promoOffer.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-gray-900 truncate">
                        {promoOffer.product.name}
                      </p>
                      <div className="flex items-baseline gap-1.5 text-[10px]">
                        <span className="font-black text-orange-600">
                          {promoOffer.product.price.toLocaleString()} ل.س
                        </span>
                        {promoOffer.product.originalPrice && (
                          <span className="text-gray-400 line-through">
                            {promoOffer.product.originalPrice.toLocaleString()} ل.س
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {onAddPromoProduct && (
                    <button
                      type="button"
                      onClick={() => onAddPromoProduct(promoOffer.product!, store)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0 shadow-2xs active:scale-95 transition-all"
                    >
                      <Plus size={12} strokeWidth={3} />
                      <span>أضف العرض</span>
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-amber-950 font-medium">
                  {promoOffer.message}
                </p>
              )}
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={() => {
                onClose();
                onViewCart();
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <ShoppingBag size={14} />
              <span>عرض السلة وإتمام الطلب</span>
              <ChevronLeft size={14} />
            </button>

            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2 px-3 rounded-xl transition-colors shrink-0"
            >
              متابعة التسوق
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
