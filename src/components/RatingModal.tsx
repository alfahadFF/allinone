import React, { useState } from 'react';
import { X, Star, Heart, CheckCircle2, MessageSquare, Bike, Store as StoreIcon } from 'lucide-react';
import { Order, OrderReview } from '../types';

interface RatingModalProps {
  order: Order | null;
  onClose: () => void;
  onSubmitReview: (orderId: string, review: OrderReview) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  order,
  onClose,
  onSubmitReview,
}) => {
  if (!order) return null;

  const existing = order.review;
  const [storeRating, setStoreRating] = useState<number>(existing?.rating || 5);
  const [driverRating, setDriverRating] = useState<number>(existing?.deliveryRating || 5);
  const [comment, setComment] = useState<string>(existing?.comment || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(existing?.tags || ['توصيل سريع', 'الأكل ساخن']);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const availableTags = [
    'توصيل سريع',
    'الأكل ساخن ولذيذ',
    'تغليف ممتاز ومحكم',
    'مطابق للطلب 100%',
    'كابتن محترم ولطيف',
    'أسعار مناسبة',
    'كميات وفيرة',
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const review: OrderReview = {
      rating: storeRating,
      deliveryRating: driverRating,
      comment: comment.trim() || 'تجربة ممتازة وخدمة سريعة في دمشق، شكراً لكم!',
      tags: selectedTags,
      ratedAt: 'الآن',
    };

    onSubmitReview(order.id, review);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="p-4 bg-orange-500 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Star size={18} className="fill-white text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm">تقييم تجربة الطلب</h2>
              <p className="text-[11px] text-white/90">{order.store.name} • {order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-black text-lg text-gray-900">شكراً على تقييمك!</h3>
            <p className="text-xs text-gray-500 max-w-xs">
              ملاحظاتك تساعدنا في تحسين جودة المطاعم وكباتن التوصيل في دمشق وسوريا.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
            
            {/* Store Rating */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-700">
                <StoreIcon size={16} className="text-orange-500" />
                <span>كيف كانت جودة الأصناف من {order.store.name}؟</span>
              </div>

              <div className="flex justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStoreRating(star)}
                    className="p-1 hover:scale-110 active:scale-95 transition-transform"
                  >
                    <Star
                      size={28}
                      className={
                        star <= storeRating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-orange-600 block">
                {storeRating === 5
                  ? 'ممتاز جداً 🌟'
                  : storeRating === 4
                  ? 'جيد جداً 👍'
                  : storeRating === 3
                  ? 'مقبول 👌'
                  : 'يحتاج تحسين ⚠️'}
              </span>
            </div>

            {/* Delivery Driver Rating */}
            {order.driver && (
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-700">
                  <Bike size={16} className="text-orange-500" />
                  <span>تقييم أداء وسرعة {order.driver.name}</span>
                </div>

                <div className="flex justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDriverRating(star)}
                      className="p-1 hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Star
                        size={24}
                        className={
                          star <= driverRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Tags */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                ما الذي أعجبك أكثر؟ (اختر ما يناسبك)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Notes */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                <MessageSquare size={14} className="text-gray-400" />
                <span>ملاحظتك أو تعليقك (ستظهر في صفحة طلباتي)</span>
              </div>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب ملاحظة قصيرة عن تجربة الطلب، سرعة التوصيل أو نكهة الطعام..."
                className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all active:scale-98"
              >
                تأكيد وحفظ التقييم
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
