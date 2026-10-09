import React, { useState, useEffect } from 'react';
import { 
  X, Phone, MessageSquare, Clock, MapPin, Bike, 
  Store as StoreIcon, CheckCircle2, ChevronDown, ChevronUp, Star, AlertCircle
} from 'lucide-react';
import { Order } from '../types';
import { CourierChatModal } from './CourierChatModal';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
  onOrderDelivered?: (orderId: string) => void;
  onOpenRating?: (order: Order) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  onClose,
  onOrderDelivered,
  onOpenRating,
}) => {
  if (!order) return null;

  const [showChat, setShowChat] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(order.estimatedDeliveryMinutes || 14);
  const [currentStep, setCurrentStep] = useState<number>(
    order.status === 'delivered' ? 4 : order.status === 'on_the_way' ? 3 : 2
  );

  // Simulate progress
  useEffect(() => {
    if (order.status === 'delivered') {
      setCurrentStep(4);
      setMinutesLeft(0);
      return;
    }

    const timer = setInterval(() => {
      setMinutesLeft((prev) => {
        if (prev <= 1) {
          setCurrentStep(4);
          if (onOrderDelivered) onOrderDelivered(order.id);
          clearInterval(timer);
          return 0;
        }
        if (prev <= 5 && currentStep < 3) {
          setCurrentStep(3);
        }
        return prev - 1;
      });
    }, 15000); // changes every 15s for lively simulation

    return () => clearInterval(timer);
  }, [order.id, order.status, currentStep]);

  const steps = [
    { title: 'تم استلام الطلب', subtitle: 'تم إرسال تفاصيل طلبك للمتجر' },
    { title: 'جاري التحضير', subtitle: 'المتجر يقوم بتجهيز وتغليف طلبك' },
    { title: 'المندوب في الطريق', subtitle: 'كابتن التوصيل متوجه إلى عنوانك' },
    { title: 'تم التوصيل بنجاح', subtitle: 'نتمنى لك تجربة ممتعة وهنيئة' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Top Header */}
        <div className="p-4 bg-orange-500 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {order.orderNumber}
              </span>
              <span className="text-xs text-white/90">{order.store.name}</span>
            </div>
            <h2 className="text-lg font-extrabold mt-0.5">
              {currentStep === 4 ? 'تم تسليم الطلب' : 'تتبع طلبك مباشرة'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          
          {/* Simulated Map View */}
          <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
            {/* SVG Roads & Map Canvas */}
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#f1f5f9" />
              {/* Park */}
              <rect x="20" y="20" width="85" height="50" rx="8" fill="#dcfce7" />
              <text x="25" y="48" fontSize="8.5" fill="#166534" fontWeight="bold">حديقة تشرين (دمشق)</text>
              
              {/* Roads */}
              <line x1="0" y1="90" x2="100%" y2="90" stroke="#cbd5e1" strokeWidth="16" />
              <line x1="0" y1="90" x2="100%" y2="90" stroke="#ffffff" strokeWidth="12" />
              <line x1="0" y1="90" x2="100%" y2="90" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />

              <line x1="120" y1="0" x2="120" y2="100%" stroke="#cbd5e1" strokeWidth="16" />
              <line x1="120" y1="0" x2="120" y2="100%" stroke="#ffffff" strokeWidth="12" />

              <line x1="280" y1="0" x2="280" y2="100%" stroke="#cbd5e1" strokeWidth="14" />
              <line x1="280" y1="0" x2="280" y2="100%" stroke="#ffffff" strokeWidth="10" />

              {/* Delivery Path line */}
              <path
                d="M 60 90 Q 120 90 120 40 T 280 40 L 320 90"
                fill="none"
                stroke="#ff5a00"
                strokeWidth="4"
                strokeDasharray="5 3"
                className="animate-pulse"
              />
            </svg>

            {/* Origin Pin (Store) */}
            <div className="absolute top-16 start-8 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-white shadow-md border-2 border-orange-500 flex items-center justify-center">
                <StoreIcon size={14} className="text-orange-500" />
              </div>
              <span className="text-[9px] font-bold bg-white/90 px-1 rounded shadow-xs mt-0.5 text-gray-800">
                {order.store.name}
              </span>
            </div>

            {/* Destination Pin (Home) */}
            <div className="absolute top-16 end-8 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-orange-600 shadow-md border-2 border-white flex items-center justify-center text-white">
                <MapPin size={15} />
              </div>
              <span className="text-[9px] font-bold bg-white/90 px-1 rounded shadow-xs mt-0.5 text-gray-800">
                {order.address.title}
              </span>
            </div>

            {/* Moving Courier Icon */}
            {currentStep < 4 ? (
              <div className="absolute top-[48px] start-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
                <div className="w-9 h-9 rounded-full bg-orange-500 text-white shadow-lg border-2 border-white flex items-center justify-center ring-4 ring-orange-500/20">
                  <Bike size={18} />
                </div>
                <span className="text-[9px] font-extrabold bg-gray-900 text-white px-2 py-0.5 rounded-full shadow mt-0.5">
                  المندوب
                </span>
              </div>
            ) : (
              <div className="absolute top-12 end-8 -translate-x-2 flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-2 py-1 rounded-full shadow-lg">
                <CheckCircle2 size={14} />
                <span>وصل المندوب!</span>
              </div>
            )}

            {/* Countdown Badge overlay */}
            {currentStep < 4 && (
              <div className="absolute bottom-2 start-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-sm border border-gray-100 flex items-center gap-1.5">
                <Clock size={13} className="text-orange-600 animate-spin" />
                <span className="text-[11px] font-extrabold text-gray-900">
                  الوقت التقديري: {minutesLeft} دقيقة
                </span>
              </div>
            )}
          </div>

          {/* Stepper */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <h3 className="font-bold text-xs text-gray-700 mb-3">مراحل إعداد وتوصيل الطلب</h3>
            <div className="space-y-3.5 relative">
              {/* Vertical connector line */}
              <div className="absolute top-2 bottom-2 start-3.5 w-0.5 bg-gray-200"></div>

              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isPassed = currentStep >= stepNum;
                const isCurrent = currentStep === stepNum;

                return (
                  <div key={idx} className="flex items-start gap-3 relative z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                        isPassed
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-white border-2 border-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-orange-500/20 scale-105' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 size={16} /> : stepNum}
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-orange-600'
                            : isPassed
                            ? 'text-gray-900'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{step.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Driver Card */}
          {order.driver && (
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-100 shadow-xs shrink-0">
                  <img
                    src={order.driver.avatar}
                    alt={order.driver.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-gray-900">{order.driver.name}</h4>
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1 rounded">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      {order.driver.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{order.driver.vehicle}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowChat(true)}
                  className="w-9 h-9 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 flex items-center justify-center transition-colors"
                  title="محادثة المندوب"
                >
                  <MessageSquare size={17} />
                </button>
                <a
                  href={`tel:${order.driver.phone}`}
                  className="w-9 h-9 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center transition-colors shadow-xs"
                  title="اتصال هاتفي"
                >
                  <Phone size={17} />
                </a>
              </div>
            </div>
          )}

          {/* Items Accordion */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
            <button
              onClick={() => setShowItems(!showItems)}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              <span>تفاصيل الأصناف ({order.items.reduce((s, i) => s + i.quantity, 0)})</span>
              <div className="flex items-center gap-1 text-gray-500">
                <span>{order.total.toLocaleString()} ل.س</span>
                {showItems ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {showItems && (
              <div className="p-3 pt-0 border-t border-gray-100 divide-y divide-gray-100 text-xs">
                {order.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-900">{it.product.name}</span>
                      <span className="text-gray-400 mx-1.5">× {it.quantity}</span>
                      {it.selectedOption && (
                        <p className="text-[10px] text-gray-500">{it.selectedOption.name}</p>
                      )}
                    </div>
                    <span className="font-bold text-gray-800">
                      {(it.itemPrice * it.quantity).toLocaleString()} ل.س
                    </span>
                  </div>
                ))}

                <div className="pt-2 text-[11px] text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>عنوان التوصيل:</span>
                    <span className="font-medium text-gray-800">{order.address.title} - {order.address.district}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>طريقة الدفع:</span>
                    <span className="font-medium text-gray-800">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Need help */}
          <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-orange-900">
              <AlertCircle size={16} className="text-orange-500" />
              <span>هل تواجه مشكلة في طلبك؟</span>
            </div>
            <button
              onClick={() => alert('فريق خدمة العملاء متواجد لمساعدتك 24/7 عبر المحادثة المباشرة!')}
              className="font-bold text-orange-600 hover:underline"
            >
              المساعدة
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2">
          {currentStep === 4 && onOpenRating && (
            <button
              onClick={() => {
                onClose();
                onOpenRating(order);
              }}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
            >
              <Star size={14} className="fill-white" />
              <span>تقييم تجربة الطلب ⭐</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            إغلاق المتابعة
          </button>
        </div>
      </div>

      {/* Driver Chat Modal */}
      {order.driver && (
        <CourierChatModal
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          driverName={order.driver.name}
          driverAvatar={order.driver.avatar}
        />
      )}
    </div>
  );
};
