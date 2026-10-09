import { useState, useRef } from 'react';
import { 
  Search, Home, User, MapPin, ChevronRight, Star, Clock, 
  Bike, Utensils, ShoppingCart, Pill, Flower2, Coffee, 
  Croissant, Beef, LayoutGrid, Baby, Plus, Minus, Trash2, 
  ChevronLeft, ReceiptText, Sparkles, ShoppingBag, Tag, 
  CheckCircle2, CreditCard, Wallet, Smartphone, Shield,
  UtensilsCrossed, UserCheck, UserPlus, SlidersHorizontal, ArrowDownUp
} from 'lucide-react';
import { 
  categories, stores as initialStores, banners, savedAddresses, coupons, 
  familyBundles, initialOrders 
} from './data';
import { 
  Store, Product, CartItem, Address, Order, 
  FamilyBundle, Coupon, OrderReview, UserAccount 
} from './types';
import { LocationModal } from './components/LocationModal';
import { ProductModal } from './components/ProductModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { FamilyBundleModal } from './components/FamilyBundleModal';
import { OrdersView } from './components/OrdersView';
import { ProfileView } from './components/ProfileView';
import { SearchView } from './components/SearchView';
import { RatingModal } from './components/RatingModal';
import { AuthModal } from './components/AuthModal';
import { AddMenuModal } from './components/AddMenuModal';
import { ToastNotification, ToastData } from './components/ToastNotification';
import { CarrierPortalView } from './components/CarrierPortalView';

// Map icon strings to Lucide components
const IconMap = {
  Utensils, ShoppingCart, Pill, Flower2, Coffee, 
  Croissant, Beef, LayoutGrid, Baby
} as const;

