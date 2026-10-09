import React, { useState, useMemo } from 'react';
import { Search, X, Star, Clock, Bike, Plus, ShoppingBag } from 'lucide-react';
import { stores } from '../data';
import { Store, Product } from '../types';

interface SearchViewProps {
  onSelectStore: (store: Store) => void;
  onSelectProduct: (product: Product, store: Store) => void;
  onClose: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onSelectStore,
  onSelectProduct,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const popularTags = [
    'شاورما أنس',
    'سيتامول فورت',
    'كباب ومشاوي',
    'حليب نان 3',
    'مياه بقين',
    'حفاضات كانبيبي',
    'برازق شامية',
    'بن الحموي',
    'متة تارغوي',
    'زيت زيتون بلدي',
  ];

  // Search logic
  const searchResults = useMemo(() => {
    if (!query.trim()) return { stores: [], products: [] };
    const q = query.trim().toLowerCase();

    const matchingStores = stores.filter((s) => {
      const matchType = filterType === 'all' || s.type === filterType;
      const matchText =
        s.name.toLowerCase().includes(q) ||
        (s.nameEn && s.nameEn.toLowerCase().includes(q)) ||
        s.tags.some((t) => t.toLowerCase().includes(q));
      return matchType && matchText;
    });

    const matchingProducts: { product: Product; store: Store }[] = [];
    stores.forEach((s) => {
      if (filterType !== 'all' && s.type !== filterType) return;
      s.products.forEach((p) => {
        if (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.categoryTag && p.categoryTag.toLowerCase().includes(q))
        ) {
          matchingProducts.push({ product: p, store: s });
        }
      });
    });

    return { stores: matchingStores, products: matchingProducts };
  }, [query, filterType]);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
      {/* Top Search Bar */}
      <div className="bg-white p-4 border-b border-gray-100 shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن وجبة، منتج، صيدلية، سوبرماركت في سوريا..."
              className="w-full bg-gray-100 text-xs text-gray-900 rounded-xl ps-10 pe-9 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-600 hover:text-orange-600 px-2 py-2"
          >
            إلغاء
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-3 text-xs">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'restaurants', label: 'مطاعم' },
            { id: 'groceries', label: 'سوبرماركت ومؤونة' },
            { id: 'pharmacy', label: 'صيدليات' },
            { id: 'family', label: 'العائلة والطفل' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                filterType === f.id
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 hide-scrollbar">
        {!query.trim() ? (
          <div>
            <h3 className="font-bold text-xs text-gray-700 mb-2.5">عمليات البحث الشائعة</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(tag)}
                  className="bg-white border border-gray-200 hover:border-orange-500 text-gray-700 hover:text-orange-600 text-xs font-medium px-3.5 py-2 rounded-xl transition-all shadow-2xs"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-8 text-center text-gray-400 py-6">
              <ShoppingBag size={48} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">ابحث في آلاف المتاجر والمطاعم والصيدليات المتوفرة بدمشق ومحيطها</p>
            </div>
          </div>
        ) : searchResults.stores.length === 0 && searchResults.products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm font-bold text-gray-600 mb-1">لم نجد نتائج مطابقة لـ "{query}"</p>
            <p className="text-xs text-gray-400">تأكد من كتابة الكلمة بشكل صحيح أو جرب البحث بكلمة أخرى.</p>
          </div>
        ) : (
          <>
            {/* Matching Stores */}
            {searchResults.stores.length > 0 && (
              <div>
                <h3 className="font-bold text-xs text-gray-700 mb-3">
                  المتاجر ({searchResults.stores.length})
                </h3>
                <div className="space-y-2.5">
                  {searchResults.stores.map((store) => (
                    <div
                      key={store.id}
                      onClick={() => onSelectStore(store)}
                      className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3 cursor-pointer hover:border-orange-200 transition-all active:scale-[0.99]"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                        <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-gray-900 truncate">{store.name}</h4>
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            {store.rating}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{store.tags.join(' • ')}</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="text-orange-500" />
                            {store.deliveryTime} دقيقة
                          </span>
                          <span className="flex items-center gap-1">
                            <Bike size={11} className="text-orange-500" />
                            {store.deliveryFee === 0 ? 'توصيل مجاني' : `${store.deliveryFee.toLocaleString()} ل.س`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Products */}
            {searchResults.products.length > 0 && (
              <div className="pt-2">
                <h3 className="font-bold text-xs text-gray-700 mb-3">
                  الأصناف والمنتجات ({searchResults.products.length})
                </h3>
                <div className="space-y-2.5">
                  {searchResults.products.map(({ product, store }) => (
                    <div
                      key={`${store.id}-${product.id}`}
                      className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3 justify-between"
                    >
                      <div
                        onClick={() => onSelectProduct(product, store)}
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-orange-600 font-bold block truncate">
                            من {store.name}
                          </span>
                          <h4 className="font-bold text-xs text-gray-900 truncate mt-0.5">
                            {product.name}
                          </h4>
                          <span className="text-xs font-black text-gray-900 mt-1 block">
                            {product.price.toLocaleString()} ل.س
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectProduct(product, store)}
                        className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-all shrink-0 active:scale-90 border border-orange-200"
                        title="إضافة"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
