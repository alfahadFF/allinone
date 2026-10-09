import React, { useState } from 'react';
import { 
  Clock, CheckCircle2, RotateCcw, ChevronLeft, MapPin, Bike, 
  ReceiptText, Star, MessageSquare, Edit3, Utensils, 
  ChevronDown, ChevronUp, Sparkles, AlertCircle
} from 'lucide-react';
import { Order, CartItem } from '../types';

interface OrdersViewProps {
  orders: Order[];
  onTrackOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
  onBrowseStores: () => void;
  onRateOrder: (order: Order) => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: Order['status']) => void;
}

const statusSteps = [
  { id: 1, key: 'received', title: 'تم الاستلام', desc: 'تم تأكيد طلبك وإرساله للمتجر', icon: ReceiptText },
  { id: 2, key: 'preparing', title: 'قيد التحضير', desc: 'المتجر يقوم بطهي وتجهيز الأصناف', icon: Utensils },
  { id: 3, key: 'on_the_way', title: 'مع الكابتن', desc: 'المندوب استلم الطلب وهو في الطريق', icon: Bike },
  { id: 4, key: 'delivered', title: 'تم التوصيل', desc: 'تم تسليم الطلب بالسلامة لباب بيتك', icon: CheckCircle2 },
] as const;

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onTrackOrder,
  onReorder,
  onBrowseStores,
  onRateOrder,
  onUpdateOrderStatus,
}) => {
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [expandedInfoOrder, setExpandedInfoOrder] = useState<string | null>(null);

  const activeOrders = orders.filter((o) => o.status !== 'delivered');
  const pastOrders = orders.filter((o) => o.status === 'delivered');

  const currentList = tab === 'active' ? activeOrders : pastOrders;

  const getStepIndex = (status: Order['status']): number => {
    switch (status) {
      case 'received': return 1;
      case 'preparing': return 2;
      case 'on_the_way': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const getProgressPercentage = (status: Order['status']): number => {
    switch (status) {
      case 'received': return 15;
      case 'preparing': return 48;
      case 'on_the_way': return 78;
      case 'delivered': return 100;
      default: return 15;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-3 border-b border-gray-100 shrink-0">
        <h1 className="text-xl font-black text-gray-900 mb-3">طلباتي</h1>
        
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setTab('active')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'active'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>الطلبات النشطة</span>
            {activeOrders.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center">
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('past')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'past'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>السابقة ({pastOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 hide-scrollbar">
        {currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-400 mb-3">
              <ReceiptText size={32} />
            </div>
            <h3 className="font-bold text-gray-700 text-base mb-1">
              {tab === 'active' ? 'لا توجد طلبات جارية حالياً' : 'سجل الطلبات السابق فارغ'}
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mb-4">
              {tab === 'active' 
                ? 'ابدأ باختيار وجبتك أو مؤونة العائلة وسنكون في خدمتك بأسرع وقت في دمشق!' 
                : 'طلباتك المكتملة ستظهر هنا لتسهيل تقييمها وإعادة طلبها في أي وقت.'}
            </p>
            <button
              onClick={onBrowseStores}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition-all"
            >
              استكشف المتاجر والمطاعم الآن
            </button>
          </div>
        ) : (
          currentList.map((order) => {
            const hasReview = Boolean(order.review);
            const currentStepIdx = getStepIndex(order.status);
            const progressPercent = getProgressPercentage(order.status);
            const isDelivered = order.status === 'delivered';
            const isExpanded = expandedInfoOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs space-y-3.5 transition-all hover:border-orange-200"
              >
                {/* Store & Header */}
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                      <img
                        src={order.store.image}
                        alt={order.store.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{order.store.name}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                        <span>{order.createdAt}</span>
                        <span>•</span>
                        <span>{order.orderNumber}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                      isDelivered
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-orange-50 text-orange-600 animate-pulse'
                    }`}
                  >
                    {isDelivered ? (
                      <>
                        <CheckCircle2 size={12} />
                        <span>تم التوصيل</span>
                      </>
                    ) : (
                      <>
                        <Bike size={12} />
                        <span>{statusSteps[currentStepIdx - 1]?.title || 'جاري التوصيل'}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* ======================================================== */}
                {/* VISUAL INTERACTIVE PROGRESS BAR (شريط التقدم التفاعلي) */}
                {/* ======================================================== */}
                <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-4 border border-gray-200/80 space-y-3.5 shadow-2xs">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-gray-800">
                      <div className="w-5 h-5 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Sparkles size={13} />
                      </div>
                      <span>شريط متابعة تقدم الطلب</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-medium">
                        انقر أي مرحلة للتحديث
                      </span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          isDelivered
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-orange-100 text-orange-700 animate-pulse'
                        }`}
                      >
                        {isDelivered
                          ? 'مكتمل 100%'
                          : `${statusSteps[currentStepIdx - 1]?.title} (${
                              currentStepIdx === 1 ? '25%' : currentStepIdx === 2 ? '50%' : '75%'
                            })`}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Visual Stepper Track & Nodes */}
                  <div className="relative pt-3 pb-2 px-3">
                    {/* Background Track Line */}
                    <div className="absolute top-7 start-7 end-7 h-2 bg-gray-200 rounded-full z-0"></div>

                    {/* Active Filled Progress Line with smooth gradient */}
                    <div
                      className="absolute top-7 start-7 h-2 bg-gradient-to-l from-orange-500 via-amber-500 to-emerald-500 rounded-full z-0 transition-all duration-700 ease-out shadow-xs"
                      style={{
                        width: `${
                          currentStepIdx === 1
                            ? '0%'
                            : currentStepIdx === 2
                            ? '33.33%'
                            : currentStepIdx === 3
                            ? '66.66%'
                            : 'calc(100% - 3.5rem)'
                        }`,
                      }}
                    ></div>

                    {/* Step Nodes */}
                    <div className="relative z-10 flex items-center justify-between">
                      {statusSteps.map((step) => {
                        const stepNum = step.id;
                        const isPassed = currentStepIdx > stepNum || isDelivered;
                        const isCurrent = currentStepIdx === stepNum && !isDelivered;
                        const StepIcon = step.icon;

                        return (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => {
                              if (onUpdateOrderStatus) {
                                onUpdateOrderStatus(order.id, step.key as Order['status']);
                              }
                            }}
                            className="flex flex-col items-center group cursor-pointer focus:outline-hidden"
                            title={`انقر للتحويل إلى: ${step.title} (${step.desc})`}
                          >
                            {/* Circle Node */}
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isPassed
                                  ? 'bg-emerald-500 text-white shadow-xs group-hover:scale-110'
                                  : isCurrent
                                  ? 'bg-orange-500 text-white shadow-lg ring-4 ring-orange-400/30 scale-115 animate-bounce'
                                  : 'bg-white border-2 border-gray-300 text-gray-400 group-hover:border-orange-400 group-hover:text-orange-500 group-hover:scale-105'
                              }`}
                            >
                              {isPassed && stepNum < 4 ? (
                                <CheckCircle2 size={18} strokeWidth={2.5} />
                              ) : (
                                <StepIcon size={17} strokeWidth={isCurrent ? 2.5 : 2} />
                              )}
                            </div>

                            {/* Label */}
                            <span
                              className={`text-[11px] mt-1.5 font-bold whitespace-nowrap transition-colors ${
                                isCurrent
                                  ? 'text-orange-600 font-black'
                                  : isPassed
                                  ? 'text-gray-900'
                                  : 'text-gray-400 group-hover:text-gray-700'
                              }`}
                            >
                              {step.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Phase Description & Interactive Action Controls */}
                  <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          isDelivered
                            ? 'bg-emerald-500'
                            : 'bg-orange-500 animate-ping'
                        }`}
                      ></div>
                      <div className="truncate">
                        <span className="font-bold text-gray-900 ml-1">
                          {statusSteps[currentStepIdx - 1]?.title}:
                        </span>
                        <span className="text-gray-500">
                          {statusSteps[currentStepIdx - 1]?.desc}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isDelivered ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onTrackOrder(order)}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                          >
                            <Bike size={14} />
                            <span>خريطة التتبع</span>
                          </button>

                          {onUpdateOrderStatus && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextStepKey =
                                  currentStepIdx === 1
                                    ? 'preparing'
                                    : currentStepIdx === 2
                                    ? 'on_the_way'
                                    : 'delivered';
                                onUpdateOrderStatus(order.id, nextStepKey);
                              }}
                              className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm transition-all"
                            >
                              <span>المرحلة التالية</span>
                              <ChevronLeft size={14} />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          {onUpdateOrderStatus && (
                            <button
                              type="button"
                              onClick={() => onUpdateOrderStatus(order.id, 'received')}
                              className="text-gray-500 hover:text-orange-600 font-bold text-[11px] underline"
                              title="إعادة تعيين لمرحلة الاستلام لتجربة التتبع مرة أخرى"
                            >
                              إعادة تجربة التتبع ↺
                            </button>
                          )}
                          <span className="text-emerald-700 bg-emerald-50 font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            <span>تم التسليم</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="text-xs text-gray-600 space-y-1">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate">
                        {item.quantity} × {item.product.name}
                      </span>
                      <span className="font-bold text-gray-800 shrink-0">
                        {(item.itemPrice * item.quantity).toLocaleString()} ل.س
                      </span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-[11px] text-gray-400">
                      + {order.items.length - 2} أصناف إضافية
                    </p>
                  )}
                </div>

                {/* User Review Display Section */}
                {isDelivered && (
                  <div className="pt-1">
                    {hasReview ? (
                      <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={13}
                                  className={
                                    s <= (order.review?.rating || 5)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-black text-amber-900">
                              {order.review?.rating}/5
                            </span>
                          </div>

                          <button
                            onClick={() => onRateOrder(order)}
                            className="flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 transition-colors"
                          >
                            <Edit3 size={12} />
                            <span>تعديل</span>
                          </button>
                        </div>

                        {order.review?.comment && (
                          <p className="text-xs text-gray-700 italic bg-white/70 p-2 rounded-lg border border-amber-100">
                            "{order.review.comment}"
                          </p>
                        )}

                        {order.review?.tags && order.review.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {order.review.tags.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-md"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => onRateOrder(order)}
                        className="w-full py-2 bg-amber-50 hover:bg-amber-100 border border-dashed border-amber-300 text-amber-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span>تقييم تجربة الطلب وكتابة ملاحظة ⭐</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Price and Actions */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 block">الإجمالي</span>
                    <span className="font-black text-sm text-gray-900">{order.total.toLocaleString()} ل.س</span>
                  </div>

                  <div className="flex gap-2">
                    {!isDelivered ? (
                      <button
                        onClick={() => onTrackOrder(order)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all active:scale-95"
                      >
                        <Bike size={14} />
                        <span>تتبع مباشر للخريطة</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onReorder(order)}
                        className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 border border-orange-200/60"
                      >
                        <RotateCcw size={13} />
                        <span>إعادة الطلب</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
