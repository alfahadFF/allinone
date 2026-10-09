# توثيق مخطط قاعدة البيانات الشامل (Database Schema Architecture)
## منصة توصيل سوريا (Tawseel Syria Delivery Platform)

هذا الملف يحتوي على التصميم الكامل والمهيكل لقواعد البيانات العلائقية (Relational Database) المتوافقة مع **PostgreSQL / Cloud SQL / MySQL**، بما يغطي كافة متطلبات النظام: المستخدمين، المتاجر، المنتجات، المنيو، السلة، الطلبات، تتبع الـ GPS، تقييمات العملاء، **تسجيل وبوابة الناقلين الأحرار وتوزيع الطلبات وفق المسافة**، والمحافظ والدفع الإلكتروني السوري (سيريتل كاش، MTN كاش، والدفع عند الاستلام).

---

## فهرس الجداول (Tables Index)

1. `users` — الحسابات والمستخدمون (عملاء، ناقلون أحرار، شركاء متاجر، إداريون)
2. `user_addresses` — عناوين التوصيل للعملاء في دمشق والمحافظات
3. `store_categories` — تصنيفات المتاجر والأنشطة (مطاعم، سوبرماركت، صيدليات...)
4. `stores` — المتاجر والمطاعم والصيدليات الشريكة
5. `menu_categories` — تصنيفات وأقسام المنيو داخل كل متجر
6. `products` — المنتجات والوجبات والأصناف
7. `product_options` — الخيارات الأساسية للمنتج (حجم، نوع الخبز...)
8. `product_addons` — الإضافات الاختيارية للمنتج (جبنة، صوص، بطاطا...)
9. `family_bundles` — باقات مؤونة العائلة والطفل الأسبوعية
10. `carrier_profiles` — ملفات عمال التوصيل الأحرار (الناقلين المستقلين)
11. `delivery_zones` — مناطق وأحياء التوصيل المعتمدة ومعدلات الرسوم
12. `carrier_working_zones` — أحياء العمل المختارة للناقل الحر
13. `coupons` — كوبونات وقسائم الخصم والعروض الترويجية
14. `orders` — الطلبات الرئيسية ودورة حياة التوصيل
15. `order_items` — أصناف وعناصر الطلب
16. `order_item_addons` — إضافات أصناف الطلب المنفذة
17. `order_reviews` — تقييمات العملاء وتجارب الطلب والتوصيل
18. `wallets` — المحافظ المالية الرقمية (للعميل والناقل والمتجر)
19. `wallet_transactions` — سجل الحركات المالية والشحن وسحب الأرباح
20. `order_tracking_events` — سجل التتبع الحي لنقاط ومسار الكابتن

---

## 1. جدول الحسابات والمستخدمين (`users`)
يخزن الحسابات لجميع أطراف النظام (العميل، الكابتن الحر، صاحب المتجر).

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | المعرف الفريد للمستخدم |
| `full_name` | `VARCHAR(150)` | NOT NULL | الاسم الكامل الثلاثي |
| `phone` | `VARCHAR(20)` | NOT NULL, UNIQUE | رقم الموبايل السوري (+963xxxxxxxxx) |
| `email` | `VARCHAR(150)` | UNIQUE, NULL | البريد الإلكتروني (اختياري) |
| `password_hash` | `VARCHAR(255)` | NOT NULL | تشفير كلمة المرور (bcrypt / argon2) |
| `city` | `VARCHAR(50)` | NOT NULL, DEFAULT 'دمشق' | المدينة / المحافظة |
| `role` | `VARCHAR(20)` | NOT NULL, CHECK in ('customer', 'carrier', 'partner', 'admin') | الدور والصلاحية في النظام |
| `avatar_url` | `VARCHAR(500)` | NULL | رابط الصورة الشخصية |
| `is_phone_verified`| `BOOLEAN` | DEFAULT FALSE | حالة التحقق من رقم الهاتف عبر SMS |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | حالة تنشيط الحساب |
| `created_at` | `TIMESTAMPTZ` | DEFAULT CURRENT_TIMESTAMP | تاريخ الإنشاء |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT CURRENT_TIMESTAMP | تاريخ آخر تعديل |

---

