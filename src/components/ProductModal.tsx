import React, { useState } from 'react';
import { X, Plus, Minus, Check, Flame, MessageSquare } from 'lucide-react';
import { Product, ProductOption, ProductAddon, CartItem } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<ProductOption | undefined>(
    product.options && product.options.length > 0 ? product.options[0] : undefined
  );
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [instructions, setInstructions] = useState('');

  const toggleAddon = (addon: ProductAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const optionExtra = selectedOption?.priceDelta || 0;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = product.price + optionExtra + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    const item: CartItem = {
      cartItemId: `${product.id}-${selectedOption?.id || 'base'}-${selectedAddons.map(a => a.id).sort().join('-')}-${Date.now()}`,
      product,
      quantity,
      selectedOption,
      selectedAddons,
      specialInstructions: instructions.trim() || undefined,
      itemPrice: unitPrice,
    };
    onAddToCart(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Top Image & Close Button */}
        <div className="relative h-56 w-full shrink-0 bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 start-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-gray-900 shadow-sm transition-transform active:scale-90"
          >
            <X size={20} />
          </button>
          {product.popular && (
            <span className="absolute top-4 end-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              الأكثر طلباً
            </span>
          )}
        </div>

        {/* Scrollable details */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-extrabold text-gray-900">{product.name}</h2>
              <div className="text-end shrink-0">
                <span className="text-xl font-black text-orange-600">{product.price.toLocaleString()} ل.س</span>
                {product.originalPrice && (
                  <span className="block text-xs text-gray-400 line-through">
                    {product.originalPrice.toLocaleString()} ل.س
                  </span>
                )}
              </div>
            </div>

            {product.calories && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg w-fit mt-2 font-medium">
                <Flame size={14} className="text-amber-500" />
                <span>{product.calories} سعرة حرارية</span>
              </div>
            )}

            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Options / Sizes */}
          {product.options && product.options.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <h3 className="text-sm font-bold text-gray-900 mb-2">اختر الحجم / النوع</h3>
              <div className="space-y-2">
                {product.options.map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setSelectedOption(opt)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedOption?.id === opt.id
                        ? 'border-orange-500 bg-orange-50/40 text-orange-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-sm font-medium">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedOption?.id === opt.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                      }`}>
                        {selectedOption?.id === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span>{opt.name}</span>
                    </div>
                    {opt.priceDelta > 0 && (
                      <span className="text-xs font-bold text-orange-600">+{opt.priceDelta.toLocaleString()} ل.س</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {product.addons && product.addons.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <h3 className="text-sm font-bold text-gray-900 mb-2">إضافات اختيارية</h3>
              <div className="space-y-2">
                {product.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <label
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-orange-500 bg-orange-50/40'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-sm font-medium text-gray-800">
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isChecked ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300'
                        }`}>
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span>{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-orange-600">+{addon.price.toLocaleString()} ل.س</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1.5">
              <MessageSquare size={14} className="text-gray-500" />
              <span>ملاحظات خاصة للمطعم أو المتجر (اختياري)</span>
            </div>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="مثال: بدون بصل، ثوم إضافي، محمرة خفيفة..."
              className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer with Quantity & Add Button */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-2 py-1.5 w-28 shrink-0 shadow-xs">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-1 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              <Minus size={16} />
            </button>
            <span className="font-extrabold text-sm text-gray-900">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-between shadow-lg shadow-orange-500/25 transition-all text-sm"
          >
            <span>إضافة للسلة</span>
            <span>{totalPrice.toLocaleString()} ل.س</span>
          </button>
        </div>
      </div>
    </div>
  );
};
