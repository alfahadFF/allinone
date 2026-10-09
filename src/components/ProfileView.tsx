import React, { useState } from 'react';
import { 
  User, Wallet, MapPin, Ticket, ShieldCheck, Headphones, 
  ChevronLeft, Sparkles, Plus, CreditCard, Bell, Heart, LogOut,
  UtensilsCrossed, UserPlus, Store as StoreIcon, Bike, Navigation
} from 'lucide-react';
import { Address, Coupon, UserAccount } from '../types';

interface ProfileViewProps {
  currentAddress: Address;
  onOpenAddresses: () => void;
  coupons: Coupon[];
  onSelectCoupon: (code: string) => void;
  currentUser?: UserAccount;
  onOpenAuth?: (tab?: 'login' | 'register' | 'carrier' | 'partner') => void;
  onOpenAddMenu?: () => void;
  onOpenCarrierPortal?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentAddress,
  onOpenAddresses,
  coupons,
  onSelectCoupon,
  currentUser = {
    id: 'usr-1',
    name: 'فهد العلي',
    phone: '+963 933 456 789',
    email: 'alfahad.sy@gmail.com',
    city: 'دمشق',
    role: 'customer',
  },
  onOpenAuth,
  onOpenAddMenu,
  onOpenCarrierPortal,
}) => {
  const [walletBalance, setWalletBalance] = useState(185000);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(100000);

  const handleRecharge = () => {
    setWalletBalance((prev) => prev + rechargeAmount);
    setShowRechargeModal(false);
    alert(`تم شحن محفظة توصيل بنجاح بمبلغ ${rechargeAmount.toLocaleString()} ل.س! رصيدك الجديد: ${(walletBalance + rechargeAmount).toLocaleString()} ل.س`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-24 hide-scrollbar">
      {/* Profile Header */}
      <div className="bg-white p-5 border-b border-gray-100">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-md shadow-orange-500/20 shrink-0">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200"
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg text-gray-900 truncate">{currentUser.name}</h2>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                <Sparkles size={11} className="text-amber-600" />
                {currentUser.role === 'customer' 
                  ? 'توصيل برو' 
                  : currentUser.role === 'partner' 
                  ? 'شريك متجر' 
                  : currentUser.role === 'carrier'
                  ? 'ناقل حر (كابتن مستقل)'
                  : 'كابتن توصيل'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{currentUser.phone}</p>
            <p className="text-[11px] text-gray-400">{currentUser.city} • {currentUser.email}</p>
          </div>
        </div>

        {/* Tawseel Pro Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-extrabold text-xs">
              <Sparkles size={14} />
              <span>عضوية توصيل برو الشامية</span>
            </div>
            <p className="text-[11px] text-white/90">توصيل مجاني غير محدود لجميع طلبات العائلة في دمشق</p>
          </div>
          <span className="text-[10px] bg-white/20 backdrop-blur-xs font-bold px-2.5 py-1 rounded-full">
            نشط
          </span>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="p-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Wallet size={22} />
            </div>
            <div>
              <span className="text-xs text-gray-400 font-medium block">رصيد محفظة توصيل كاش</span>
              <span className="text-xl font-black text-gray-900">{walletBalance.toLocaleString()} ل.س</span>
            </div>
          </div>

          <button
            onClick={() => setShowRechargeModal(true)}
            className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 transition-colors border border-orange-200/60"
          >
            <Plus size={15} />
            <span>شحن الرصيد</span>
          </button>
        </div>
      </div>

      {/* Quick Menu Options */}
      <div className="px-4 space-y-2">
        
        {/* NEW FEATURE: Add Menus & Stores by Specialization */}
        {onOpenAddMenu && (
          <div
            onClick={onOpenAddMenu}
            className="bg-gradient-to-l from-orange-500 to-amber-500 text-white p-3.5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <UtensilsCrossed size={18} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs">إضافة منيوهات وأصناف وفق الاختصاص</h4>
                <p className="text-[11px] text-white/90 mt-0.5">إدراج وجبات جديدة، قوائم أسعار، ومتاجر شريكة</p>
              </div>
            </div>
            <span className="bg-white text-orange-600 text-[10px] font-black px-2 py-1 rounded-lg">
              إضافة +
            </span>
          </div>
        )}

        {/* NEW FEATURE: Auth & Registration Forms */}
        {onOpenAuth && (
          <div
            onClick={() => onOpenAuth('login')}
            className="bg-white p-3.5 rounded-2xl border border-orange-200 bg-orange-50/30 shadow-xs flex items-center justify-between cursor-pointer hover:bg-orange-50/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <UserPlus size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">نماذج التسجيل وتبديل الحساب</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">تسجيل الدخول، حساب جديد، أو انضمام كشريك</p>
              </div>
            </div>
            <ChevronLeft size={16} className="text-gray-400" />
          </div>
        )}

        {/* NEW FEATURE: FREELANCE COURIER (التسجيل كناقل وبوابة الطلبات) */}
        {currentUser?.role === 'carrier' ? (
          <div
            onClick={onOpenCarrierPortal}
            className="bg-gradient-to-l from-slate-900 via-gray-900 to-amber-950 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between cursor-pointer hover:opacity-95 transition-all border border-amber-500/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <Bike size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-xs text-amber-300">بوابة الناقل الحر (كابتن نشط)</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-gray-300 mt-0.5">تصفح الطلبات الحية المتاحة وفق المسافة وقبول المشاوير</p>
              </div>
            </div>
            <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-xl shadow-xs">
              فتح البوابة 🛵
            </span>
          </div>
        ) : (
          <div
            onClick={() => onOpenAuth ? onOpenAuth('carrier') : onOpenCarrierPortal?.()}
            className="bg-white p-3.5 rounded-2xl border-2 border-orange-200 bg-orange-50/40 shadow-xs flex items-center justify-between cursor-pointer hover:bg-orange-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <Bike size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-xs text-gray-900">التسجيل كناقل حر (عمال التوصيل)</h4>
                  <span className="bg-orange-100 text-orange-800 text-[9px] font-black px-1.5 py-0.5 rounded-md">جديد</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">للعمل الحر واستقبال الطلبات الأقرب إليك بحسب المسافة</p>
              </div>
            </div>
            <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-xs">
              سجّل الآن 🛵
            </span>
          </div>
        )}


        <h3 className="font-bold text-xs text-gray-500 px-1 pt-2 mb-1">إعدادات الحساب والعائلة</h3>

        {/* Saved Addresses */}
        <div
          onClick={onOpenAddresses}
          className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin size={18} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">عناويني المحفوظة</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">{currentAddress.title} - {currentAddress.district}</p>
            </div>
          </div>
          <ChevronLeft size={16} className="text-gray-400" />
        </div>

        {/* Coupons */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Ticket size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">كوبونات وقسائم الخصم</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{coupons.length} كوبونات متاحة للاستخدام في سوريا</p>
              </div>
            </div>
          </div>

          {/* Coupon Pills */}
          <div className="space-y-2 pt-1 border-t border-gray-100">
            {coupons.map((c) => (
              <div
                key={c.code}
                onClick={() => {
                  onSelectCoupon(c.code);
                  alert(`تم نسخ وتفعيل الكود ${c.code}!`);
                }}
                className="p-2.5 rounded-xl border border-dashed border-purple-200 bg-purple-50/40 flex items-center justify-between cursor-pointer hover:bg-purple-50 transition-colors"
              >
                <div>
                  <span className="font-black text-xs text-purple-900 tracking-wider">{c.code}</span>
                  <p className="text-[10px] text-gray-500 mt-0.5">{c.description}</p>
                </div>
                <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-1 rounded-lg">
                  استخدم
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Help & Support */}
        <div
          onClick={() => alert('أهلاً بك في مركز مساعدة تطبيق توصيل سوريا! فريق خدمة العملاء جاهز للرد على استفسارك.')}
          className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Headphones size={18} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">مركز المساعدة والدعم المباشر</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">محادثة فورية مع خدمة العملاء في دمشق</p>
            </div>
          </div>
          <ChevronLeft size={16} className="text-gray-400" />
        </div>

        {/* Privacy & Safety */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-gray-900">الأمان وخصوصية البيانات</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">معلوماتك وطرق الدفع عبر سيريتل كاش أو الكاش محمية بالكامل</p>
            </div>
          </div>
          <ChevronLeft size={16} className="text-gray-400" />
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-base text-gray-900 mb-1">شحن محفظة توصيل كاش</h3>
            <p className="text-xs text-gray-500 mb-4">اختر المبلغ المراد شحنه عبر سيريتل كاش أو الحساب المصرفي</p>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {[50000, 100000, 200000, 300000, 500000, 1000000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setRechargeAmount(amt)}
                  className={`py-2.5 rounded-xl border text-xs font-black transition-all ${
                    rechargeAmount === amt
                      ? 'border-orange-500 bg-orange-50 text-orange-600 ring-2 ring-orange-500/20'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {amt.toLocaleString()} ل.س
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRechargeModal(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleRecharge}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
              >
                شحن {rechargeAmount.toLocaleString()} ل.س
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
