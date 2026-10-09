import React, { useState } from 'react';
import { X, MapPin, Check, Plus, Home, Briefcase, Users } from 'lucide-react';
import { Address } from '../types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  currentAddress: Address;
  onSelectAddress: (addr: Address) => void;
  onAddAddress: (addr: Address) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  addresses,
  currentAddress,
  onSelectAddress,
  onAddAddress,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newType, setNewType] = useState<'home' | 'work' | 'family'>('home');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDistrict) return;
    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      title: newTitle,
      type: newType,
      district: newDistrict,
      street: newStreet || 'الشارع الرئيسي',
      details: newDetails || 'ملاحظات إضافية للمندوب',
    };
    onAddAddress(newAddr);
    onSelectAddress(newAddr);
    setShowAddForm(false);
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home size={18} className="text-orange-600" />;
      case 'work':
        return <Briefcase size={18} className="text-blue-600" />;
      case 'family':
        return <Users size={18} className="text-purple-600" />;
      default:
        return <MapPin size={18} className="text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">عنوان التوصيل</h2>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3">
          {!showAddForm ? (
            <>
              <p className="text-xs text-gray-500 font-medium mb-1">اختر عنواناً للتوصيل السريع لطلبك</p>
              
              <div className="space-y-2">
                {addresses.map((addr) => {
                  const isSelected = currentAddress.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        onSelectAddress(addr);
                        onClose();
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-50/50 shadow-xs' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        {getIcon(addr.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{addr.title}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-gray-200 text-gray-700 font-semibold px-2 py-0.5 rounded-full">الافتراضي</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{addr.district} - {addr.street}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{addr.details}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 mt-1">
                          <Check size={13} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowAddForm(true)}
                className="w-full mt-3 py-3 border-2 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={18} />
                <span>إضافة عنوان جديد</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">نوع العنوان</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'home', label: 'المنزل', icon: Home },
                    { id: 'work', label: 'العمل', icon: Briefcase },
                    { id: 'family', label: 'العائلة', icon: Users },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setNewType(item.id as any);
                        if (!newTitle) setNewTitle(item.label);
                      }}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold ${
                        newType === item.id 
                          ? 'border-orange-500 bg-orange-50 text-orange-600' 
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم العنوان (مثال: بيت الأهل)</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="المنزل، الشقة، المكتب..."
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الحي والمدينة</label>
                <input
                  type="text"
                  required
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  placeholder="مثال: حي المزة، دمشق"
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الشارع ورقم المبنى</label>
                <input
                  type="text"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="شارع الجلاء، بناء الياسمين طابق 2"
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات للمندوب</label>
                <textarea
                  rows={2}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="الدور الثاني، اترك الطلب عند الباب، يرجى عدم الاتصال بالهاتف..."
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-orange-500/20"
                >
                  حفظ العنوان
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
