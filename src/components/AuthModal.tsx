import React, { useState, useEffect } from 'react';
import { 
  X, User, Phone, Mail, MapPin, Store as StoreIcon, Bike, 
  Check, ShieldCheck, Lock, Car, Truck, Navigation, 
  SlidersHorizontal, Sparkles, Zap 
} from 'lucide-react';
import { UserAccount, CarrierProfile } from '../types';
import { carrierOperatingZones } from '../data';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUpdateUser: (user: UserAccount) => void;
  initialTab?: 'login' | 'register' | 'carrier' | 'partner';
  onNavigateToCarrierPortal?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  initialTab = 'login',
  onNavigateToCarrierPortal,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'carrier' | 'partner'>(initialTab);
  
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Login form state
  const [loginPhone, setLoginPhone] = useState(currentUser.phone);
  const [loginPass, setLoginPass] = useState('');

  // Register form state (Customer)
  const [regName, setRegName] = useState(currentUser.name);
  const [regPhone, setRegPhone] = useState(currentUser.phone);
  const [regEmail, setRegEmail] = useState(currentUser.email);
  const [regCity, setRegCity] = useState(currentUser.city || 'دمشق');

  // Freelance Carrier Registration Form State (ناقل حر)
  const [carrierName, setCarrierName] = useState(currentUser.name || 'عمار الكردي');
  const [carrierPhone, setCarrierPhone] = useState('+963 944 654 321');
  const [carrierVehicle, setCarrierVehicle] = useState<'motorcycle' | 'bicycle' | 'car' | 'van'>('motorcycle');
  const [carrierPlate, setCarrierPlate] = useState('دمشق 41829');
  const [carrierCity, setCarrierCity] = useState('دمشق');
  const [carrierZone, setCarrierZone] = useState('دمشق - الشعلان والمركز');
  const [carrierMaxDist, setCarrierMaxDist] = useState<number>(8);
  const [carrierLicenseId, setCarrierLicenseId] = useState('SY-9921045');
  const [carrierAgreed, setCarrierAgreed] = useState(true);

  // Partner form state
  const [partnerStoreName, setPartnerStoreName] = useState('');
  const [partnerCategory, setPartnerCategory] = useState('restaurants');
  const [partnerOwner, setPartnerOwner] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('+963 9');
  const [partnerAddress, setPartnerAddress] = useState('دمشق، الشعلان');

  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      phone: loginPhone,
    });
    setSuccessMessage('تم تسجيل الدخول بنجاح! مرحباً بك في تطبيق توصيل سوريا');
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1200);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: regName,
      phone: regPhone,
      email: regEmail,
      city: regCity,
      role: 'customer',
    };
    onUpdateUser(newUser);
    setSuccessMessage(`تم إنشاء حسابك الجديد بنجاح كعميل في ${regCity}!`);
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1200);
  };

  // Freelance Carrier Registration (ناقل حر)
  const handleCarrierRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const carrierProfile: CarrierProfile = {
      vehicleType: carrierVehicle,
      vehiclePlate: carrierPlate,
      workingZones: [carrierZone, 'دمشق - المزة والشيخ سعد', 'دمشق - الميدان والزاهرة'],
      maxDistanceKm: carrierMaxDist,
      currentZone: carrierZone,
      isAvailable: true,
      deliveriesCount: 0,
      rating: 5.0,
      earningsToday: 0,
      nationalIdOrLicense: carrierLicenseId,
    };

    const newCarrierUser: UserAccount = {
      id: `carrier-${Date.now()}`,
      name: carrierName,
      phone: carrierPhone,
      email: `${carrierName.replace(/\s+/g, '').toLowerCase()}@tawseel-carrier.sy`,
      city: carrierCity,
      role: 'carrier',
      carrierProfile,
    };

    onUpdateUser(newCarrierUser);
    setSuccessMessage(`مرحباً بك يا كابتن ${carrierName}! تم تسجيلك كناقل حر بنجاح. يتم نقلك الآن لبوابة الطلبات وفق المسافة...`);

    setTimeout(() => {
      setSuccessMessage('');
      onClose();
      if (onNavigateToCarrierPortal) {
        onNavigateToCarrierPortal();
      }
    }, 1500);
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(`تم تسجيل طلب انضمام متجر "${partnerStoreName}" بنجاح! سنتواصل معك عبر الرقم ${partnerPhone} لتفعيل المنيو.`);
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 text-right" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="p-4 bg-orange-500 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div>
            <h2 className="font-extrabold text-base">تسجيل الحساب وبوابات المنصة</h2>
            <p className="text-[11px] text-white/90">تطبيق توصيل سوريا (عملاء • ناقلون أحرار • متاجر)</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher - 4 tabs with prominent Carrier option */}
        <div className="flex border-b border-gray-100 bg-gray-50 p-1.5 gap-1 shrink-0 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'login'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            تسجيل دخول
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'register'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            حساب عميل
          </button>

          {/* DEDICATED FREELANCE CARRIER TAB */}
          <button
            onClick={() => setActiveTab('carrier')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'carrier'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-orange-700 bg-orange-50 hover:bg-orange-100'
            }`}
          >
            <Bike size={14} />
            <span>تسجيل كناقل حر 🛵</span>
          </button>

          <button
            onClick={() => setActiveTab('partner')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'partner'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            انضم كشريك متجر
          </button>
        </div>

        {/* Content Form */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 hide-scrollbar">
          {successMessage ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check size={28} strokeWidth={3} />
              </div>
              <h3 className="font-black text-sm text-gray-900 leading-relaxed">{successMessage}</h3>
            </div>
          ) : activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  رقم الموبايل السوري (+963)
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute start-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="+963 933 456 789"
                    className="w-full text-xs ps-9 pe-3 py-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  كلمة المرور أو رمز التحقق
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute start-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs ps-9 pe-3 py-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-gray-500">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-orange-500" />
                  <span>تذكرني على هذا الجهاز</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('تم إرسال كود الاستعادة عبر رسالة SMS سريعة.'); }} className="text-orange-600 font-bold hover:underline">
                  نسيت كلمة المرور؟
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all mt-2"
              >
                تسجيل الدخول
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('carrier')}
                  className="text-xs font-bold text-orange-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Bike size={14} />
                  <span>هل تعمل في التوصيل؟ سجّل كناقل حر واستقبل الطلبات فوراً</span>
                </button>
              </div>
            </form>
          ) : activeTab === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكامل</label>
                <div className="relative">
                  <User size={16} className="absolute start-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="فراس الشامي"
                    className="w-full text-xs ps-9 pe-3 py-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رقم الموبايل السوري</label>
                <div className="relative">
                  <Phone size={16} className="absolute start-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+963 9xx xxx xxx"
                    className="w-full text-xs ps-9 pe-3 py-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني (اختياري)</label>
                <div className="relative">
                  <Mail size={16} className="absolute start-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs ps-9 pe-3 py-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">المدينة / المحافظة</label>
                <select
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none bg-white font-medium"
                >
                  <option value="دمشق">دمشق (العاصمة)</option>
                  <option value="ريف دمشق">ريف دمشق</option>
                  <option value="حلب">حلب</option>
                  <option value="حمص">حمص</option>
                  <option value="اللاذقية">اللاذقية</option>
                  <option value="طرطوس">طرطوس</option>
                  <option value="حماة">حماة</option>
                  <option value="السويداء">السويداء</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all mt-2"
              >
                إنشاء حساب عميل
              </button>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
                <span className="text-amber-900 font-semibold">تريد العمل ككابتن توصيل مستقل؟</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('carrier')}
                  className="font-black text-orange-600 underline"
                >
                  التسجيل كناقل حر 🛵
                </button>
              </div>
            </form>
          ) : activeTab === 'carrier' ? (
            /* ======================================================== */
            /* DEDICATED FREELANCE COURIER REGISTRATION (التسجيل كناقل) */
            /* ======================================================== */
            <form onSubmit={handleCarrierRegister} className="space-y-3.5">
              
              <div className="bg-gradient-to-l from-orange-500 to-amber-500 text-white p-3.5 rounded-2xl shadow-xs space-y-1">
                <div className="flex items-center gap-2 font-black text-xs">
                  <Bike size={18} />
                  <span>بوابة انضمام الناقلين الأحرار (Freelance Couriers)</span>
                </div>
                <p className="text-[11px] text-white/95 leading-relaxed">
                  مخصصة لعمال التوصيل الذين يعملون بشكل حر ومستقل. تتيح لك تلقي الطلبات المتاحة فورياً وفق المسافة من موقعك، واستلام أجر التوصيل مباشرة كاش أو سيريتل كاش!
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم الكابتن الثلاثي</label>
                <div className="relative">
                  <User size={16} className="absolute start-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    placeholder="مثال: عمار الكردي"
                    className="w-full text-xs ps-9 pe-3 py-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رقم الموبايل السوري (واتساب واتصال)</label>
                <div className="relative">
                  <Phone size={16} className="absolute start-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={carrierPhone}
                    onChange={(e) => setCarrierPhone(e.target.value)}
                    placeholder="+963 944 xxx xxx"
                    className="w-full text-xs ps-9 pe-3 py-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Vehicle Type Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">نوع وسيلة التوصيل</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'motorcycle', title: 'دراجة نارية سريعة', icon: Bike, desc: 'الأكثر طلباً' },
                    { id: 'car', title: 'سيارة خاصة', icon: Car, desc: 'للطلبات الكبيرة' },
                    { id: 'bicycle', title: 'دراجة هوائية', icon: Bike, desc: 'للمسافات القريبة' },
                    { id: 'van', title: 'شاحنة / فان', icon: Truck, desc: 'للبضائع الثقيلة' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setCarrierVehicle(v.id as any)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 ${
                        carrierVehicle === v.id
                          ? 'border-orange-500 bg-orange-50 text-orange-950 ring-1 ring-orange-500'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <v.icon size={18} className={carrierVehicle === v.id ? 'text-orange-600' : 'text-gray-400'} />
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs block truncate">{v.title}</span>
                        <span className="text-[10px] text-gray-400 block">{v.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plate / License */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رقم اللوحة أو رخصة القيادة</label>
                <input
                  type="text"
                  required
                  value={carrierPlate}
                  onChange={(e) => setCarrierPlate(e.target.value)}
                  placeholder="مثال: دمشق 41829"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Operating Location Zone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">موقع انطلاقك الرئيسي في دمشق</label>
                <div className="relative">
                  <MapPin size={16} className="absolute start-3 top-3 text-gray-400" />
                  <select
                    value={carrierZone}
                    onChange={(e) => setCarrierZone(e.target.value)}
                    className="w-full text-xs ps-9 pe-3 py-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none bg-white font-bold"
                  >
                    {carrierOperatingZones.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preferred Distance Range Slider (وفق المسافة) */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">أقصى مسافة توصيل تفضلها (نطاق المشوار)</span>
                  <span className="text-xs font-black text-orange-600 bg-white px-2 py-0.5 rounded-lg border border-orange-200">
                    {carrierMaxDist} كم
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={carrierMaxDist}
                  onChange={(e) => setCarrierMaxDist(parseInt(e.target.value))}
                  className="w-full accent-orange-500 h-2 bg-gray-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                  <span>2 كم (أحياء مجاورة)</span>
                  <span>8 كم (متوسط)</span>
                  <span>15 كم (نطاق واسع)</span>
                </div>
              </div>

              {/* Freelance Terms Checkbox */}
              <div className="flex items-start gap-2 pt-1 text-xs text-gray-600">
                <input
                  type="checkbox"
                  id="carrier-terms"
                  checked={carrierAgreed}
                  onChange={(e) => setCarrierAgreed(e.target.checked)}
                  required
                  className="mt-0.5 accent-orange-500 w-4 h-4 rounded-sm"
                />
                <label htmlFor="carrier-terms" className="cursor-pointer text-[11px] leading-relaxed">
                  أؤكد أنني أعمل بشكل حر ومستقل، وأوافق على تلقي الطلبات وفق المسافة وتسليمها بأمانة وسرعة.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-l from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <Zap size={16} />
                <span>إتمام التسجيل والبدء بتلقي الطلبات فوراً 🛵</span>
              </button>
            </form>
          ) : (
            /* Partner Store Form */
            <form onSubmit={handlePartnerSubmit} className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                انضم لشبكة توصيل سوريا كشريك تجاري واعرض منتجاتك ومطعمك لآلاف العائلات في دمشق والمحافظات.
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم المتجر أو المطعم</label>
                <div className="relative">
                  <StoreIcon size={16} className="absolute start-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={partnerStoreName}
                    onChange={(e) => setPartnerStoreName(e.target.value)}
                    placeholder="مثال: شاورما الصديق، صيدلية النور..."
                    className="w-full text-xs ps-9 pe-3 py-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اختصاص المتجر</label>
                <select
                  value={partnerCategory}
                  onChange={(e) => setPartnerCategory(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none bg-white font-bold text-gray-800"
                >
                  <option value="restaurants">مطعم ومأكولات</option>
                  <option value="groceries">سوبرماركت ومؤونة</option>
                  <option value="pharmacy">صيدلية ورعاية صحية</option>
                  <option value="bakeries">مخبز وحلويات شامية</option>
                  <option value="family">مستلزمات العائلة والطفل</option>
                  <option value="coffee">بن ومقهى ومتة</option>
                  <option value="flowers">زهور وهدايا</option>
                  <option value="butchery">ملحمة ولحوم بلدية</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم المالك أو المدير</label>
                <input
                  type="text"
                  required
                  value={partnerOwner}
                  onChange={(e) => setPartnerOwner(e.target.value)}
                  placeholder="الاسم الثلاثي"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رقم الموبايل للتواصل</label>
                <input
                  type="text"
                  required
                  value={partnerPhone}
                  onChange={(e) => setPartnerPhone(e.target.value)}
                  placeholder="+963 9xx xxx xxx"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">العنوان والحي في دمشق</label>
                <input
                  type="text"
                  required
                  value={partnerAddress}
                  onChange={(e) => setPartnerAddress(e.target.value)}
                  placeholder="مثال: دمشق، المزة، أوتوستراد المزة"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all mt-2"
              >
                تقديم طلب الانضمام كشريك
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