## 2. جدول عناوين التوصيل (`user_addresses`)
يخزن العناوين المحفوظة لكل عميل لتسريع عملية الطلب.

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | المعرف الفريد للعنوان |
| `user_id` | `UUID` | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | معرف العميل صاحب العنوان |
| `title` | `VARCHAR(80)` | NOT NULL | اسم العنوان (البيت، العمل، بيت العائلة) |
| `type` | `VARCHAR(20)` | NOT NULL, CHECK in ('home', 'work', 'family', 'other') | نوع العنوان |
| `city` | `VARCHAR(50)` | NOT NULL, DEFAULT 'دمشق' | المدينة |
| `district` | `VARCHAR(100)` | NOT NULL | الحي / المنطقة (المزة، الشعلان، الميدان) |
| `street` | `VARCHAR(150)` | NOT NULL | اسم الشارع أو الحارة |
| `details` | `TEXT` | NOT NULL | تفاصيل البناء، الطابق، علامة مميزة |
| `latitude` | `DECIMAL(10, 8)` | NULL | خط العرض الجغرافي (GPS) |
| `longitude` | `DECIMAL(11, 8)` | NULL | خط الطول الجغرافي (GPS) |
| `is_default` | `BOOLEAN` | DEFAULT FALSE | هل هو العنوان الافتراضي |
| `created_at` | `TIMESTAMPTZ` | DEFAULT CURRENT_TIMESTAMP | تاريخ الإضافة |

---

## 3. جدول تصنيفات المتاجر (`store_categories`)
الأقسام الرئيسية في التطبيق (مطاعم، سوبرماركت، صيدليات...).

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | PRIMARY KEY | المعرف البرمجي (restaurants, groceries, pharmacy...) |
| `title_ar` | `VARCHAR(100)` | NOT NULL | الاسم بالعربية (مطاعم ومشاوي، سوبرماركت...) |
| `title_en` | `VARCHAR(100)` | NULL | الاسم بالإنجليزية |
| `icon_name` | `VARCHAR(50)` | NOT NULL | اسم الأيقونة البرمجية |
| `color_classes` | `VARCHAR(100)` | NULL | فئات ألوان التمييز في واجهة المستخدم |
| `display_order` | `INT` | DEFAULT 0 | ترتيب العرض في الصفحة الرئيسية |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | التفعيل في واجهة التطبيق |

---

## 4. جدول المتاجر والشركاء (`stores`)
بيانات المتاجر والمطاعم ومواقعها الجغرافية لحساب المسافات.

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | PRIMARY KEY | المعرف الرقمي للمتجر |
| `owner_user_id` | `UUID` | NULL, REFERENCES users(id) ON DELETE SET NULL | حساب التاجر الشريك |
| `category_id` | `VARCHAR(50)` | NOT NULL, REFERENCES store_categories(id) | نوع النشاط والتصنيف |
| `name` | `VARCHAR(150)` | NOT NULL | اسم المتجر بالعربية |
| `name_en` | `VARCHAR(150)` | NULL | اسم المتجر بالإنجليزية |
| `description` | `TEXT` | NULL | نبذة عن المتجر |
| `image_url` | `VARCHAR(500)` | NOT NULL | رابط شعار / صورة المتجر المربعة |
| `cover_url` | `VARCHAR(500)` | NOT NULL | رابط صورة الغلاف العريضة |
| `city` | `VARCHAR(50)` | NOT NULL, DEFAULT 'دمشق' | المدينة |
| `district` | `VARCHAR(100)` | NOT NULL | الحي (الشعلان، المزة، الميدان...) |
| `address_details`| `TEXT` | NOT NULL | العنوان التفصيلي |
| `latitude` | `DECIMAL(10, 8)` | NOT NULL | خط العرض لحساب المسافة الدقيقة |
| `longitude` | `DECIMAL(11, 8)` | NOT NULL | خط الطول لحساب المسافة الدقيقة |
| `phone` | `VARCHAR(20)` | NOT NULL | هاتف التواصل المباشر |
| `delivery_fee` | `DECIMAL(12, 2)` | NOT NULL, DEFAULT 0.00 | رسوم التوصيل الأساسية (ل.س) |
| `min_order` | `DECIMAL(12, 2)` | NOT NULL, DEFAULT 0.00 | الحد الأدنى للطلب (ل.س) |
| `delivery_time` | `VARCHAR(30)` | NOT NULL, DEFAULT '20-30 دقيقة' | الوقت التقديري للتوصيل |
| `rating` | `DECIMAL(3, 2)` | DEFAULT 5.00 | متوسط تقييم المتجر |
| `reviews_count` | `INT` | DEFAULT 0 | إجمالي عدد التقييمات |
| `tags` | `TEXT[]` | NULL | وسوم التصفية (سريع، شاورما، عائلي...) |
| `discount_badge` | `VARCHAR(80)` | NULL | شارة العرض الخاص (خصم 20%، توصيل مجاني) |
| `is_popular` | `BOOLEAN` | DEFAULT FALSE | متجر مميز / رائج |
| `is_open` | `BOOLEAN` | DEFAULT TRUE | هل المتجر مفتوح ومستعد لتلقي الطلبات |
| `created_at` | `TIMESTAMPTZ` | DEFAULT CURRENT_TIMESTAMP | تاريخ الإضافة |

