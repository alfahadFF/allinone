export type Category = {
  id: string;
  title: string;
  iconName: string;
  color: string;
  description?: string;
};

export type ProductOption = {
  id: string;
  name: string;
  priceDelta: number;
};

export type ProductAddon = {
  id: string;
  name: string;
  price: number;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  categoryTag?: string;
  calories?: number;
  popular?: boolean;
  options?: ProductOption[];
  addons?: ProductAddon[];
};

export type Store = {
  id: number;
  name: string;
  nameEn?: string;
  type: string; // 'restaurants' | 'groceries' | 'pharmacy' | 'family' | 'flowers' | 'coffee' | 'bakeries' | 'butchery'
  rating: number;
  reviews: string;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  tags: string[];
  image: string;
  coverImage: string;
  discountBadge?: string;
  isPopular?: boolean;
  isOpen?: boolean;
  products: Product[];
};

export type CartItem = {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedOption?: ProductOption;
  selectedAddons?: ProductAddon[];
  specialInstructions?: string;
  itemPrice: number;
};

export type Address = {
  id: string;
  title: string;
  type: 'home' | 'work' | 'family';
  district: string;
  street: string;
  details: string;
  isDefault?: boolean;
};

export type Coupon = {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minSpend: number;
  description: string;
};

export type OrderReview = {
  rating: number; // 1 to 5
  comment: string;
  ratedAt: string;
  deliveryRating?: number;
  tags?: string[];
};

export type Order = {
  id: string;
  orderNumber: string;
  store: Store;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  serviceFee: number;
  tip: number;
  total: number;
  address: Address;
  paymentMethod: string;
  status: 'received' | 'preparing' | 'on_the_way' | 'delivered';
  createdAt: string;
  estimatedDeliveryMinutes: number;
  driver?: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    avatar: string;
  };
  review?: OrderReview;
};

export type FamilyBundle = {
  id: string;
  title: string;
  subtitle: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
  itemsCount: number;
  description: string;
  items: { name: string; quantity: string; image: string }[];
};

export type CarrierProfile = {
  vehicleType: 'motorcycle' | 'bicycle' | 'car' | 'van';
  vehiclePlate?: string;
  workingZones: string[];
  maxDistanceKm: number;
  currentZone: string;
  isAvailable: boolean;
  deliveriesCount: number;
  rating: number;
  earningsToday: number;
  nationalIdOrLicense?: string;
};

export type CarrierOrder = {
  id: string;
  orderNumber: string;
  storeName: string;
  storeCategory: string;
  storeArea: string;
  deliveryArea: string;
  distanceKm: number;
  deliveryFeeEarnings: number;
  totalOrderValue: number;
  itemCount: number;
  itemsSummary: string;
  status: 'available' | 'accepted' | 'picked_up' | 'delivered';
  customerName: string;
  customerPhone: string;
  createdAtMinutesAgo: number;
  estimatedDeliveryMin: number;
  specialInstructions?: string;
};

export type UserAccount = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  role: 'customer' | 'partner' | 'carrier' | 'driver';
  storeName?: string;
  carrierProfile?: CarrierProfile;
};