export default function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<'home' | 'store' | 'cart' | 'search' | 'orders' | 'profile' | 'carrier'>('home');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Dynamic Stores & Menus state
  const [storesList, setStoresList] = useState<Store[]>(initialStores);

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount>({
    id: 'usr-1',
    name: 'فهد العلي',
    phone: '+963 933 456 789',
    email: 'alfahad.sy@gmail.com',
    city: 'دمشق',
    role: 'customer',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register' | 'carrier' | 'partner'>('login');

  // Cart & Orders state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Addresses & Location
  const [addresses, setAddresses] = useState<Address[]>(savedAddresses);
  const [currentAddress, setCurrentAddress] = useState<Address>(savedAddresses[0]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Categories & Filters
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'free_del' | 'high_rating' | 'fast'>('all');
  const [storeCategoryFilter, setStoreCategoryFilter] = useState<string>('all');
  const [priceFilterLimit, setPriceFilterLimit] = useState<number | null>(null);
  const [sortFromLowToHigh, setSortFromLowToHigh] = useState<boolean>(true);

  // Modals state
  const [activeProductForModal, setActiveProductForModal] = useState<Product | null>(null);
  const [activeBundleForModal, setActiveBundleForModal] = useState<FamilyBundle | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [activeOrderForRating, setActiveOrderForRating] = useState<Order | null>(null);
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);

  // Toast Notification state
  const [activeToast, setActiveToast] = useState<ToastData | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Checkout Options
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [selectedPayment, setSelectedPayment] = useState<'syriatel' | 'mtn' | 'card' | 'wallet' | 'cash'>('cash');
  const [contactless, setContactless] = useState<boolean>(true);

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.itemPrice * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Delivery Fee calculation (Syrian Pounds)
  const storeDeliveryFee = selectedStore?.deliveryFee ?? (cart.length > 0 ? 10000 : 0);
  
  // Calculate Discount
  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minSpend) {
    if (appliedCoupon.discountPercent) {
      discountAmount = Math.min((cartSubtotal * appliedCoupon.discountPercent) / 100, 30000);
    } else if (appliedCoupon.discountAmount) {
      discountAmount = appliedCoupon.discountAmount;
    }
  }

  const serviceFee = cart.length > 0 ? 3000 : 0;
  const finalTotal = Math.max(0, cartSubtotal + storeDeliveryFee + serviceFee + selectedTip - discountAmount);

  // Store select handler
  const handleStoreClick = (store: Store) => {
    setSelectedStore(store);
    setStoreCategoryFilter('all');
    setPriceFilterLimit(null);
    setSortFromLowToHigh(true);
    setCurrentView('store');
  };

  // Trigger Toast Notification with store's promotional message
  const showAddToCartToast = (product: Product, quantity: number, storeParam?: Store) => {
    const store =
      storeParam ||
      selectedStore ||
      storesList.find((s) => s.products.some((p) => p.id === product.id)) ||
      storesList[0];

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    // Look for special offers on other products in the same store
    const discountedOtherProduct = store.products.find(
      (p) => p.id !== product.id && p.originalPrice && p.originalPrice > p.price
    );

    let promoOffer: ToastData['promoOffer'] = null;

    if (discountedOtherProduct && discountedOtherProduct.originalPrice) {
      const savings = discountedOtherProduct.originalPrice - discountedOtherProduct.price;
      const discountPercent = Math.round((savings / discountedOtherProduct.originalPrice) * 100);
      promoOffer = {
        product: discountedOtherProduct,
        discountPercent,
        savingsAmount: savings,
        title: `عرض خاص في ${store.name}!`,
        message: `${discountedOtherProduct.name} متوفر الآن بسعر ${discountedOtherProduct.price.toLocaleString()} ل.س بدلاً من ${discountedOtherProduct.originalPrice.toLocaleString()} ل.س`,
      };
    } else {
      const popularOther = store.products.find((p) => p.id !== product.id && p.popular);
      if (popularOther) {
        promoOffer = {
          product: popularOther,
          title: `الأكثر طلباً أيضاً في ${store.name}:`,
          message: `${popularOther.name} متوفر بسعر ${popularOther.price.toLocaleString()} ل.س`,
        };
      } else if (store.discountBadge) {
        promoOffer = {
          title: `عرض المتجر:`,
          message: `${store.discountBadge} - استمتع بأقوى العروض على باقي الأصناف!`,
        };
      }
    }

    setActiveToast({
      id: `toast-${Date.now()}`,
      product,
      quantity,
      store,
      promoOffer,
    });

    toastTimerRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 5000);
  };

  // Add Item to cart with customization
  const handleAddToCart = (newItem: CartItem, storeParam?: Store) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.product.id === newItem.product.id &&
          i.selectedOption?.id === newItem.selectedOption?.id &&
          i.specialInstructions === newItem.specialInstructions &&
          JSON.stringify(i.selectedAddons) === JSON.stringify(newItem.selectedAddons)
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });

    showAddToCartToast(newItem.product, newItem.quantity, storeParam);
  };

  // Quick add product without customization
  const quickAddToCart = (product: Product, storeContext?: Store) => {
    const store =
      storeContext ||
      selectedStore ||
      storesList.find((s) => s.products.some((p) => p.id === product.id)) ||
      storesList[0];

    if (!selectedStore || cart.length === 0) {
      setSelectedStore(store);
    }
    const item: CartItem = {
      cartItemId: `${product.id}-${Date.now()}`,
      product,
      quantity: 1,
      itemPrice: product.price,
    };
    handleAddToCart(item, store);
  };

  // Add Promo product directly from Toast
  const handleAddPromoFromToast = (promoProduct: Product, store: Store) => {
    quickAddToCart(promoProduct, store);
  };

  // Update item quantity in cart
  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  // Apply Coupon code
  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCodeInput).trim().toUpperCase();
    const found = coupons.find((c) => c.code === code);
    if (!found) {
      setCouponError('رمز الكوبون غير صحيح');
      return;
    }
    if (cartSubtotal < found.minSpend) {
      setCouponError(`الحد الأدنى لتطبيق هذا الكوبون هو ${found.minSpend.toLocaleString()} ل.س`);
      return;
    }
    setAppliedCoupon(found);
    setCouponError('');
    if (!codeToApply) setCouponCodeInput('');
  };

  // Place Order & Open live tracking
  const handlePlaceOrder = () => {
    if (!selectedStore && cart.length === 0) return;

    const currentStore = selectedStore || storesList[0];
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `#SYR-${Math.floor(10000 + Math.random() * 90000)}`,
      store: currentStore,
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee: storeDeliveryFee,
      discount: discountAmount,
      serviceFee,
      tip: selectedTip,
      total: Math.round(finalTotal),
      address: currentAddress,
      paymentMethod: 
        selectedPayment === 'syriatel' ? 'سيريتل كاش (Syriatel Cash)' : 
        selectedPayment === 'mtn' ? 'إم تي إن كاش (MTN Cash)' : 
        selectedPayment === 'card' ? 'بطاقة مصرفية إلكترونية' : 
        selectedPayment === 'wallet' ? 'محفظة توصيل كاش' : 'الدفع نقداً عند الاستلام (كاش)',
      status: 'received',
      createdAt: 'الآن',
      estimatedDeliveryMinutes: 25,
      driver: {
        name: 'كابتن وسيم الدمشقي',
        phone: '+963 933 456 789',
        vehicle: 'دراجة نارية (بارت - دمشق 4120)',
        rating: 4.9,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
      },
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setAppliedCoupon(null);
    setCurrentView('home');
    setTrackedOrder(newOrder);
  };

  // Reorder past order
  const handleReorder = (order: Order) => {
    setSelectedStore(order.store);
    setCart(order.items.map((it) => ({ ...it, cartItemId: `${it.product.id}-${Date.now()}` })));
    setCurrentView('cart');
  };

  // Save Order Review
  const handleSaveReview = (orderId: string, review: OrderReview) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, review } : o))
    );
  };

  // Update order status interactively
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (trackedOrder && trackedOrder.id === orderId) {
      setTrackedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Add Product to Store Menu
  const handleAddProductToStore = (storeId: number, product: Product) => {
    setStoresList((prev) =>
      prev.map((s) =>
        s.id === storeId ? { ...s, products: [product, ...s.products] } : s
      )
    );
    if (selectedStore?.id === storeId) {
      setSelectedStore((prev) =>
        prev ? { ...prev, products: [product, ...prev.products] } : null
      );
    }
  };

  // Add New Store with specialization
  const handleAddNewStore = (newStore: Store) => {
    setStoresList((prev) => [newStore, ...prev]);
    setSelectedStore(newStore);
    setCurrentView('store');
  };

  // Filtered stores list on Home
  const filteredStores = storesList.filter((store) => {
    const matchCategory = activeCategory === 'all' || store.type === activeCategory;
    if (!matchCategory) return false;

    if (activeFilter === 'free_del') return store.deliveryFee === 0;
    if (activeFilter === 'high_rating') return store.rating >= 4.8;
    if (activeFilter === 'fast') return parseInt(store.deliveryTime.split('-')[0]) <= 20;

    return true;
  });

  return (
    <div className="flex justify-center bg-stone-900 min-h-screen">
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative overflow-hidden flex flex-col font-sans">
        
        {/* ======================================================== */}
        {/* VIEW: HOME */}
        {/* ======================================================== */}
        {currentView === 'home' && (
          <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
            
            {/* Header */}
            <header className="bg-white px-4 pt-4 pb-3 sticky top-0 z-20 shadow-xs border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div 
                  onClick={() => setIsLocationModalOpen(true)}
                  className="cursor-pointer group"
                >
                  <p className="text-[11px] text-gray-400 font-bold mb-0.5">التوصيل في سوريا إلى</p>
                  <div className="flex items-center gap-1.5 text-orange-600">
                    <MapPin size={17} fill="currentColor" className="text-orange-500" />
                    <span className="font-extrabold text-sm text-gray-900 group-hover:text-orange-600 transition-colors">
                      {currentAddress.title} ({currentAddress.district.split('،')[1] || currentAddress.district})
                    </span>
                    <ChevronLeft size={16} className="text-gray-400 group-hover:text-orange-600" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Courier Mode / Register Button */}
                  {currentUser.role === 'carrier' ? (
                    <button
                      onClick={() => setCurrentView('carrier')}
                      className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs transition-all"
                      title="بوابة طلبات الناقل الحر"
                    >
                      <Bike size={13} />
                      <span>طلبات الناقل</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setAuthModalInitialTab('carrier');
                        setIsAuthModalOpen(true);
                      }}
                      className="flex items-center gap-1 bg-amber-50 text-amber-900 hover:bg-amber-100 text-[10px] font-black px-2 py-1 rounded-full border border-amber-200 transition-colors"
                      title="التسجيل كناقل حر لعمال التوصيل"
                    >
                      <Bike size={13} className="text-amber-600" />
                      <span>تسجيل كناقل</span>
                    </button>
                  )}

                  {/* Quick Add Menu Button */}
                  <button
                    onClick={() => setIsAddMenuModalOpen(true)}
                    className="flex items-center gap-1 bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full border border-orange-200 hover:bg-orange-100 transition-colors"
                    title="إضافة صنف أو متجر وفق الاختصاص"
                  >
                    <Plus size={12} />
                    <span>إضافة منيو</span>
                  </button>

                  {/* Auth / Account Switcher Button */}
                  <button
                    onClick={() => {
                      setAuthModalInitialTab('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative"
                    title="تسجيل الدخول والحساب"
                  >
                    <User size={16} className="text-gray-700" />
                  </button>
                </div>
              </div>
              
              {/* Search Trigger Bar */}
              <div 
                onClick={() => setCurrentView('search')}
                className="bg-gray-100/90 hover:bg-gray-200/80 rounded-2xl flex items-center px-3.5 py-2.5 cursor-pointer text-gray-400 text-xs transition-colors"
              >
                <Search size={18} className="text-gray-400 me-2.5 shrink-0" />
                <span className="flex-1 text-gray-500 font-medium truncate">
                  ابحث عن مطعم، سوبرماركت، صيدلية، مؤونة البيت السوري...
                </span>
                <span className="text-[10px] bg-white text-orange-600 font-bold px-2 py-0.5 rounded-md shadow-2xs">
                  بحث
                </span>
              </div>
            </header>

            {/* Banners Carousel */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 snap-x">
                {banners.map((banner) => (
                  <div 
                    key={banner.id} 
                    onClick={() => setActiveCategory('restaurants')}
                    className="min-w-[290px] h-[130px] rounded-2xl overflow-hidden relative snap-center shrink-0 shadow-xs cursor-pointer group"
                  >
                    <img 
                      src={banner.image} 
                      alt={banner.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5">
                      <span className="text-[11px] bg-orange-500 text-white font-black px-2 py-0.5 rounded-full w-fit mb-1">
                        عرض خاص بالشام
                      </span>
                      <span className="text-white font-extrabold text-sm">{banner.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FREELANCE COURIER BANNER (التسجيل كناقل حر - طلبات وفق المسافة) */}
            <div className="px-4 py-1.5">
              <div 
                onClick={() => {
                  if (currentUser.role === 'carrier') {
                    setCurrentView('carrier');
                  } else {
                    setAuthModalInitialTab('carrier');
                    setIsAuthModalOpen(true);
                  }
                }}
                className="bg-gradient-to-l from-slate-950 via-slate-900 to-amber-950 text-white p-3 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:opacity-95 transition-all border border-amber-500/30"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                    <Bike size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-amber-300">
                        {currentUser.role === 'carrier' ? 'بوابة الناقل الحر نشطة 🟢' : 'فرصة عمل حر: سجّل كناقل توصيل'}
                      </span>
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-md">
                        {currentUser.role === 'carrier' ? 'متاح للعمل' : 'جديد'}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      {currentUser.role === 'carrier' 
                        ? 'تصفح الطلبات الحية المتاحة حولك وفق المسافة وابدأ التوصيل'
                        : 'استقبل الطلبات وفق المسافة من موقعك واكسب أجر كل مشوار كاش!'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-xl shrink-0 shadow-xs">
                  {currentUser.role === 'carrier' ? 'عرض الطلبات 🛵' : 'سجّل كناقل 🛵'}
                </span>
              </div>
            </div>

            {/* Special Section: مؤونة البيت السوري الأسبوعية (Family Bundles) */}
            <div className="px-4 my-2">
              <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl p-4 text-white shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 text-purple-200 text-xs font-bold mb-1">
                    <Baby size={14} />
                    <span>مؤونة العائلة ورعاية الطفل في سوريا</span>
                  </div>
                  <h3 className="text-base font-black mb-1">سلة مؤونة البيت السوري الأسبوعية</h3>
                  <p className="text-[11px] text-purple-100 max-w-[240px] leading-relaxed mb-3">
                    وفّر حتى 30% على زيت الزيتون، مياه بقين، لبنة وجبنة شل، حفاضات كانبيبي، وحليب الأطفال!
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveBundleForModal(familyBundles[0])}
                      className="bg-white text-purple-900 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs hover:bg-purple-50 transition-colors"
                    >
                      سلة المؤونة (175,000 ل.س)
                    </button>
                    <button
                      onClick={() => setActiveBundleForModal(familyBundles[1])}
                      className="bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors border border-purple-400/40"
                    >
                      باقة الطفل (160,000 ل.س)
                    </button>
                  </div>
                </div>

                {/* Decorative background shape */}
                <div className="absolute -bottom-8 -start-8 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="px-4 my-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-extrabold text-base text-gray-900">جميع الخدمات والمتاجر</h2>
                <span className="text-xs text-gray-400 font-medium">دمشق وريفها</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const Icon = IconMap[cat.iconName as keyof typeof IconMap] || LayoutGrid;
                  const isSelected = activeCategory === cat.id;

                  return (
                    <button 
                      key={cat.id} 
                      onClick={() => setActiveCategory(cat.id)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${cat.color} ${
                        isSelected 
                          ? 'ring-2 ring-orange-500 ring-offset-2 scale-105 shadow-sm' 
                          : 'group-hover:scale-105'
                      }`}>
                        <Icon size={24} />
                      </div>
                      <span className={`text-[11px] font-bold truncate max-w-full ${
                        isSelected ? 'text-orange-600' : 'text-gray-700'
                      }`}>
                        {cat.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="px-4 my-2">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'free_del', label: 'توصيل مجاني 🛵' },
                  { id: 'high_rating', label: 'الأعلى تقييماً ⭐ 4.8+' },
                  { id: 'fast', label: 'توصيل سريع (<25 د) ⚡' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as any)}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                      activeFilter === f.id
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stores List */}
            <div className="px-4 my-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-extrabold text-base text-gray-900">
                  {activeCategory === 'all' 
                    ? 'المتاجر والمطاعم المتاحة' 
                    : categories.find(c => c.id === activeCategory)?.title}
                  <span className="text-xs text-gray-400 font-normal ms-1.5">({filteredStores.length})</span>
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddMenuModalOpen(true)}
                    className="text-xs text-orange-600 font-bold hover:underline"
                  >
                    + إضافة متجر/منيو
                  </button>
                  {activeCategory !== 'all' && (
                    <button 
                      onClick={() => setActiveCategory('all')} 
                      className="text-xs text-gray-500 hover:underline"
                    >
                      عرض الكل
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-3.5">
                {filteredStores.map((store) => (
                  <div 
                    key={store.id} 
                    onClick={() => handleStoreClick(store)}
                    className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 cursor-pointer active:scale-[0.99] transition-all hover:shadow-md hover:border-orange-200"
                  >
                    {/* Cover Banner */}
                    <div className="h-32 w-full relative">
                      <img src={store.coverImage} className="w-full h-full object-cover" alt={store.name} />
                      
                      {store.discountBadge && (
                        <div className="absolute top-2.5 start-2.5 bg-orange-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                          {store.discountBadge}
                        </div>
                      )}

                      <div className="absolute top-2.5 end-2.5 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
                        <Clock size={12} className="text-orange-600" />
                        <span className="text-xs font-bold text-gray-800">{store.deliveryTime} د</span>
                      </div>
                    </div>

                    {/* Store Info */}
                    <div className="p-3.5 flex gap-3 relative">
                      <div className="w-14 h-14 rounded-2xl border-2 border-white overflow-hidden bg-white shadow-md shrink-0 -mt-8 relative z-10">
                        <img src={store.image} className="w-full h-full object-cover" alt={store.name} />
                      </div>
                      <div className="flex-1 -mt-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h3 className="font-extrabold text-sm text-gray-900 truncate">{store.name}</h3>
                          <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md text-xs font-extrabold text-amber-800 shrink-0">
                            <Star size={12} className="text-amber-500 fill-amber-500" />
                            {store.rating}
                          </div>
                        </div>

                        <p className="text-xs text-gray-400 mb-2 truncate">
                          {store.tags.join(' • ')}
                        </p>

                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                          <div className="flex items-center gap-1">
                            <Bike size={14} className="text-orange-500" />
                            <span>{store.deliveryFee === 0 ? 'توصيل مجاني' : `${store.deliveryFee.toLocaleString()} ل.س`}</span>
                          </div>
                          <span>•</span>
                          <span className="text-[11px] text-gray-400">الحد الأدنى: {store.minOrder.toLocaleString()} ل.س</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: STORE DETAIL */}
        {/* ======================================================== */}
        {currentView === 'store' && selectedStore && (
          <div className="flex-1 overflow-y-auto pb-28 bg-gray-50 hide-scrollbar">
            {/* Top Cover */}
            <div className="relative h-48">
              <img src={selectedStore.coverImage} className="w-full h-full object-cover" alt="" />
              <button 
                onClick={() => setCurrentView('home')}
                className="absolute top-4 start-4 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-900 shadow-sm"
              >
                <ChevronRight size={22} />
              </button>
            </div>
            
            {/* Store Information Card */}
            <div className="bg-white rounded-t-3xl -mt-6 relative z-10 px-4 pt-5 pb-5 shadow-xs mb-2">
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 flex-1 pe-2">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-xl font-black text-gray-900">{selectedStore.name}</h1>
                    <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{selectedStore.tags.join(' • ')}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl border border-gray-100 overflow-hidden shadow-sm shrink-0">
                  <img src={selectedStore.image} className="w-full h-full object-cover" alt="" />
                </div>
              </div>
              
              {/* Badges / Metrics */}
              <div className="grid grid-cols-3 divide-x divide-x-reverse border border-gray-100 rounded-2xl p-2.5 bg-gray-50 text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-gray-900 font-black text-xs mb-0.5">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span>{selectedStore.rating}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{selectedStore.reviews} تقييم</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-gray-900 font-black text-xs mb-0.5">
                    <Clock size={13} className="text-orange-500" />
                    <span>{selectedStore.deliveryTime}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">دقيقة</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-gray-900 font-black text-xs mb-0.5">
                    <Bike size={13} className="text-orange-500" />
                    <span>{selectedStore.deliveryFee === 0 ? 'مجاني' : `${selectedStore.deliveryFee.toLocaleString()} ل.س`}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">رسوم التوصيل</span>
                </div>
              </div>
            </div>

            {/* In-Store Header Bar with Add Item Button */}
            <div className="px-4 py-2 bg-white sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {['all', ...Array.from(new Set(selectedStore.products.map(p => p.categoryTag || 'أخرى')))].map((catTag) => (
                  <button
                    key={catTag}
                    onClick={() => setStoreCategoryFilter(catTag)}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                      storeCategoryFilter === catTag
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {catTag === 'all' ? 'جميع الأصناف' : catTag}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsAddMenuModalOpen(true)}
                className="shrink-0 bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 hover:bg-orange-100"
              >
                <Plus size={12} />
                <span>إضافة صنف</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* PRICE SLIDER & BUDGET FILTER (شريط تمرير ميزانية العائلة) */}
            {/* ======================================================== */}
            {(() => {
              const storeProducts = selectedStore.products;
              const storePrices = storeProducts.map((p) => p.price);
              const minStorePrice = storePrices.length > 0 ? Math.min(...storePrices) : 0;
              const maxStorePrice = storePrices.length > 0 ? Math.max(...storePrices) : 100000;
              const effectiveMaxPrice = priceFilterLimit !== null ? priceFilterLimit : maxStorePrice;

              const matchingProducts = storeProducts
                .filter((p) => storeCategoryFilter === 'all' || p.categoryTag === storeCategoryFilter)
                .filter((p) => p.price <= effectiveMaxPrice)
                .sort((a, b) => {
                  if (sortFromLowToHigh) {
                    return a.price - b.price;
                  }
                  return 0;
                });

              // Dynamic budget quick presets
              const stepDiff = maxStorePrice - minStorePrice;
              const preset1 = Math.round((minStorePrice + stepDiff * 0.3) / 5000) * 5000;
              const preset2 = Math.round((minStorePrice + stepDiff * 0.6) / 5000) * 5000;

              return (
                <>
                  <div className="bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-white px-4 py-3.5 border-b border-orange-100/90 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs">
                          <SlidersHorizontal size={14} />
                        </div>
                        <div>
                          <h2 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
                            <span>ميزانية العائلة وفلترة الأسعار</span>
                            <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded">
                              من الأقل للأعلى
                            </span>
                          </h2>
                          <p className="text-[10px] text-gray-500">
                            اسحب شريط التمرير لتحديد سقف الميزانية المناسبة
                          </p>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <span className="text-[10px] text-gray-400 block font-medium">سقف السعر</span>
                        <span className="text-xs font-black text-orange-600 bg-white px-2.5 py-1 rounded-lg border border-orange-200 shadow-2xs">
                          حتى {effectiveMaxPrice.toLocaleString()} ل.س
                        </span>
                      </div>
                    </div>

                    {/* Interactive Slider Input */}
                    <div className="space-y-1.5 pt-1">
                      <div className="relative flex items-center">
                        <input
                          type="range"
                          min={minStorePrice}
                          max={maxStorePrice}
                          step={Math.max(1000, Math.round(stepDiff / 30 / 1000) * 1000 || 1000)}
                          value={effectiveMaxPrice}
                          onChange={(e) => setPriceFilterLimit(Number(e.target.value))}
                          className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-hidden"
                          aria-label="تحديد الحد الأقصى للسعر"
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold px-1">
                        <span>الأقل: {minStorePrice.toLocaleString()} ل.س</span>
                        <span>الأعلى: {maxStorePrice.toLocaleString()} ل.س</span>
                      </div>
                    </div>

                    {/* Quick Budget Shortcuts & Sorting Button */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-orange-100">
                      <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-0.5">
                        <span className="text-[10px] text-gray-400 font-bold ml-1 shrink-0">ميزانيات سريعة:</span>
                        <button
                          type="button"
                          onClick={() => setPriceFilterLimit(maxStorePrice)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                            priceFilterLimit === null || priceFilterLimit >= maxStorePrice
                              ? 'bg-orange-500 text-white shadow-2xs'
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          الكل ({storeProducts.length})
                        </button>

                        {preset1 > minStorePrice && preset1 < maxStorePrice && (
                          <button
                            type="button"
                            onClick={() => setPriceFilterLimit(preset1)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                              priceFilterLimit === preset1
                                ? 'bg-orange-500 text-white shadow-2xs'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            اقتصادي ({preset1.toLocaleString()})
                          </button>
                        )}

                        {preset2 > minStorePrice && preset2 < maxStorePrice && (
                          <button
                            type="button"
                            onClick={() => setPriceFilterLimit(preset2)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                              priceFilterLimit === preset2
                                ? 'bg-orange-500 text-white shadow-2xs'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            متوسط ({preset2.toLocaleString()})
                          </button>
                        )}
                      </div>

                      {/* Sort Toggle */}
                      <button
                        type="button"
                        onClick={() => setSortFromLowToHigh(!sortFromLowToHigh)}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                          sortFromLowToHigh
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                        title="تبديل الترتيب من الأقل للأعلى"
                      >
                        <ArrowDownUp size={11} />
                        <span>{sortFromLowToHigh ? 'من الأقل للأعلى ✓' : 'الترتيب العادي'}</span>
                      </button>
                    </div>

                    {/* Filter Matching Counter */}
                    <div className="flex items-center justify-between text-[11px] text-gray-600 pt-0.5">
                      <span className="font-medium">
                        يظهر <strong className="text-orange-600 font-black">{matchingProducts.length}</strong> من أصل {storeProducts.length} صنف ضمن ميزانيتك
                      </span>

                      {priceFilterLimit !== null && priceFilterLimit < maxStorePrice && (
                        <button
                          type="button"
                          onClick={() => setPriceFilterLimit(maxStorePrice)}
                          className="text-orange-600 hover:text-orange-700 font-bold text-[10px] underline cursor-pointer"
                        >
                          إلغاء الفلترة ↺
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Products List */}
                  <div className="px-4 py-3 bg-white space-y-3">
                    {matchingProducts.length === 0 ? (
                      <div className="py-12 px-4 text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
                          <SlidersHorizontal size={24} />
                        </div>
                        <h3 className="text-sm font-bold text-gray-800 mb-1">
                          لا توجد أصناف بسعر أقل من {effectiveMaxPrice.toLocaleString()} ل.س
                        </h3>
                        <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
                          اسحب شريط التمرير إلى اليسار لزيادة الميزانية أو اضغط أدناه لإظهار كل الأصناف.
                        </p>
                        <button
                          type="button"
                          onClick={() => setPriceFilterLimit(maxStorePrice)}
                          className="bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs hover:bg-orange-600 transition-colors"
                        >
                          إظهار جميع الأصناف ({storeProducts.length})
                        </button>
                      </div>
                    ) : (
                      matchingProducts.map((product) => {
                        const cartItem = cart.find((i) => i.product.id === product.id);

                        return (
                          <div
                            key={product.id}
                            className="flex gap-3 py-3.5 border-b border-gray-100 last:border-0"
                          >
                            <div
                              onClick={() => setActiveProductForModal(product)}
                              className="flex-1 cursor-pointer min-w-0"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-extrabold text-xs text-gray-900">{product.name}</h3>
                                {product.popular && (
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    مطلوب
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 mb-2 line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                              <div className="flex items-baseline gap-2">
                                <span className="font-black text-sm text-orange-600">
                                  {product.price.toLocaleString()} ل.س
                                </span>
                                {product.originalPrice && (
                                  <span className="text-[11px] text-gray-400 line-through">
                                    {product.originalPrice.toLocaleString()} ل.س
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Product Image and Button */}
                            <div className="w-24 flex flex-col items-end gap-2 shrink-0">
                              <div
                                onClick={() => setActiveProductForModal(product)}
                                className="w-24 h-24 rounded-2xl overflow-hidden shadow-xs cursor-pointer border border-gray-100 bg-gray-50"
                              >
                                <img
                                  src={product.image}
                                  className="w-full h-full object-cover"
                                  alt={product.name}
                                />
                              </div>

                              {cartItem ? (
                                <div className="flex items-center justify-between w-full bg-orange-500 text-white rounded-xl px-2 py-1 h-8 shadow-xs">
                                  <button
                                    onClick={() => updateQuantity(cartItem.cartItemId, -1)}
                                    className="p-1 active:scale-90"
                                  >
                                    {cartItem.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                                  </button>
                                  <span className="font-black text-xs">{cartItem.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(cartItem.cartItemId, 1)}
                                    className="p-1 active:scale-90"
                                  >
                                    <Plus size={13} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    // If product has options/addons, open modal; otherwise quick add
                                    if (
                                      (product.options && product.options.length > 0) ||
                                      (product.addons && product.addons.length > 0)
                                    ) {
                                      setActiveProductForModal(product);
                                    } else {
                                      quickAddToCart(product, selectedStore);
                                    }
                                  }}
                                  className="flex items-center justify-center gap-1 w-full bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl h-8 font-bold text-xs active:scale-95 transition-all"
                                >
                                  <Plus size={15} /> إضافة
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: CART & CHECKOUT */}
        {/* ======================================================== */}
        {currentView === 'cart' && (
          <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
            {/* Header */}
            <header className="bg-white px-4 py-3.5 border-b border-gray-100 flex items-center shadow-xs relative shrink-0">
              <button 
                onClick={() => setCurrentView(selectedStore ? 'store' : 'home')}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 absolute start-3 hover:bg-gray-200 transition-colors"
              >
                <ChevronRight size={22} />
              </button>
              <h1 className="flex-1 text-center font-black text-base text-gray-900">سلة المشتريات</h1>
            </header>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-4">
                  <ShoppingBag size={40} />
                </div>
                <h2 className="text-lg font-black mb-1 text-gray-800">سلتك فارغة حالياً</h2>
                <p className="text-xs text-gray-500 mb-6 max-w-xs leading-relaxed">
                  أضف وجباتك الشامية المفضلة أو مؤونة العائلة وتمتع بتوصيل سريع حتى باب منزلك في دمشق.
                </p>
                <button 
                  onClick={() => setCurrentView('home')}
                  className="bg-orange-500 text-white font-bold text-xs py-3 px-8 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                >
                  استكشف المتاجر ومحلات المؤونة
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pb-32 hide-scrollbar p-4 space-y-3">
                {/* Store Header in Cart */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                      <img src={selectedStore?.image || storesList[0].image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-gray-900">{selectedStore?.name || 'متجر التوصيل'}</h3>
                      <p className="text-[10px] text-gray-400">وقت التوصيل التقديري: {selectedStore?.deliveryTime || '20-30'} دقيقة</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentView('store')}
                    className="text-xs font-bold text-orange-600 hover:underline"
                  >
                    + إضافة أصناف
                  </button>
                </div>

                {/* Items List */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-100">
                  {cart.map((item) => (
                    <div key={item.cartItemId} className="py-3 first:pt-0 last:pb-0 flex gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                        <img src={item.product.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-xs text-gray-900 truncate">{item.product.name}</h4>
                            {item.selectedOption && (
                              <p className="text-[10px] text-gray-400">{item.selectedOption.name}</p>
                            )}
                            {item.selectedAddons && item.selectedAddons.length > 0 && (
                              <p className="text-[10px] text-orange-600">
                                + {item.selectedAddons.map(a => a.name).join('، ')}
                              </p>
                            )}
                            {item.specialInstructions && (
                              <p className="text-[10px] text-gray-500 italic">ملاحظة: {item.specialInstructions}</p>
                            )}
                          </div>
                          <span className="font-black text-xs text-gray-900 shrink-0">
                            {(item.itemPrice * item.quantity).toLocaleString()} ل.س
                          </span>
                        </div>

                        {/* Quantity bar */}
                        <div className="flex items-center justify-between w-24 bg-gray-100 rounded-lg px-2 py-0.5 mt-2">
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, -1)} 
                            className="p-1 text-gray-600 hover:text-gray-900"
                          >
                            {item.quantity === 1 ? <Trash2 size={13} className="text-red-500" /> : <Minus size={13} />}
                          </button>
                          <span className="font-black text-xs text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, 1)} 
                            className="p-1 text-gray-600 hover:text-gray-900"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contactless Delivery Toggle */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Shield size={18} className="text-orange-600" />
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">توصيل بدون تلامس عند الباب</h4>
                      <p className="text-[10px] text-gray-400">سيقوم الكابتن بترك الطلب أمام الباب وإشعارك هاتفياً</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={contactless}
                    onChange={(e) => setContactless(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </div>

                {/* Promo Code / Coupon Section */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <Tag size={15} className="text-orange-500" />
                    <span>كوبون أو قسيمة خصم (مثال: SHAM50)</span>
                  </div>

                  {!appliedCoupon ? (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value)}
                          placeholder="أدخل الرمز (مثال: SHAM50)"
                          className="flex-1 text-xs p-2.5 bg-gray-100 rounded-xl uppercase font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                        <button
                          onClick={() => handleApplyCoupon()}
                          className="bg-orange-500 text-white font-bold text-xs px-4 rounded-xl shadow-xs hover:bg-orange-600 transition-colors"
                        >
                          تطبيق
                        </button>
                      </div>
                      {couponError && <p className="text-[11px] text-red-500 font-medium px-1">{couponError}</p>}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-black text-xs text-emerald-800 tracking-wider">
                          تم تفعيل: {appliedCoupon.code}
                        </span>
                        <p className="text-[10px] text-emerald-600">{appliedCoupon.description}</p>
                      </div>
                      <button
                        onClick={() => setAppliedCoupon(null)}
                        className="text-xs text-red-500 font-bold hover:underline"
                      >
                        إلغاء
                      </button>
                    </div>
                  )}
                </div>

                {/* Rider Tip */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-800">إكرامية لكابتن التوصيل ❤️</span>
                    <span className="text-[11px] text-gray-400">100% تذهب للمندوب مباشرة</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 5000, 10000, 20000].map((tip) => (
                      <button
                        key={tip}
                        onClick={() => setSelectedTip(tip)}
                        className={`py-1.5 rounded-xl border text-xs font-extrabold transition-all ${
                          selectedTip === tip
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {tip === 0 ? 'بدون' : `${tip.toLocaleString()} ل.س`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method Selection for Syria */}
                <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                  <h4 className="text-xs font-bold text-gray-800">طريقة الدفع المعتمدة في سوريا</h4>
                  <div className="space-y-1.5">
                    {[
                      { id: 'cash', title: 'الدفع نقداً عند الاستلام (كاش)', desc: 'تسليم المبلغ بالليرة السورية لكابتن التوصيل عند باب بيتك', icon: ReceiptText },
                      { id: 'syriatel', title: 'سيريتل كاش (Syriatel Cash)', desc: 'دفع إلكتروني فوري وآمن عبر كود التاجر', icon: Smartphone },
                      { id: 'mtn', title: 'إم تي إن كاش (MTN Cash)', desc: 'تحويل سريع عبر محفظة كاش', icon: Smartphone },
                      { id: 'wallet', title: 'محفظة توصيل كاش', desc: 'خصم مباشر من رصيدك المشحون', icon: Wallet },
                      { id: 'card', title: 'بطاقة مصرفية إلكترونية (بيمو / البركة)', desc: 'دفع عبر الحساب البنكي السوري', icon: CreditCard },
                    ].map((pm) => (
                      <label
                        key={pm.id}
                        onClick={() => setSelectedPayment(pm.id as any)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          selectedPayment === pm.id
                            ? 'border-orange-500 bg-orange-50/40 text-orange-900'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <pm.icon size={17} className={selectedPayment === pm.id ? 'text-orange-600' : 'text-gray-500'} />
                          <div>
                            <span className="font-bold text-xs text-gray-900 block">{pm.title}</span>
                            <span className="text-[10px] text-gray-400">{pm.desc}</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPayment === pm.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                        }`}>
                          {selectedPayment === pm.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2 text-xs">
                  <h4 className="font-extrabold text-gray-900 mb-2">ملخص الحساب</h4>
                  <div className="flex justify-between text-gray-500">
                    <span>المجموع الفرعي ({cartItemCount} أصناف)</span>
                    <span className="font-semibold text-gray-800">{cartSubtotal.toLocaleString()} ل.س</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>رسوم التوصيل في دمشق</span>
                    <span className="font-semibold text-gray-800">
                      {storeDeliveryFee === 0 ? 'مجاناً' : `${storeDeliveryFee.toLocaleString()} ل.س`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>رسوم الخدمة والتطبيق</span>
                    <span className="font-semibold text-gray-800">{serviceFee.toLocaleString()} ل.س</span>
                  </div>
                  {selectedTip > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>إكرامية المندوب</span>
                      <span className="font-semibold text-gray-800">{selectedTip.toLocaleString()} ل.س</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>الخصم المطبق</span>
                      <span>-{discountAmount.toLocaleString()} ل.س</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-sm text-gray-900">
                    <span>المبلغ الإجمالي</span>
                    <span className="text-orange-600 text-base">{Math.round(finalTotal).toLocaleString()} ل.س</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Checkout Sticky Button */}
            {cart.length > 0 && (
              <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 p-3.5 shadow-lg z-20">
                <button 
                  onClick={handlePlaceOrder}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-between px-5 transition-all text-sm"
                >
                  <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs font-black">
                    {cartItemCount} أصناف
                  </span>
                  <span>تأكيد الطلب والدفع</span>
                  <span>{Math.round(finalTotal).toLocaleString()} ل.س</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: SEARCH */}
        {/* ======================================================== */}
        {currentView === 'search' && (
          <SearchView
            onSelectStore={(store) => {
              setSelectedStore(store);
              setCurrentView('store');
            }}
            onSelectProduct={(product, store) => {
              setSelectedStore(store);
              setActiveProductForModal(product);
            }}
            onClose={() => setCurrentView('home')}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW: ORDERS */}
        {/* ======================================================== */}
        {currentView === 'orders' && (
          <OrdersView
            orders={orders}
            onTrackOrder={(order) => setTrackedOrder(order)}
            onReorder={handleReorder}
            onBrowseStores={() => setCurrentView('home')}
            onRateOrder={(order) => setActiveOrderForRating(order)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW: PROFILE */}
        {/* ======================================================== */}
        {currentView === 'profile' && (
          <ProfileView
            currentAddress={currentAddress}
            onOpenAddresses={() => setIsLocationModalOpen(true)}
            coupons={coupons}
            onSelectCoupon={(code) => {
              handleApplyCoupon(code);
              setCurrentView('cart');
            }}
            currentUser={currentUser}
            onOpenAuth={(tab) => {
              setAuthModalInitialTab(tab || 'login');
              setIsAuthModalOpen(true);
            }}
            onOpenAddMenu={() => setIsAddMenuModalOpen(true)}
            onOpenCarrierPortal={() => setCurrentView('carrier')}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW: CARRIER PORTAL (بوابة الناقل الحر والطلبات وفق المسافة) */}
        {/* ======================================================== */}
        {currentView === 'carrier' && (
          <CarrierPortalView
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onBackToCustomerMode={() => setCurrentView('home')}
          />
        )}

        {/* ======================================================== */}
        {/* BOTTOM NAVIGATION BAR */}
        {/* ======================================================== */}
        {currentView !== 'store' && currentView !== 'carrier' && (
          <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center z-30 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.08)]">
            <button 
              onClick={() => setCurrentView('home')}
              className={`flex flex-col items-center gap-1 p-1 flex-1 transition-colors ${
                currentView === 'home' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Home size={22} strokeWidth={currentView === 'home' ? 2.5 : 2} />
              <span className="text-[10px] font-black">الرئيسية</span>
            </button>

            <button 
              onClick={() => setCurrentView('search')}
              className={`flex flex-col items-center gap-1 p-1 flex-1 transition-colors ${
                currentView === 'search' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Search size={22} strokeWidth={currentView === 'search' ? 2.5 : 2} />
              <span className="text-[10px] font-black">بحث</span>
            </button>

            {/* Cart Button */}
            <button 
              onClick={() => setCurrentView('cart')}
              className={`flex flex-col items-center gap-1 p-1 flex-1 relative transition-colors ${
                currentView === 'cart' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <ShoppingBag size={22} strokeWidth={currentView === 'cart' ? 2.5 : 2} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -end-2.5 bg-orange-600 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white animate-scale">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black">السلة</span>
            </button>
            
            {/* Orders Button */}
            <button 
              onClick={() => setCurrentView('orders')}
              className={`flex flex-col items-center gap-1 p-1 flex-1 relative transition-colors ${
                currentView === 'orders' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <ReceiptText size={22} strokeWidth={currentView === 'orders' ? 2.5 : 2} />
                {orders.some(o => o.status !== 'delivered') && (
                  <span className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>
              <span className="text-[10px] font-black">طلباتي</span>
            </button>

            {/* Profile Button */}
            <button 
              onClick={() => setCurrentView('profile')}
              className={`flex flex-col items-center gap-1 p-1 flex-1 transition-colors ${
                currentView === 'profile' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <User size={22} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
              <span className="text-[10px] font-black">حسابي</span>
            </button>
          </div>
        )}
        
        {/* Floating Cart Button for Store View */}
        {currentView === 'store' && cartItemCount > 0 && (
          <div className="absolute bottom-4 w-full px-4 z-20">
            <button 
              onClick={() => setCurrentView('cart')}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-extrabold py-3.5 rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-between px-5 transition-all"
            >
              <div className="flex items-center gap-2 bg-white/20 px-2.5 py-1 rounded-xl">
                <ShoppingBag size={16} />
                <span className="text-xs font-black">{cartItemCount} أصناف</span>
              </div>
              <span className="text-sm">عرض السلة وإتمام الطلب</span>
              <span className="text-sm font-black">{cartSubtotal.toLocaleString()} ل.س</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODALS */}
        {/* ======================================================== */}
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          addresses={addresses}
          currentAddress={currentAddress}
          onSelectAddress={(addr) => setCurrentAddress(addr)}
          onAddAddress={(newAddr) => setAddresses((prev) => [...prev, newAddr])}
        />

        <ProductModal
          product={activeProductForModal}
          onClose={() => setActiveProductForModal(null)}
          onAddToCart={handleAddToCart}
        />

        <FamilyBundleModal
          bundle={activeBundleForModal}
          onClose={() => setActiveBundleForModal(null)}
          onAddBundleToCart={(bundleItems) => {
            bundleItems.forEach((it) => handleAddToCart(it));
            setCurrentView('cart');
          }}
        />

        <OrderTrackingModal
          order={trackedOrder}
          onClose={() => setTrackedOrder(null)}
          onOrderDelivered={(orderId) => {
            setOrders((prev) =>
              prev.map((o) => (o.id === orderId ? { ...o, status: 'delivered' } : o))
            );
          }}
          onOpenRating={(order) => setActiveOrderForRating(order)}
        />

        {/* RATING MODAL */}
        <RatingModal
          order={activeOrderForRating}
          onClose={() => setActiveOrderForRating(null)}
          onSubmitReview={handleSaveReview}
        />

        {/* AUTH & REGISTRATION MODAL */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            if (updated.role === 'carrier') {
              setCurrentView('carrier');
            }
          }}
          initialTab={authModalInitialTab}
          onNavigateToCarrierPortal={() => setCurrentView('carrier')}
        />

        {/* ADD MENU & STORES BY SPECIALIZATION MODAL */}
        <AddMenuModal
          isOpen={isAddMenuModalOpen}
          onClose={() => setIsAddMenuModalOpen(false)}
          stores={storesList}
          onAddProductToStore={handleAddProductToStore}
          onAddNewStore={handleAddNewStore}
        />

        {/* TOAST NOTIFICATION WITH STORE SPECIAL OFFER */}
        <ToastNotification
          toast={activeToast}
          onClose={() => setActiveToast(null)}
          onViewCart={() => setCurrentView('cart')}
          onAddPromoProduct={handleAddPromoFromToast}
        />

      </div>
    </div>
  );
}