---

## 5. جدول أقسام المنيو الداخلية للمتجر (`menu_categories`)
تقسيم وجبات المتجر (مثال: برغر، وجبات شاورما، مقبلات، مشروبات).

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | المعرف الفريد للقسم |
| `store_id` | `BIGINT` | NOT NULL, REFERENCES stores(id) ON DELETE CASCADE | المتجر التابع له |
| `name` | `VARCHAR(100)` | NOT NULL | اسم القسم (سندويش، غربي، مشافي...) |
| `display_order` | `INT` | DEFAULT 0 | ترتيب العرض في شريط المتجر |

---

## 6. جدول المنتجات والوجبات (`products`)
قائمة الوجبات والمنتجات والأسعار بالليرة السورية.

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | PRIMARY KEY | المعرف الرقمي للمنتج |
| `store_id` | `BIGINT` | NOT NULL, REFERENCES stores(id) ON DELETE CASCADE | المتجر صاحب المنتج |
| `menu_category_id`| `UUID` | NULL, REFERENCES menu_categories(id) ON DELETE SET NULL | القسم الداخلي للمنيو |
| `name` | `VARCHAR(200)` | NOT NULL | اسم الوجبة أو الصنف |
| `description` | `TEXT` | NOT NULL | المكونات والوصف |
| `price` | `DECIMAL(12, 2)` | NOT NULL | السعر الفعلي (بالليرة السورية SYP) |
| `original_price` | `DECIMAL(12, 2)` | NULL | السعر الأصلي قبل الخصم (إن وجد) |
| `image_url` | `VARCHAR(500)` | NOT NULL | رابط صورة الوجبة |
| `category_tag` | `VARCHAR(100)` | NULL | وسم التصنيف السريع |
| `calories` | `INT` | NULL | السعرات الحرارية التقديرية |
| `is_popular` | `BOOLEAN` | DEFAULT FALSE | صنف مميز / الأكثر طلباً |
| `is_available` | `BOOLEAN` | DEFAULT TRUE | متوفر للطلب حالياً في المتجر |
| `created_at` | `TIMESTAMPTZ` | DEFAULT CURRENT_TIMESTAMP | تاريخ الإضافة |

---

## 7. جدول خيارات المنتجات (`product_options`)
الخيارات الأساسية الإجبارية أو الفردية (مثال: حجم كبير، عادي، نوع الخبز).

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | معرف الخيار |
| `product_id` | `BIGINT` | NOT NULL, REFERENCES products(id) ON DELETE CASCADE | المنتج التابع له |
| `name` | `VARCHAR(100)` | NOT NULL | اسم الخيار (وجبة دبل، حجم عائلي) |
| `price_delta` | `DECIMAL(12, 2)` | DEFAULT 0.00 | الفارق في السعر (+15,000 ل.س) |
| `is_default` | `BOOLEAN` | DEFAULT FALSE | هل هو الخيار المختار تلقائياً |

---

## 8. جدول إضافات المنتجات (`product_addons`)
الإضافات الجانبية المتعددة (جبنة قشقوان، متومة اكسترا، صوص حار...).

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | معرف الإضافة |
| `product_id` | `BIGINT` | NOT NULL, REFERENCES products(id) ON DELETE CASCADE | المنتج التابع له |
| `name` | `VARCHAR(100)` | NOT NULL | اسم الإضافة (جبنة موزاريلا، بطاطا مقلية) |
| `price` | `DECIMAL(12, 2)` | NOT NULL, DEFAULT 0.00 | سعر الإضافة بالليرة السورية |
| `is_available` | `BOOLEAN` | DEFAULT TRUE | التوفر |

---

## 9. جدول باقات مؤونة العائلة والطفل (`family_bundles`)
العروض الكبيرة الموفرة للعائلات السورية.

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | PRIMARY KEY | معرف الباقة (f-bundle-1, f-bundle-2) |
| `title` | `VARCHAR(200)` | NOT NULL | عنوان الباقة (سلة الفطور الشامي، حزمة الطفل) |
| `subtitle` | `VARCHAR(250)` | NOT NULL | الوصف التعريفي المقتضب |
| `original_price` | `DECIMAL(12, 2)` | NOT NULL | السعر قبل الخصم |
| `discounted_price`| `DECIMAL(12, 2)` | NOT NULL | السعر النهائي التوفيري للعائلة |
| `image_url` | `VARCHAR(500)` | NOT NULL | صورة الباقة |
| `items_count` | `INT` | NOT NULL | عدد الأصناف المشمولة |
| `description` | `TEXT` | NOT NULL | الشرح الكامل لمحتويات السلة |
| `items_json` | `JSONB` | NOT NULL | تفاصيل الأصناف وكمياتها |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | تفعيل العرض |

