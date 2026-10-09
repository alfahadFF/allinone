import React, { useState } from 'react';
import { X, Plus, Store as StoreIcon, Utensils, Image, Tag, DollarSign, CheckCircle2, Flame, Layers } from 'lucide-react';
import { Store, Product, Category } from '../types';
import { categories } from '../data';

interface AddMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  onAddProductToStore: (storeId: number, product: Product) => void;
  onAddNewStore: (store: Store) => void;
}

export const AddMenuModal: React.FC<AddMenuModalProps> = ({
  isOpen,
  onClose,
  stores,
  onAddProductToStore,
  onAddNewStore,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'add_product' | 'add_store'>('add_product');

  // Add Product form state
  const [selectedStoreId, setSelectedStoreId] = useState<number>(stores[0]?.id || 1);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState<number>(35000);
  const [productOriginalPrice, setProductOriginalPrice] = useState<number>(0);
  const [productDescription, setProductDescription] = useState('');
  const [productCategoryTag, setProductCategoryTag] = useState('وجبات مميزة');
  const [productCalories, setProductCalories] = useState<number>(550);
  const [productImage, setProductImage] = useState(
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=300&h=300'
  );

  // Add New Store form state
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreType, setNewStoreType] = useState('restaurants');
  const [newStoreDeliveryTime, setNewStoreDeliveryTime] = useState('20-30');
  const [newStoreDeliveryFee, setNewStoreDeliveryFee] = useState<number>(10000);
  const [newStoreMinOrder, setNewStoreMinOrder] = useState<number>(30000);
  const [newStoreTags, setNewStoreTags] = useState('شامي، وجبات سريعة، توصيل فوري');
  const [newStoreBadge, setNewStoreBadge] = useState('جديد على توصيل');
  const [newStoreImage, setNewStoreImage] = useState(
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=200&h=200'
  );
  const [newStoreCover, setNewStoreCover] = useState(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800&h=300'
  );

  const [notification, setNotification] = useState('');

  // Sample image presets for quick pick
  const imagePresets = [
    { label: 'شاورما / لحوم', url: 'https://images.unsplash.com/photo-1648823153714-664426540c1c?auto=format&fit=crop&q=80&w=300&h=300' },
    { label: 'مشاوي / كباب', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300&h=300' },
    { label: 'برجر / كرسبي', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300&h=300' },
    { label: 'ألبان ومؤونة', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300&h=300' },
    { label: 'أدوية / صيدلية', url: 'https://images.unsplash.com/photo-1584308666744-24d5e4a7a8d1?auto=format&fit=crop&q=80&w=300&h=300' },
    { label: 'حلويات شامية', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300&h=300' },
  ];

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    const newProd: Product = {
      id: Date.now(),
      name: productName.trim(),
      description: productDescription.trim() || 'صنف طازج ومحضر يومياً بأعلى معايير الجودة الشامية',
      price: productPrice,
      originalPrice: productOriginalPrice > productPrice ? productOriginalPrice : undefined,
      categoryTag: productCategoryTag.trim() || 'الأصناف المميزة',
      calories: productCalories > 0 ? productCalories : undefined,
      image: productImage,
      popular: true,
      options: [
        { id: 'opt-reg', name: 'حجم عادي', priceDelta: 0 },
        { id: 'opt-large', name: 'حجم كبير إكسترا', priceDelta: 10000 },
      ],
    };

    onAddProductToStore(selectedStoreId, newProd);
    const targetStore = stores.find((s) => s.id === selectedStoreId);
    setNotification(`تمت إضافة الصنف "${productName}" بنجاح إلى منيو ${targetStore?.name || 'المتجر'}!`);
    
    // Reset form
    setProductName('');
    setProductDescription('');
    setTimeout(() => {
      setNotification('');
      onClose();
    }, 1300);
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    const newStore: Store = {
      id: Date.now(),
      name: newStoreName.trim(),
      type: newStoreType,
      rating: 4.9,
      reviews: '+100',
      deliveryTime: newStoreDeliveryTime,
      deliveryFee: newStoreDeliveryFee,
      minOrder: newStoreMinOrder,
      tags: newStoreTags.split('،').map((t) => t.trim()),
      discountBadge: newStoreBadge,
      image: newStoreImage,
      coverImage: newStoreCover,
      isPopular: true,
      isOpen: true,
      products: [
        {
          id: Date.now() + 1,
          name: `وجبة ${newStoreName} الخاصة`,
          description: 'صنف التوقيع الخاص بالمتجر بأفضل المكونات والنكهات السورية الأصيلة',
          price: 45000,
          categoryTag: 'الأكثر طلباً',
          image: newStoreImage,
          popular: true,
        },
      ],
    };

    onAddNewStore(newStore);
    setNotification(`تمت إضافة المتجر "${newStoreName}" باختصاص "${categories.find(c => c.id === newStoreType)?.title || newStoreType}" بنجاح!`);
    
    setNewStoreName('');
    setTimeout(() => {
      setNotification('');
      onClose();
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="p-4 bg-orange-500 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div>
            <h2 className="font-extrabold text-base">إدارة وإضافة المنيوهات وفق الاختصاص</h2>
            <p className="text-[11px] text-white/90">إضافة وجبات وأصناف جديدة أو إدراج متجر شريك</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50 p-1.5 gap-1 shrink-0">
          <button
            onClick={() => setMode('add_product')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'add_product'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            إضافة صنف لمنيو متجر
          </button>
          <button
            onClick={() => setMode('add_store')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'add_store'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            إضافة متجر جديد باختصاصه
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {notification ? (
            <div className="p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 size={26} strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-sm text-gray-900">{notification}</h3>
              <p className="text-xs text-gray-500">يمكنك الآن رؤية التحديث فوراً في التطبيق والطلب منه.</p>
            </div>
          ) : mode === 'add_product' ? (
            <form onSubmit={handleAddProduct} className="space-y-3">
              {/* Select Target Store */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  اختر المتجر لإضافة الصنف إلى قائمته
                </label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none bg-white font-bold text-gray-800"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({categories.find(c => c.id === s.type)?.title || s.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  اسم الوجبة أو المنتج
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="مثال: شاورما عربي دبل، سيتامول فورت، كيلو كباب..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Price and Category Tag */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    السعر (ل.س)
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={productPrice}
                    onChange={(e) => setProductPrice(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    قسم الصنف في المنيو
                  </label>
                  <input
                    type="text"
                    value={productCategoryTag}
                    onChange={(e) => setProductCategoryTag(e.target.value)}
                    placeholder="مثال: ساندويش، مقبلات، أدوية..."
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Original Price (optional discount) & Calories */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    سعر قبل الخصم (اختياري)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={productOriginalPrice || ''}
                    onChange={(e) => setProductOriginalPrice(Number(e.target.value))}
                    placeholder="0"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    السعرات الحرارية
                  </label>
                  <input
                    type="number"
                    value={productCalories || ''}
                    onChange={(e) => setProductCalories(Number(e.target.value))}
                    placeholder="550"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  وصف الصنف والمكونات
                </label>
                <textarea
                  rows={2}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="مكونات الوجبة، طريقة التحضير، حجم الحصة..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Image Presets Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  اختر صورة جاهزة وفق الاختصاص أو ضع رابطاً
                </label>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {imagePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProductImage(preset.url)}
                      className={`p-1.5 rounded-lg border text-[10px] font-bold truncate transition-all ${
                        productImage === preset.url
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={productImage}
                  onChange={(e) => setProductImage(e.target.value)}
                  placeholder="رابط صورة الصنف (URL)"
                  className="w-full text-[11px] p-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-gray-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all active:scale-98"
              >
                + إضافة الصنف فوراً للمنيو
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateStore} className="space-y-3">
              {/* Store Name & Specialization */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم المتجر / المطعم</label>
                <input
                  type="text"
                  required
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="مثال: مطعم ورد الشام، صيدلية النور..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  الاختصاص والتصنيف التجاري
                </label>
                <select
                  value={newStoreType}
                  onChange={(e) => setNewStoreType(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none bg-white font-bold text-gray-800"
                >
                  {categories.filter(c => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">وقت التوصيل (دقيقة)</label>
                  <input
                    type="text"
                    value={newStoreDeliveryTime}
                    onChange={(e) => setNewStoreDeliveryTime(e.target.value)}
                    placeholder="20-30"
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">رسوم التوصيل (ل.س)</label>
                  <input
                    type="number"
                    step={1000}
                    value={newStoreDeliveryFee}
                    onChange={(e) => setNewStoreDeliveryFee(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Min order & Tags */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الحد الأدنى للطلب (ل.س)</label>
                  <input
                    type="number"
                    step={5000}
                    value={newStoreMinOrder}
                    onChange={(e) => setNewStoreMinOrder(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">شارة العرض</label>
                  <input
                    type="text"
                    value={newStoreBadge}
                    onChange={(e) => setNewStoreBadge(e.target.value)}
                    placeholder="جديد، خصم 20%..."
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الكلمات الدلالية (Tags)</label>
                <input
                  type="text"
                  value={newStoreTags}
                  onChange={(e) => setNewStoreTags(e.target.value)}
                  placeholder="شاورما، سوري، مشويات، عائلي..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all active:scale-98"
              >
                + إنشاء وإدراج المتجر في التطبيق
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
