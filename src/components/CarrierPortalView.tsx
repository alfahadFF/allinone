import React, { useState, useMemo } from 'react';
import { 
  Bike, Navigation, MapPin, DollarSign, Clock, ShieldCheck, 
  ChevronRight, Phone, CheckCircle2, AlertCircle, SlidersHorizontal, 
  ArrowUpDown, Filter, Sparkles, Check, Car, Truck, RotateCcw,
  Store as StoreIcon, User, PackageCheck, Zap, ChevronDown
} from 'lucide-react';
import { CarrierOrder, UserAccount } from '../types';
import { carrierOperatingZones, initialCarrierOrders } from '../data';

interface CarrierPortalViewProps {
  currentUser: UserAccount;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onBackToCustomerMode: () => void;
  onOpenChatWithCustomer?: (orderNumber: string, customerName: string) => void;
}

export const CarrierPortalView: React.FC<CarrierPortalViewProps> = ({
  currentUser,
  onUpdateUser,
  onBackToCustomerMode,
}) => {
  // Carrier Profile State (initialize from user or defaults)
  const carrierProfile = currentUser.carrierProfile || {
    vehicleType: 'motorcycle' as const,
    vehiclePlate: 'دمشق 99214',
    workingZones: ['دمشق - الشعلان والمركز', 'دمشق - المزة والشيخ سعد', 'دمشق - الميدان والزاهرة'],
    maxDistanceKm: 8,
    currentZone: 'دمشق - الشعلان والمركز',
    isAvailable: true,
    deliveriesCount: 6,
    rating: 4.9,
    earningsToday: 58000,
    nationalIdOrLicense: '01029384756',
  };

  // State for available and active orders
  const [carrierOrders, setCarrierOrders] = useState<CarrierOrder[]>(initialCarrierOrders);
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');
  
  // Distance and filtering state
  const [maxDistanceLimit, setMaxDistanceLimit] = useState<number>(carrierProfile.maxDistanceKm || 8);
  const [sortBy, setSortBy] = useState<'distance' | 'earnings' | 'time'>('distance');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentZone, setCurrentZone] = useState<string>(carrierProfile.currentZone || 'دمشق - الشعلان والمركز');
  const [isOnline, setIsOnline] = useState<boolean>(carrierProfile.isAvailable !== false);
  
  // Earnings & Completion state
  const [todayEarnings, setTodayEarnings] = useState<number>(carrierProfile.earningsToday || 58000);
  const [completedCount, setCompletedCount] = useState<number>(carrierProfile.deliveriesCount || 6);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<CarrierOrder | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Helper to trigger alert toast
  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  // Toggle Online/Offline
  const handleToggleOnline = () => {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    const updatedProfile = { ...carrierProfile, isAvailable: nextStatus };
    onUpdateUser({ ...currentUser, carrierProfile: updatedProfile });
    showToast(nextStatus ? 'أنت الآن متصل 🟢 وجاهز لتلقي طلبات التوصيل!' : 'تم تعيين حالتك إلى غير متصل ⚪ (استراحة)');
  };

  // Change current zone
  const handleChangeZone = (newZone: string) => {
    setCurrentZone(newZone);
    const updatedProfile = { ...carrierProfile, currentZone: newZone };
    onUpdateUser({ ...currentUser, carrierProfile: updatedProfile });
    showToast(`تم تحديث موقعك الحالي إلى: ${newZone}`);
  };

  // Filter orders according to distance and criteria
  const availableOrders = useMemo(() => {
    return carrierOrders
      .filter((o) => o.status === 'available')
      .filter((o) => o.distanceKm <= maxDistanceLimit)
      .filter((o) => (selectedCategory === 'all' ? true : o.storeCategory.includes(selectedCategory)))
      .sort((a, b) => {
        if (sortBy === 'distance') {
          return a.distanceKm - b.distanceKm; // Closest first (وفق المسافة)
        }
        if (sortBy === 'earnings') {
          return b.deliveryFeeEarnings - a.deliveryFeeEarnings; // Highest earnings
        }
        return a.estimatedDeliveryMin - b.estimatedDeliveryMin;
      });
  }, [carrierOrders, maxDistanceLimit, selectedCategory, sortBy]);

  const activeOrders = useMemo(() => {
    return carrierOrders.filter((o) => o.status === 'accepted' || o.status === 'picked_up');
  }, [carrierOrders]);

  const completedOrders = useMemo(() => {
    return carrierOrders.filter((o) => o.status === 'delivered');
  }, [carrierOrders]);

  // Accept Order
  const handleAcceptOrder = (orderId: string) => {
    if (!isOnline) {
      showToast('يرجى تفعيل حالة "متصل للعمل" أولاً لقبول الطلبات.');
      return;
    }

    setCarrierOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'accepted' as const } : o))
    );
    setActiveTab('active');
    showToast('تهانينا! تم قبول الطلب بنجاح. توجه الآن لاستلامه من المتجر 🛵');
  };

  // Update order delivery progress
  const handleProgressOrder = (orderId: string, nextStatus: 'picked_up' | 'delivered') => {
    const order = carrierOrders.find((o) => o.id === orderId);
    if (!order) return;

    if (nextStatus === 'picked_up') {
      setCarrierOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'picked_up' as const } : o))
      );
      showToast('تم تأكيد استلام الطلب من المتجر! توجه الآن إلى عنوان العميل.');
    } else if (nextStatus === 'delivered') {
      setCarrierOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'delivered' as const } : o))
      );
      const earned = order.deliveryFeeEarnings;
      setTodayEarnings((prev) => prev + earned);
      setCompletedCount((prev) => prev + 1);

      // update profile
      const updatedProfile = {
        ...carrierProfile,
        earningsToday: todayEarnings + earned,
        deliveriesCount: completedCount + 1,
      };
      onUpdateUser({ ...currentUser, carrierProfile: updatedProfile });

      showToast(`تم تسليم الطلب بنجاح! تمت إضافة أجر التوصيل (${earned.toLocaleString()} ل.س) لمحفظتك اليومية 🎉`);
    }
  };

  // Helper for vehicle label & icon
  const getVehicleDisplay = (type: string) => {
    switch (type) {
      case 'motorcycle':
        return { label: 'دراجة نارية سريعة', icon: Bike, color: 'text-orange-600' };
      case 'car':
        return { label: 'سيارة خاصة', icon: Car, color: 'text-blue-600' };
      case 'van':
        return { label: 'فان نقل وشحن', icon: Truck, color: 'text-purple-600' };
      default:
        return { label: 'دراجة هوائية', icon: Bike, color: 'text-emerald-600' };
    }
  };

  const VehicleInfo = getVehicleDisplay(carrierProfile.vehicleType || 'motorcycle');

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden text-right" dir="rtl">
      
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-4 inset-x-4 z-50 max-w-md mx-auto bg-gray-900/95 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between text-xs animate-in slide-in-from-top duration-200 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400 shrink-0" />
            <span className="font-semibold">{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-gray-400 hover:text-white ps-2 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Top Header for Freelance Courier */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shrink-0 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Bike size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-sm text-gray-900">بوابة الناقل الحر</h1>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                  كابتن مستقل
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                {currentUser.name} • {VehicleInfo.label}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Online/Offline */}
            <button
              onClick={handleToggleOnline}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                isOnline
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-500'}`} />
              <span>{isOnline ? 'متاح للعمل 🟢' : 'غير متصل ⚪'}</span>
            </button>

            {/* Back to Customer Mode */}
            <button
              onClick={onBackToCustomerMode}
              className="text-[11px] font-bold text-orange-600 hover:bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-xl transition-colors"
            >
              تطبيق الزبائن 🛒
            </button>
          </div>
        </div>

        {/* Courier Location Selector */}
        <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-gray-700">
            <MapPin size={15} className="text-orange-500 shrink-0" />
            <span className="font-bold text-[11px] text-gray-500">موقعك التقديري للبحث:</span>
          </div>
          <div className="relative">
            <select
              value={currentZone}
              onChange={(e) => handleChangeZone(e.target.value)}
              className="text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-lg py-1 px-2 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              {carrierOperatingZones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Courier Stats Strip */}
      <div className="bg-white px-4 py-2.5 border-b border-gray-100 grid grid-cols-3 gap-2 shrink-0">
        <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-2 text-center">
          <span className="text-[10px] text-amber-700 font-bold block">أرباح اليوم</span>
          <span className="text-xs font-black text-amber-900">{todayEarnings.toLocaleString()} ل.س</span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2 text-center">
          <span className="text-[10px] text-emerald-700 font-bold block">المشاوير المنجزة</span>
          <span className="text-xs font-black text-emerald-900">{completedCount} مشاوير</span>
        </div>

        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2 text-center">
          <span className="text-[10px] text-blue-700 font-bold block">تقييم الكابتن</span>
          <span className="text-xs font-black text-blue-900">⭐ {carrierProfile.rating} / 5</span>
        </div>
      </div>

      {/* Navigation Tabs (Available / Active / History) */}
      <div className="bg-white border-b border-gray-200 px-4 pt-1 flex gap-2 shrink-0">
        <button
          onClick={() => setActiveTab('available')}
          className={`py-2 px-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'available'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>الطلبات المتاحة</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'available' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {availableOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`py-2 px-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'active'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>قيد التنفيذ</span>
          {activeOrders.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'active' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {activeOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-2 px-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'completed'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>المشاوير المكتملة</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'completed' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {completedOrders.length}
          </span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 hide-scrollbar">
        
        {/* ======================================================== */}
        {/* TAB 1: AVAILABLE ORDERS (فلترة وتوزيع الطلبات وفق المسافة) */}
        {/* ======================================================== */}
        {activeTab === 'available' && (
          <>
            {/* Distance Filter Controls Banner */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <SlidersHorizontal size={15} />
                  </div>
                  <div>
                    <h3 className="font-black text-xs text-gray-900">تصفية الطلبات وفق المسافة</h3>
                    <p className="text-[10px] text-gray-400">تحديد نطاق المشوار بالكيلومتر من موقعك الحالي</p>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                    حتى {maxDistanceLimit} كم
                  </span>
                </div>
              </div>

              {/* Slider for Distance (وفق المسافة) */}
              <div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={maxDistanceLimit}
                  onChange={(e) => setMaxDistanceLimit(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 h-2 bg-gray-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold">
                  <span>1 كم (أقرب المشاوير)</span>
                  <span>5 كم</span>
                  <span>10 كم</span>
                  <span>15 كم (نطاق أوسع)</span>
                </div>
              </div>

              {/* Quick Distance Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-1">
                {[
                  { label: 'أقل من 2 كم ⚡', val: 2 },
                  { label: 'أقل من 4 كم 🛵', val: 4 },
                  { label: 'حتى 8 كم 📍', val: 8 },
                  { label: 'كافة المسافات 🌐', val: 15 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setMaxDistanceLimit(preset.val)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all whitespace-nowrap ${
                      maxDistanceLimit === preset.val
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Sort Switcher */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-gray-500">الترتيب:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSortBy('distance')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                      sortBy === 'distance'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    🎯 الأقرب مسافةً إليك
                  </button>
                  <button
                    onClick={() => setSortBy('earnings')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                      sortBy === 'earnings'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    💰 الأعلى ربحاً
                  </button>
                </div>
              </div>
            </div>

            {/* Offline Alert */}
            {!isOnline && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 text-xs">
                  <AlertCircle size={16} className="text-amber-600 shrink-0" />
                  <span>أنت في وضع عدم الاتصال. انقر على «متاح للعمل» لتتمكن من قبول الطلبات.</span>
                </div>
                <button
                  onClick={handleToggleOnline}
                  className="text-xs bg-amber-600 text-white font-black px-2.5 py-1 rounded-xl shadow-xs"
                >
                  اتصال 🟢
                </button>
              </div>
            )}

            {/* Orders Feed */}
            {availableOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3">
                  <Navigation size={28} />
                </div>
                <h4 className="font-black text-sm text-gray-800 mb-1">لا توجد طلبات ضمن مسافة {maxDistanceLimit} كم</h4>
                <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                  حاول زيادة شريط مسافة البحث أو تغيير موقعك التقديري لتغطية أحياء ومطاعم إضافية في دمشق.
                </p>
                <button
                  onClick={() => setMaxDistanceLimit(15)}
                  className="bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  توسيع نطاق المسافة إلى 15 كم
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-gray-600">
                    متاح {availableOrders.length} طلب جاهز للتوصيل
                  </span>
                  <span className="text-[10px] text-gray-400">يتم التحديث لحظياً</span>
                </div>

                {availableOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs hover:border-orange-300 transition-all space-y-3"
                  >
                    {/* Top Row: Distance & Fee */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Distance Badge with Color Coding */}
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1 ${
                            order.distanceKm <= 2
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.distanceKm <= 4
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          <Navigation size={12} />
                          <span>{order.distanceKm} كم منك</span>
                        </span>

                        <span className="text-[10px] text-gray-400">
                          منذ {order.createdAtMinutesAgo} دقيقة
                        </span>
                      </div>

                      {/* Delivery Fee Earnings */}
                      <div className="text-left">
                        <span className="text-[10px] text-gray-400 block font-medium">أجر التوصيل</span>
                        <span className="text-sm font-black text-emerald-600">
                          +{order.deliveryFeeEarnings.toLocaleString()} ل.س
                        </span>
                      </div>
                    </div>

                    {/* Route Info: Store -> Customer */}
                    <div className="bg-slate-50 p-2.5 rounded-xl space-y-2 border border-slate-100 text-xs">
                      {/* Store */}
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px]">
                          1
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-gray-900">{order.storeName}</span>
                            <span className="text-[10px] text-orange-600 font-bold">{order.storeCategory}</span>
                          </div>
                          <p className="text-[11px] text-gray-500">{order.storeArea}</p>
                        </div>
                      </div>

                      {/* Connecting Line */}
                      <div className="ms-2.5 border-s-2 border-dashed border-gray-300 h-2" />

                      {/* Customer */}
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px]">
                          2
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-gray-900">العميل: {order.customerName}</span>
                            <span className="text-[10px] text-gray-400 font-bold">~{order.estimatedDeliveryMin} دقيقة</span>
                          </div>
                          <p className="text-[11px] text-gray-600 font-medium">{order.deliveryArea}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Details & Summary */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 text-gray-500">
                      <div className="truncate max-w-[220px]">
                        <span className="font-bold text-gray-800">{order.itemCount} أصناف: </span>
                        <span>{order.itemsSummary}</span>
                      </div>
                      <span className="text-[11px] font-bold text-gray-700">
                        قيمة الطلب: {order.totalOrderValue.toLocaleString()} ل.س
                      </span>
                    </div>

                    {order.specialInstructions && (
                      <p className="text-[10px] text-amber-800 bg-amber-50/70 p-1.5 rounded-lg border border-amber-200/50">
                        📌 {order.specialInstructions}
                      </p>
                    )}

                    {/* Action Button: Accept Order */}
                    <div className="pt-1">
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Zap size={15} />
                        <span>قبول الطلب والبدء بالتوصيل ({order.deliveryFeeEarnings.toLocaleString()} ل.س)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ACTIVE ORDERS (الطلبات المقبولة وقيد التنفيذ) */}
        {/* ======================================================== */}
        {activeTab === 'active' && (
          <div className="space-y-3">
            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <PackageCheck size={28} />
                </div>
                <h4 className="font-black text-sm text-gray-800 mb-1">ليس لديك مشاوير نشطة حالياً</h4>
                <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                  تصفح قائمة «الطلبات المتاحة» واختر أقرب طلب لموقعك لبدء مشوار جديد وكسب أجر التوصيل فوراً.
                </p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  عرض الطلبات المتاحة
                </button>
              </div>
            ) : (
              activeOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border-2 border-orange-500/80 p-4 shadow-sm space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                      طلب نشط: {order.orderNumber}
                    </span>
                    <span className="text-xs font-black text-emerald-600">
                      ربحك: +{order.deliveryFeeEarnings.toLocaleString()} ل.س
                    </span>
                  </div>

                  {/* Current Active Status Indicator */}
                  <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-black text-gray-900">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                      <span>
                        {order.status === 'accepted'
                          ? 'المرحلة 1: توجه إلى المتجر لاستلام الطلب'
                          : 'المرحلة 2: في الطريق لتسليم الطلب للعميل'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {order.status === 'accepted'
                        ? `المتجر: ${order.storeName} (${order.storeArea})`
                        : `عنوان العميل: ${order.deliveryArea}`}
                    </p>
                  </div>

                  {/* Route & Contact info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-400 block font-semibold">المتجر</span>
                      <span className="font-extrabold text-gray-900 block truncate">{order.storeName}</span>
                      <span className="text-[11px] text-gray-500">{order.storeArea}</span>
                    </div>

                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-400 block font-semibold">العميل</span>
                      <span className="font-extrabold text-gray-900 block truncate">{order.customerName}</span>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Phone size={11} />
                        <span>{order.customerPhone}</span>
                      </a>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-gray-700">محتويات الطلب: </span>
                    <span className="text-gray-600">{order.itemsSummary}</span>
                  </div>

                  {/* Interactive Action Buttons */}
                  <div className="space-y-2 pt-1">
                    {order.status === 'accepted' ? (
                      <button
                        onClick={() => handleProgressOrder(order.id, 'picked_up')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <StoreIcon size={16} />
                        <span>وصلت للمتجر واستلمت الأكياس والطلب 🛍️</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleProgressOrder(order.id, 'delivered')}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={16} />
                        <span>تم تسليم الطلب للعميل واستلام الحساب كاش ✅</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: COMPLETED ORDERS HISTORY (سجل المشاوير المكتملة) */}
        {/* ======================================================== */}
        {activeTab === 'completed' && (
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-black text-xs text-emerald-900">سجل الإنجاز والعمل الحر</h4>
                <p className="text-[11px] text-emerald-700">
                  إجمالي أرباح اليوم: {todayEarnings.toLocaleString()} ل.س • {completedCount} مشاوير
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                ✓
              </div>
            </div>

            {completedOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 text-gray-400 text-xs">
                لم تكمل أي طلبات جديدة في هذه الجلسة بعد.
              </div>
            ) : (
              completedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-gray-900">{order.orderNumber}</span>
                    <span className="font-black text-emerald-600">
                      +{order.deliveryFeeEarnings.toLocaleString()} ل.س (تم الاستلام)
                    </span>
                  </div>
                  <div className="text-gray-600 flex justify-between">
                    <span>{order.storeName} ➔ {order.customerName}</span>
                    <span className="text-gray-400 font-semibold">{order.distanceKm} كم</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{order.itemsSummary}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>

    </div>
  );
};