---

## 10. جدول ملفات الناقلين الأحرار (`carrier_profiles`)
**مخصص لعمال التوصيل الذين يعملون بشكل حر ومستقل**، يحتوي على بيانات المركبة وموقع الانتظار ونطاق المسافة الأقصى.

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | المعرف الفريد للناقل |
| `user_id` | `UUID` | NOT NULL, UNIQUE, REFERENCES users(id) ON DELETE CASCADE | ارتباط بحساب المستخدم |
| `vehicle_type` | `VARCHAR(30)` | NOT NULL, CHECK in ('motorcycle', 'bicycle', 'car', 'van') | نوع وسيلة النقل (دراجة نارية، سيارة، فان) |
| `vehicle_plate` | `VARCHAR(50)` | NOT NULL | رقم لوحة المركبة أو وثيقة السير |
| `national_id` | `VARCHAR(50)` | NOT NULL | الرقم الوطني السوري / رخصة القيادة |
| `current_zone` | `VARCHAR(100)` | NOT NULL, DEFAULT 'دمشق - الشعلان والمركز' | موقع الانتظار والانطلاق الحالي |
| `current_latitude`| `DECIMAL(10, 8)` | NULL | خط العرض الحالي للكابتن (GPS حي) |
| `current_longitude`| `DECIMAL(11, 8)` | NULL | خط الطول الحالي للكابتن (GPS حي) |
| `max_distance_km`| `DECIMAL(4, 1)` | NOT NULL, DEFAULT 8.0 | **أقصى مسافة مفضلة للتوصيل (وفق المسافة)** |
| `is_online` | `BOOLEAN` | DEFAULT TRUE | متاح للعمل الآن 🟢 / استراحة ⚪ |
| `rating` | `DECIMAL(3, 2)` | DEFAULT 5.00 | تقييم أداء الكابتن (من 5) |
| `deliveries_completed`| `INT` | DEFAULT 0 | إجمالي المشاوير المكتملة بنجاح |
| `today_earnings` | `DECIMAL(14, 2)` | DEFAULT 0.00 | إجمالي أرباح التوصيل لليوم الحالي (ل.س) |
| `total_earnings` | `DECIMAL(14, 2)` | DEFAULT 0.00 | إجمالي الأرباح التاريخية للناقل الحر |
| `created_at` | `TIMESTAMPTZ` | DEFAULT CURRENT_TIMESTAMP | تاريخ الانضمام |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT CURRENT_TIMESTAMP | تاريخ آخر تحديث للحالة |

---

## 11. جدول مناطق وأحياء التوصيل المعتمدة (`delivery_zones`)
الأحياء المغطاة في دمشق وريفها وأجور التوصيل المرجعية.

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | PRIMARY KEY | معرف الحي |
| `city` | `VARCHAR(50)` | NOT NULL, DEFAULT 'دمشق' | المدينة |
| `zone_name` | `VARCHAR(100)` | NOT NULL, UNIQUE | اسم الحي (المزة، الشعلان، الميدان، القصاع...) |
| `base_fee` | `DECIMAL(12, 2)` | NOT NULL, DEFAULT 12000.00 | أجر التوصيل المعياري للحي (ل.س) |
| `center_latitude`| `DECIMAL(10, 8)` | NOT NULL | الإحداثي المرجعي للحي |
| `center_longitude`| `DECIMAL(11, 8)` | NOT NULL | الإحداثي المرجعي للحي |
| `is_covered` | `BOOLEAN` | DEFAULT TRUE | هل المنطقة مشمولة بالتغطية حالياً |

---

## 12. جدول أحياء عمل الناقل الحر (`carrier_working_zones`)
جدول ربط (Many-to-Many) بين الناقل الحر والأحياء التي يفضل العمل بها.

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `carrier_id` | `UUID` | NOT NULL, REFERENCES carrier_profiles(id) ON DELETE CASCADE | معرف الناقل |
| `zone_id` | `INT` | NOT NULL, REFERENCES delivery_zones(id) ON DELETE CASCADE | معرف منطقة العمل |
| PRIMARY KEY | `(carrier_id, zone_id)` | | مفتاح مركب لمنع التكرار |

---

