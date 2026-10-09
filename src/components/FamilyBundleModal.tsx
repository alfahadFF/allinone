import React from 'react';
import { X, Sparkles, Check, ShoppingBag } from 'lucide-react';
import { FamilyBundle, CartItem } from '../types';
import { stores } from '../data';

interface FamilyBundleModalProps {
  bundle: FamilyBundle | null;
  onClose: () => void;
  onAddBundleToCart: (items: CartItem[]) => void;
}

export const FamilyBundleModal: React.FC<FamilyBundleModalProps> = ({
  bundle,
  onClose,
  onAddBundleToCart,
}) => {
  if (!bundle) return null;

  const handleAddAll = () => {
    // Add representative items from supermarket store
    const store = stores.find((s) => s.type === 'groceries') || stores[3];
    const generatedItems: CartItem[] = store.products.slice(0, 3).map((p, idx) => ({
      cartItemId: `bundle-${bundle.id}-${p.id}-${Date.now()}-${idx}`,
      product: {
        ...p,
        price: idx === 0 ? bundle.discountedPrice : 0, // aggregate bundle price on first item
        name: idx === 0 ? `${bundle.title} (${p.name})` : p.name,
      },
      quantity: 1,
      itemPrice: idx === 0 ? bundle.discountedPrice : 0,
    }));

    onAddBundleToCart(generatedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Cover */}
        <div className="relative h-48 w-full shrink-0">
          <img src={bundle.image} alt={bundle.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 start-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-800 shadow-sm transition-transform active:scale-95"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-4 start-4 end-4 text-white">
            <span className="inline-flex items-center gap-1 bg-purple-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
              <Sparkles size={12} />
              باقة العائلة المعتمدة
            </span>
            <h2 className="text-xl font-black">{bundle.title}</h2>
            <p className="text-xs text-white/90">{bundle.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Price Tag & Savings */}
          <div className="flex items-center justify-between p-3.5 bg-purple-50 rounded-2xl border border-purple-100">
            <div>
              <span className="text-xs text-purple-700 font-bold block">السعر التوفيري الشامل</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-purple-900">{bundle.discountedPrice.toLocaleString()} ل.س</span>
                <span className="text-xs text-purple-400 line-through">{bundle.originalPrice.toLocaleString()} ل.س</span>
              </div>
            </div>
            <div className="bg-purple-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-xs">
              وفر {(bundle.originalPrice - bundle.discountedPrice).toLocaleString()} ل.س!
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            {bundle.description}
          </p>

          {/* Included Items */}
          <div>
            <h3 className="font-bold text-xs text-gray-800 mb-2.5">محتويات السلة ({bundle.items.length} أصناف أساسية):</h3>
            <div className="space-y-2">
              {bundle.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50/70">
                  <div className="w-11 h-11 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                    <span className="text-[11px] text-gray-500 font-medium">{item.quantity}</span>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Add */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            onClick={handleAddAll}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-between px-6 shadow-lg shadow-purple-600/25 transition-all"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag size={18} />
              <span>إضافة السلة كاملة</span>
            </span>
            <span>{bundle.discountedPrice.toLocaleString()} ل.س</span>
          </button>
        </div>
      </div>
    </div>
  );
};