## 13. جدول الكوبونات والعروض (`coupons`)
أكواد الخصم الترويجية السورية.

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `code` | `VARCHAR(50)` | PRIMARY KEY | كود الخصم (SHAM20, YASMEEN, TAWSEEL_FREE) |
| `description` | `VARCHAR(250)` | NOT NULL | وصف العرض (خصم 20%، توصيل مجاني) |
| `discount_percent`| `DECIMAL(5, 2)` | NULL | نسبة الخصم المئوية (مثل 20.00%) |
| `discount_amount` | `DECIMAL(12, 2)` | NULL | مبلغ الخصم الثابت بالليرة السورية |
| `min_spend` | `DECIMAL(12, 2)` | NOT NULL, DEFAULT 0.00 | الحد الأدنى لقيمة الطلب لتطبيق الكود |
| `max_discount_cap`| `DECIMAL(12, 2)` | NULL | سقف الخصم الأقصى |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | صلاحية الكوبون |
| `expires_at` | `TIMESTAMPTZ` | NULL | تاريخ انتهاء الصلاحية |

---

## 14. جدول الطلبات الرئيسية (`orders`)
الجدول المحوري الذي يربط العميل والمتجر والناقل الحر ويسجل تفاصيل الحسابات والمسافة وحالة التوصيل.

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | المعرف الفريد للطلب |
| `order_number` | `VARCHAR(50)` | NOT NULL, UNIQUE | رقم الطلب الظاهر (مثال: #SYR-90412) |
| `customer_id` | `UUID` | NOT NULL, REFERENCES users(id) | العميل صاحب الطلب |
| `store_id` | `BIGINT` | NOT NULL, REFERENCES stores(id) | المتجر المطلوب منه |
| `carrier_id` | `UUID` | NULL, REFERENCES carrier_profiles(id) | **الناقل الحر المستلم للطلب** |
| `address_id` | `UUID` | NOT NULL, REFERENCES user_addresses(id) | عنوان التوصيل المحدد للعميل |
| `subtotal` | `DECIMAL(12, 2)` | NOT NULL | مجموع أصناف الطلب (ل.س) |
| `delivery_fee` | `DECIMAL(12, 2)` | NOT NULL | رسوم التوصيل الإجمالية (ل.س) |
| `carrier_earning`| `DECIMAL(12, 2)` | NOT NULL | **صافي أجر الناقل الحر المستحق عن المشوار** |
| `service_fee` | `DECIMAL(12, 2)` | NOT NULL, DEFAULT 5000.00 | رسوم خدمة التطبيق |
| `discount_amount`| `DECIMAL(12, 2)` | DEFAULT 0.00 | قيمة الخصم المطبق |
| `coupon_code` | `VARCHAR(50)` | NULL, REFERENCES coupons(code) | كود الخصم المستخدم إن وجد |
| `driver_tip` | `DECIMAL(12, 2)` | DEFAULT 0.00 | إكرامية كابتن التوصيل (100% للناقل) |
| `total_amount` | `DECIMAL(12, 2)` | NOT NULL | المبلغ الإجمالي النهائي المطلوب دفعه |
| `payment_method` | `VARCHAR(40)` | NOT NULL, CHECK in ('cash', 'syriatel', 'mtn', 'wallet', 'card') | طريقة الدفع المعتمدة في سوريا |
| `payment_status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending', CHECK in ('pending', 'paid', 'refunded') | حالة الدفع المالي |
| `status` | `VARCHAR(30)` | NOT NULL, DEFAULT 'received', CHECK in ('received', 'preparing', 'on_the_way', 'delivered', 'cancelled') | **حالة الطلب ومراحل شريط التقدم التفاعلي** |
| `distance_km` | `DECIMAL(5, 2)` | NOT NULL | **المسافة التقديرية بالكيلومتر بين المتجر والعميل** |
| `estimated_minutes`| `INT` | NOT NULL, DEFAULT 25 | الوقت التقديري للتوصيل بالدقائق |
| `special_instructions`| `TEXT` | NULL | ملاحظات العميل (مثال: بدون بصل، الطابق 3) |
| `accepted_at` | `TIMESTAMPTZ` | NULL | وقت قبول الناقل للطلب |
| `picked_up_at` | `TIMESTAMPTZ` | NULL | وقت استلام الناقل للطلب من المتجر |
| `delivered_at` | `TIMESTAMPTZ` | NULL | وقت تسليم الطلب النهائي للعميل |
| `created_at` | `TIMESTAMPTZ` | DEFAULT CURRENT_TIMESTAMP | تاريخ ووقت إنشاء الطلب |

---

## 15. جدول عناصر الطلب (`order_items`)
الأصناف المشتراة داخل كل طلب.

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | معرف العنصر |
| `order_id` | `UUID` | NOT NULL, REFERENCES orders(id) ON DELETE CASCADE | الطلب التابع له |
| `product_id` | `BIGINT` | NOT NULL, REFERENCES products(id) | المنتج المشترى |
| `product_name` | `VARCHAR(200)` | NOT NULL | حفظ اسم المنتج في لحظة الشراء |
| `quantity` | `INT` | NOT NULL, CHECK (quantity > 0) | الكمية المطلوبة |
| `unit_price` | `DECIMAL(12, 2)` | NOT NULL | سعر الوحدة في لحظة الشراء |
| `total_price` | `DECIMAL(12, 2)` | NOT NULL | إجمالي سعر العنصر (الكمية × السعر) |
| `selected_option_id`| `UUID` | NULL, REFERENCES product_options(id) | الخيار المحدد للوجبة (إن وجد) |
| `selected_option_name`| `VARCHAR(100)` | NULL | نص الخيار المحدد |
| `special_notes` | `TEXT` | NULL | تعليمات خاصة بهذا الصنف |

---

## 16. جدول إضافات عناصر الطلب (`order_item_addons`)
الإضافات المنفذة مع وجبات الطلب (جبنة إضافية، صوص...).

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | معرف الإضافة في الطلب |
| `order_item_id` | `UUID` | NOT NULL, REFERENCES order_items(id) ON DELETE CASCADE | عنصر الطلب التابع له |
| `addon_id` | `UUID` | NOT NULL, REFERENCES product_addons(id) | الإضافة المحددة |
| `addon_name` | `VARCHAR(100)` | NOT NULL | اسم الإضافة لحظة الطلب |
| `price` | `DECIMAL(12, 2)` | NOT NULL | سعر الإضافة المنفذ |

---

## 17. جدول تقييمات الطلب وتجربة التوصيل (`order_reviews`)
**ميزة تقييم تجربة الطلب بعد تسليمه** بالنجوم والملاحظة وتقييم المتجر والكابتن.

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | معرف التقييم |
| `order_id` | `UUID` | NOT NULL, UNIQUE, REFERENCES orders(id) ON DELETE CASCADE | الطلب المقيم (تقييم واحد لكل طلب) |
| `customer_id` | `UUID` | NOT NULL, REFERENCES users(id) | العميل صاحب التقييم |
| `store_id` | `BIGINT` | NOT NULL, REFERENCES stores(id) | المتجر المقيم |
| `carrier_id` | `UUID` | NULL, REFERENCES carrier_profiles(id) | الناقل المقيم |
| `rating` | `SMALLINT` | NOT NULL, CHECK (rating BETWEEN 1 AND 5) | التقييم العام بالنجوم (1 إلى 5) |
| `delivery_rating`| `SMALLINT` | NULL, CHECK (delivery_rating BETWEEN 1 AND 5) | تقييم سرعة وتجربة كابتن التوصيل |
| `comment` | `TEXT` | NOT NULL | ملاحظة ورأي العميل |
| `tags` | `TEXT[]` | NULL | وسوم التقييم (توصيل سريع، ساخن، تغليف ممتاز) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT CURRENT_TIMESTAMP | تاريخ إرسال التقييم |

---

## 18. جدول المحافظ الرقمية (`wallets`)
محفظة الرصيد الإلكتروني داخل التطبيق (للعملاء لشحن الرصيد، وللناقلين لتجميع الأجور).

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | معرف المحفظة |
| `user_id` | `UUID` | NOT NULL, UNIQUE, REFERENCES users(id) ON DELETE CASCADE | صاحب المحفظة |
| `balance` | `DECIMAL(14, 2)` | NOT NULL, DEFAULT 0.00 | الرصيد الحالي بالليرة السورية (ل.س) |
| `currency` | `VARCHAR(10)` | NOT NULL, DEFAULT 'SYP' | العملة (ليرة سورية) |
| `is_frozen` | `BOOLEAN` | DEFAULT FALSE | حالة تجميد الحساب المالي لأسباب أمنية |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT CURRENT_TIMESTAMP | تاريخ آخر حركة |

---

## 19. جدول الحركات المالية للمحفظة (`wallet_transactions`)
سجل عمليات شحن المحفظة وسحب الأجر المالي للناقل ودفع قيمة الطلبات.

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT gen_random_uuid() | معرف الحركة |
| `wallet_id` | `UUID` | NOT NULL, REFERENCES wallets(id) ON DELETE CASCADE | المحفظة التابعة لها |
| `order_id` | `UUID` | NULL, REFERENCES orders(id) | الطلب المرتبط بالحركة إن وجد |
| `type` | `VARCHAR(30)` | NOT NULL, CHECK in ('deposit', 'order_payment', 'carrier_earning', 'withdrawal', 'refund') | نوع الحركة المالية |
| `amount` | `DECIMAL(14, 2)` | NOT NULL | قيمة الحركة بالليرة السورية |
| `channel` | `VARCHAR(40)` | NOT NULL, CHECK in ('syriatel_cash', 'mtn_cash', 'bemo_bank', 'app_balance', 'cash') | القناة المالية المستخدمة في سوريا |
| `reference_number`| `VARCHAR(100)` | NULL | رقم إشعار التحويل البنكي أو كود سيريتل كاش |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'completed', CHECK in ('pending', 'completed', 'failed') | حالة تنفيذ الحركة |
| `created_at` | `TIMESTAMPTZ` | DEFAULT CURRENT_TIMESTAMP | وقت العملية |

---

## 20. جدول تتبع المسار الميداني للكابتن (`order_tracking_events`)
يخزن إحداثيات وموقع كابتن التوصيل أثناء رحلته لتغذية خريطة التتبع الحية ومحاكاة الـ GPS.

| اسم العمود (Column) | النوع (Data Type) | القيود (Constraints) | الوصف (Description) |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | PRIMARY KEY | معرف سجل التتبع |
| `order_id` | `UUID` | NOT NULL, REFERENCES orders(id) ON DELETE CASCADE | الطلب المتتبع |
| `carrier_id` | `UUID` | NOT NULL, REFERENCES carrier_profiles(id) | الناقل المنفذ للمشوار |
| `latitude` | `DECIMAL(10, 8)` | NOT NULL | خط العرض للكابتن لحظياً |
| `longitude` | `DECIMAL(11, 8)` | NOT NULL | خط الطول للكابتن لحظياً |
| `status_label` | `VARCHAR(50)` | NOT NULL | مرحلة التتبع (استلام من المتجر، في الطريق...) |
| `recorded_at` | `TIMESTAMPTZ` | DEFAULT CURRENT_TIMESTAMP | التوقيت الزمني الدقيق للنقطة |

---

## الفهارس الموصى بها لتسريع الاستعلامات والبحث وفق المسافة (Database Indexes)

```sql
-- 1. فهرسة سريعة للبحث عن المتاجر حسب التصنيف والحالة
CREATE INDEX idx_stores_category_open ON stores(category_id, is_open);
CREATE INDEX idx_stores_district ON stores(district);

-- 2. فهرسة حساب المسافات الجغرافية للمتاجر والناقلين
CREATE INDEX idx_stores_coords ON stores(latitude, longitude);
CREATE INDEX idx_carrier_coords ON carrier_profiles(current_latitude, current_longitude) WHERE is_online = TRUE;

-- 3. فهرسة الطلبات المتاحة للناقلين الأحرار وفق المسافة والحالة
CREATE INDEX idx_orders_status_distance ON orders(status, distance_km) WHERE status = 'received';
CREATE INDEX idx_orders_customer ON orders(customer_id, created_at DESC);
CREATE INDEX idx_orders_carrier ON orders(carrier_id, status);

-- 4. فهرسة فلترة المنتجات حسب السعر والمتجر (لدعم شريط التمرير Price Slider)
CREATE INDEX idx_products_store_price ON products(store_id, price ASC);

-- 5. فهرسة تقييمات المتاجر والناقلين
CREATE INDEX idx_order_reviews_store ON order_reviews(store_id);
CREATE INDEX idx_order_reviews_carrier ON order_reviews(carrier_id);
```

---

## كود إنشاء الجداول الكامل بصيغة SQL جاهز للتنفيذ (DDL SQL Script)

يمكن نسخ وتشغيل الكود التالي مباشرة في أي قاعدة بيانات **PostgreSQL**:

```sql
-- تفعيل ملحق UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. جدول المستخدمين
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    city VARCHAR(50) NOT NULL DEFAULT 'دمشق',
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'carrier', 'partner', 'admin')),
    avatar_url VARCHAR(500),
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. جدول عناوين التوصيل
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(80) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('home', 'work', 'family', 'other')),
    city VARCHAR(50) NOT NULL DEFAULT 'دمشق',
    district VARCHAR(100) NOT NULL,
    street VARCHAR(150) NOT NULL,
    details TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. تصنيفات المتاجر
CREATE TABLE store_categories (
    id VARCHAR(50) PRIMARY KEY,
    title_ar VARCHAR(100) NOT NULL,
    title_en VARCHAR(100),
    icon_name VARCHAR(50) NOT NULL,
    color_classes VARCHAR(100),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. المتاجر والشركاء
CREATE TABLE stores (
    id BIGSERIAL PRIMARY KEY,
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category_id VARCHAR(50) NOT NULL REFERENCES store_categories(id),
    name VARCHAR(150) NOT NULL,
    name_en VARCHAR(150),
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    cover_url VARCHAR(500) NOT NULL,
    city VARCHAR(50) NOT NULL DEFAULT 'دمشق',
    district VARCHAR(100) NOT NULL,
    address_details TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    delivery_fee DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    min_order DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    delivery_time VARCHAR(30) NOT NULL DEFAULT '20-30 دقيقة',
    rating DECIMAL(3, 2) DEFAULT 5.00,
    reviews_count INT DEFAULT 0,
    tags TEXT[],
    discount_badge VARCHAR(80),
    is_popular BOOLEAN DEFAULT FALSE,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. أقسام المنيو للمتجر
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0
);

-- 6. المنتجات والوجبات
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    menu_category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    original_price DECIMAL(12, 2),
    image_url VARCHAR(500) NOT NULL,
    category_tag VARCHAR(100),
    calories INT,
    is_popular BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. خيارات المنتجات
CREATE TABLE product_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price_delta DECIMAL(12, 2) DEFAULT 0.00,
    is_default BOOLEAN DEFAULT FALSE
);

-- 8. إضافات المنتجات
CREATE TABLE product_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE
);

-- 9. ملفات الناقلين الأحرار
CREATE TABLE carrier_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(30) NOT NULL CHECK (vehicle_type IN ('motorcycle', 'bicycle', 'car', 'van')),
    vehicle_plate VARCHAR(50) NOT NULL,
    national_id VARCHAR(50) NOT NULL,
    current_zone VARCHAR(100) NOT NULL DEFAULT 'دمشق - الشعلان والمركز',
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    max_distance_km DECIMAL(4, 1) NOT NULL DEFAULT 8.0,
    is_online BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    deliveries_completed INT DEFAULT 0,
    today_earnings DECIMAL(14, 2) DEFAULT 0.00,
    total_earnings DECIMAL(14, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. الكوبونات
CREATE TABLE coupons (
    code VARCHAR(50) PRIMARY KEY,
    description VARCHAR(250) NOT NULL,
    discount_percent DECIMAL(5, 2),
    discount_amount DECIMAL(12, 2),
    min_spend DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    max_discount_cap DECIMAL(12, 2),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ
);

-- 11. الطلبات الرئيسية
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES users(id),
    store_id BIGINT NOT NULL REFERENCES stores(id),
    carrier_id UUID REFERENCES carrier_profiles(id),
    address_id UUID NOT NULL REFERENCES user_addresses(id),
    subtotal DECIMAL(12, 2) NOT NULL,
    delivery_fee DECIMAL(12, 2) NOT NULL,
    carrier_earning DECIMAL(12, 2) NOT NULL,
    service_fee DECIMAL(12, 2) NOT NULL DEFAULT 5000.00,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    coupon_code VARCHAR(50) REFERENCES coupons(code),
    driver_tip DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(40) NOT NULL CHECK (payment_method IN ('cash', 'syriatel', 'mtn', 'wallet', 'card')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    status VARCHAR(30) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'on_the_way', 'delivered', 'cancelled')),
    distance_km DECIMAL(5, 2) NOT NULL,
    estimated_minutes INT NOT NULL DEFAULT 25,
    special_instructions TEXT,
    accepted_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. عناصر الطلب
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    selected_option_id UUID REFERENCES product_options(id),
    selected_option_name VARCHAR(100),
    special_notes TEXT
);

-- 13. إضافات عناصر الطلب
CREATE TABLE order_item_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES product_addons(id),
    addon_name VARCHAR(100) NOT NULL,
    price DECIMAL(12, 2) NOT NULL
);

-- 14. تقييمات الطلب وتجربة التوصيل
CREATE TABLE order_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id),
    store_id BIGINT NOT NULL REFERENCES stores(id),
    carrier_id UUID REFERENCES carrier_profiles(id),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    delivery_rating SMALLINT CHECK (delivery_rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. المحافظ الرقمية
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'SYP',
    is_frozen BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 16. حركات المحفظة
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),
    type VARCHAR(30) NOT NULL CHECK (type IN ('deposit', 'order_payment', 'carrier_earning', 'withdrawal', 'refund')),
    amount DECIMAL(14, 2) NOT NULL,
    channel VARCHAR(40) NOT NULL CHECK (channel IN ('syriatel_cash', 'mtn_cash', 'bemo_bank', 'app_balance', 'cash')),
    reference_number VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```
