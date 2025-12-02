// Telegram Web App инициализация
let tg = window.Telegram.WebApp;
let cart = [];
let userData = null;
let userId = null;
let isTelegramUser = false;

// Инициализация приложения
async function initApp() {
    // Инициализируем Telegram Web App
    tg.ready();
    tg.expand();
    
    // Настраиваем цвета
    tg.setHeaderColor('#4CAF50');
    tg.setBackgroundColor('#f0f4f7');
    
    // Получаем данные пользователя
    userData = await getUserData();
    
    // Генерируем уникальный ID пользователя
    userId = generateUserId();
    
    // Загружаем корзину с синхронизацией
    await loadCart();
    
    // Загружаем историю заказов
    await loadOrders();
    
    // Показываем интерфейс
    showMainInterface();
    
    // Скрываем загрузчик
    setTimeout(() => {
        document.getElementById('loader').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('app').style.display = 'block';
        }, 500);
    }, 1000);
}

// Получение данных пользователя
async function getUserData() {
    // Пробуем получить данные из Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        try {
            const initData = tg.initDataUnsafe;
            console.log('Telegram initData:', initData);
            
            if (initData && initData.user) {
                isTelegramUser = true;
                const user = initData.user;
                
                // Формируем URL фото
                let photoUrl = '';
                if (user.photo_url) {
                    photoUrl = user.photo_url;
                }
                
                return {
                    id: user.id,
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    username: user.username || '',
                    photo_url: photoUrl,
                    is_bot: user.is_bot || false,
                    language_code: user.language_code || 'ru'
                };
            }
        } catch (error) {
            console.error('Error getting Telegram user data:', error);
        }
    }
    
    // Если данные из Telegram не получены, пробуем получить из URL параметров
    const urlParams = new URLSearchParams(window.location.search);
    const tgUser = urlParams.get('tgUser');
    
    if (tgUser) {
        try {
            const parsedUser = JSON.parse(decodeURIComponent(tgUser));
            isTelegramUser = true;
            return parsedUser;
        } catch (e) {
            console.error('Error parsing tgUser param:', e);
        }
    }
    
    // Если Telegram данные недоступны, создаем гостевого пользователя
    return {
        id: null,
        first_name: 'Гость',
        last_name: '',
        username: '',
        photo_url: '',
        is_bot: false,
        language_code: 'ru'
    };
}

// Генерация уникального ID пользователя
function generateUserId() {
    if (isTelegramUser && userData.id) {
        return `tg_${userData.id}`;
    }
    
    // Для гостей используем постоянный ID из localStorage
    let guestId = localStorage.getItem('tutu_guest_id');
    if (!guestId) {
        guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('tutu_guest_id', guestId);
    }
    return guestId;
}

// База данных продуктов
const teaCatalog = [
    {
        id: 1,
        name: 'ЛАО ЧА ТОУ',
        subtitle: 'Старые чайные головы',
        type: 'Пуэр',
        price: 1200,
        description: 'Насыщенный и бархатистый. Настой — густой, тёмно-коричневый с рубиновыми отблесками. Во вкусе преобладают тёплые ноты ореха, карамели, сухофруктов и лёгкой древесной горчинки. Послевкусие долгое, с приятными сладковатыми и пряными оттенками.',
        brewing: [
            '🌿 5 гр чая на 500 мл воды',
            '🌡 температура 95°C и выше',
            '⏳ время заваривания — 3-5 минут'
        ],
        benefits: [
            '♥️ мощный природный антиоксидант, укрепляет сердце и сосуды, снимает воспаление',
            '🦠 укрепляет иммунную систему и повышает сопротивляемость вирусам и простудным заболеваниям',
            '⚡️способствует улучшению работы нервной системы, придает организму энергию, устраняет головную боль'
        ],
        tag: 'Хит'
    },
    {
        id: 2,
        name: 'ХЭЙ ЦЗИНЬ',
        subtitle: 'Черное золото',
        type: 'Красный чай',
        price: 950,
        description: 'Аромат сладости пронизывает тело, становясь его основной нотой, окруженной едва заметным пряно-древесным ореолом. Настой гладкий, сладкий, приятный, с едва заметной кислинкой. Послевкусие тонкое, карамельное, в нем различаются оттенки ванили.',
        brewing: [
            '🌿 5-8 гр на 150-200 мл воды',
            '🌡 температура 85-95°C',
            '⏳ второй на 20-30 секунд'
        ],
        benefits: [
            '❄️ согревает в холодные дни',
            '🏡 снимает усталость и дарит ощущение уюта и гармонии',
            '🦠 помогает при простудных заболеваниях, так как расширяет дыхательные пути',
            '🧠 способствует улучшению памяти и работы мозга'
        ],
        tag: 'Популярное'
    },
    {
        id: 3,
        name: 'ЖОУ ГУЙ НУН СЯН',
        subtitle: 'Мясистая корица',
        type: 'Улун',
        price: 1100,
        description: 'Чай для концентрации, погружения, имеет приятный ярко выраженный топленый вкус с ореховыми нотками, приятный аромат, согревает и успокаивает. Отличный баланс вкуса и аромата. Табачные, медовые и фруктово-цитрусовые нотки.',
        brewing: [
            '🌿 5-8 гр на 150-200 мл воды',
            '🌡 температура 80-90°C',
            '⏳ второй на 30-40 секунд'
        ],
        benefits: [
            '🦋 стимулирует обмен веществ, что способствует снижению веса',
            '❤️ снижает уровень вредного холестерина в крови',
            '😴 успокаивающе воздействует на нервную систему',
            '🧠 улучшает когнитивные функции и память'
        ],
        tag: 'Рекомендуем'
    },
    {
        id: 4,
        name: 'ДЯНЬ ХУН',
        subtitle: 'Красный чай из Юньнани',
        type: 'Красный чай',
        price: 850,
        description: 'Теплый, хлебно-медовый аромат. Вкус прямой и насыщенный, мягкая сладость, небольшая терпкость и приятная плотность в чашке. Легко бодрит и отлично подходит как повседневный, рабочий чай для любого времени суток.',
        brewing: [
            '🌿 5-8 гр на 150-200 мл воды',
            '🌡 температура 85-95°C',
            '⏳ второй на 20-30 секунд'
        ],
        benefits: [
            '❄️ согревает в холодные дни',
            '🏡 снимает усталость и дарит ощущение уюта',
            '🦠 помогает при простудных заболеваниях',
            '🧠 способствует улучшению памяти'
        ]
    },
    {
        id: 5,
        name: 'ГАБА МАО ЧА',
        subtitle: 'Чай-сырец',
        type: 'Габа',
        price: 1400,
        description: 'В аромате жареные семечки, кедровые орехи переходящие в свежий мёд. Во вкусе кешью, кедровые орешки, нота вишневой косточки с неяркой кислинкой.',
        brewing: [
            '🌿 5-8 гр на 150-200 мл воды',
            '🌡 температура 85°C',
            '⏳ второй на 20-30 секунд'
        ],
        benefits: [
            '♥️ полезен для сердечно-сосудистой системы',
            '🥣 улучшает работу пищеварительной системы',
            '👳‍♂️снимает головные боли',
            '🦋адсорбирует токсины и жиры'
        ],
        tag: 'Новинка'
    },
    {
        id: 6,
        name: 'ГУ ШУ ХУН ЧА',
        subtitle: 'Красный чай со старых деревьев',
        type: 'Красный чай',
        price: 1300,
        description: 'Насыщенные медово-сливовые оттенки, небольшая маслянистость, абрикосовая легкая косточка на послевкусии, сладкий.',
        brewing: [
            '🌿 5-8 гр на 150-200 мл воды',
            '🌡 температура 85-90°C',
            '⏳ второй на 20-30 секунд'
        ],
        benefits: [
            '❄️ согревает в холодные дни',
            '🏡 снимает усталость и дарит гармонию',
            '🦠 помогает при простудных заболеваниях',
            '🧠 способствует улучшению памяти'
        ]
    },
    {
        id: 7,
        name: 'ТЕ ГУАНЬ ИНЬ',
        subtitle: 'Железная богиня милосердия',
        type: 'Улун',
        price: 1050,
        description: 'Классический расслабляющий светлый улун с интересной и многогранной лугово-травной и цветочной вкусоароматикой, а также яркой сиреневой кислинкой на послевкусии. Хорошо расслабляет, отлично подойдет для посиделок в компании.',
        brewing: [
            '🌿 5-8 гр на 150-200 мл воды',
            '🌡 температура 85°C',
            '⏳ второй на 20-25 секунд'
        ],
        benefits: [
            '👨🏻‍🦳 содержит антиоксиданты, предотвращающие старение',
            '🦷 профилактика заболеваний зубов и костей',
            '❤️ положительно сказывается на здоровье сердца',
            '🧘🏻‍♀️избавляет от тревожного состояния'
        ],
        tag: 'Классика'
    },
    {
        id: 8,
        name: 'МО ЛИ ХУА ЧА',
        subtitle: 'Жасмин',
        type: 'Зеленый чай',
        price: 900,
        description: 'Свежий жасминовый аромат с нежными цветочными оттенками, вкус сбалансированный и приятный. Оставляет тёплое, запоминающее послевкусие. Для любителей жасмина отличный вариант для старта дня на постоянной основе.',
        brewing: [
            '🌿 5-8 гр на 150-200 мл воды',
            '🌡 температура 70°C',
            '⏳ второй на 20-40 секунд'
        ],
        benefits: [
            '🧘🏻‍♀️ снимает стресс',
            '🦋 способствует похудению',
            '✨ выводит шлаки и токсины',
            '⚡️ тонизирует и бодрит'
        ]
    }
];

// Загрузка корзины с улучшенной синхронизацией
async function loadCart() {
    // Сначала пробуем загрузить из Telegram Cloud Storage (самый приоритетный)
    if (tg.CloudStorage && isTelegramUser) {
        try {
            console.log('Trying to load cart from Telegram Cloud Storage...');
            const cloudCart = await new Promise((resolve) => {
                tg.CloudStorage.getItem('cart', (error, value) => {
                    if (!error && value) {
                        console.log('Cart loaded from Telegram Cloud Storage:', value);
                        resolve(value);
                    } else {
                        console.log('No cart in Telegram Cloud Storage:', error);
                        resolve(null);
                    }
                });
            });
            
            if (cloudCart) {
                try {
                    const parsedCart = JSON.parse(cloudCart);
                    cart = Array.isArray(parsedCart) ? parsedCart : [];
                    console.log('Cart loaded from Telegram Cloud:', cart);
                    return;
                } catch (parseError) {
                    console.error('Error parsing cloud cart:', parseError);
                }
            }
        } catch (error) {
            console.log('Telegram Cloud Storage error:', error);
        }
    }
    
    // Затем пробуем загрузить из localStorage с ключом по userId
    const localStorageKey = `tutu_cart_${userId}`;
    console.log('Loading cart from localStorage key:', localStorageKey);
    const savedCart = localStorage.getItem(localStorageKey);
    
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            console.log('Cart loaded from localStorage:', cart);
        } catch (e) {
            console.error('Error parsing localStorage cart:', e);
            cart = [];
        }
    } else {
        console.log('No cart found in localStorage');
        cart = [];
    }
}

// Сохранение корзины с улучшенной синхронизацией
async function saveCart() {
    console.log('Saving cart:', cart);
    
    // Сохраняем в localStorage с ключом по userId
    const localStorageKey = `tutu_cart_${userId}`;
    localStorage.setItem(localStorageKey, JSON.stringify(cart));
    console.log('Cart saved to localStorage with key:', localStorageKey);
    
    // Для Telegram пользователей пробуем сохранить в Cloud Storage
    if (tg.CloudStorage && isTelegramUser) {
        try {
            await new Promise((resolve, reject) => {
                tg.CloudStorage.setItem('cart', JSON.stringify(cart), (error) => {
                    if (error) {
                        console.error('Error saving to Telegram Cloud Storage:', error);
                        reject(error);
                    } else {
                        console.log('Cart saved to Telegram Cloud Storage');
                        resolve();
                    }
                });
            });
        } catch (error) {
            console.log('Telegram Cloud Storage save failed:', error);
        }
    }
    
    // Также сохраняем в общий localStorage для резервного копирования
    localStorage.setItem('tutu_cart_backup', JSON.stringify({
        userId: userId,
        cart: cart,
        timestamp: new Date().toISOString()
    }));
    
    updateCart();
}

// Обновление отображения корзины
function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Обновляем счетчик в заголовке
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Обновляем счетчик в навигации
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    
    // Обновляем футер корзины
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cartTotal && checkoutBtn) {
        if (totalItems > 0) {
            cartTotal.innerHTML = `Итого: <span>${totalPrice}₽</span>`;
            checkoutBtn.textContent = `Оформить (${totalItems})`;
            checkoutBtn.disabled = false;
        } else {
            cartTotal.innerHTML = `Корзина пуста`;
            checkoutBtn.textContent = 'Добавьте товары';
            checkoutBtn.disabled = true;
        }
    }
}

// Загрузка истории заказов с синхронизацией
async function loadOrders() {
    // Сначала пробуем Telegram Cloud Storage
    if (tg.CloudStorage && isTelegramUser) {
        try {
            const cloudOrders = await new Promise((resolve) => {
                tg.CloudStorage.getItem('orders', (error, value) => {
                    if (!error && value) resolve(value);
                    else resolve(null);
                });
            });
            
            if (cloudOrders) {
                try {
                    return JSON.parse(cloudOrders);
                } catch (e) {
                    console.error('Error parsing cloud orders:', e);
                }
            }
        } catch (error) {
            console.log('Cloud storage orders error:', error);
        }
    }
    
    // Затем localStorage
    const localStorageKey = `tutu_orders_${userId}`;
    const savedOrders = localStorage.getItem(localStorageKey);
    
    if (savedOrders) {
        try {
            return JSON.parse(savedOrders);
        } catch (e) {
            console.error('Error parsing localStorage orders:', e);
        }
    }
    
    return [];
}

// Сохранение заказа с синхронизацией
async function saveOrder(order) {
    const orders = await loadOrders();
    orders.push(order);
    
    const localStorageKey = `tutu_orders_${userId}`;
    localStorage.setItem(localStorageKey, JSON.stringify(orders));
    
    // Синхронизация с Telegram Cloud Storage
    if (tg.CloudStorage && isTelegramUser) {
        try {
            await new Promise((resolve, reject) => {
                tg.CloudStorage.setItem('orders', JSON.stringify(orders), (error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
        } catch (error) {
            console.log('Cloud storage orders save failed:', error);
        }
    }
}

// Показать главный интерфейс
function showMainInterface() {
    const app = document.getElementById('app');
    
    // Формируем данные для отображения
    const firstName = userData.first_name || 'Гость';
    const lastName = userData.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const username = userData.username ? `@${userData.username}` : '';
    
    // Проверяем наличие фото
    const hasPhoto = userData.photo_url && userData.photo_url.trim() !== '';
    
    app.innerHTML = `
        <!-- Header -->
        <div class="header fade-in">
            <div class="header-content">
                <div class="logo">
                    <div class="logo-icon">
                        <i class="fas fa-leaf"></i>
                    </div>
                    <div class="logo-text">
                        <h1>ТИ•ТИ</h1>
                        <div class="subtitle">Чайная лавка</div>
                    </div>
                </div>
                <div class="user-avatar" onclick="showProfile()" title="${fullName}${username ? ` (${username})` : ''}">
                    ${hasPhoto ? 
                        `<img src="${userData.photo_url}" alt="${fullName}" 
                             onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>';"
                             style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : 
                        `<i class="fas fa-user"></i>`
                    }
                    <span class="cart-badge" style="display: none;">0</span>
                    ${isTelegramUser ? `<div class="tg-badge" title="Telegram пользователь">TG</div>` : ''}
                </div>
            </div>
        </div>
        
        <!-- Баннер -->
        <div class="banner fade-in" style="animation-delay: 0.1s">
            <h2>🍵 Добро пожаловать, ${firstName}!</h2>
            <p>${isTelegramUser ? 'Рады видеть вас снова!' : 'Аутентичный китайский чай с доставкой'}</p>
            <a href="#" class="banner-button" onclick="showFullCatalog()">Смотреть каталог</a>
        </div>
        
        <!-- Навигация -->
        <div class="nav-grid fade-in" style="animation-delay: 0.2s">
            <div class="nav-item" onclick="showFullCatalog()">
                <div class="nav-icon icon-tea">
                    <i class="fas fa-mug-hot"></i>
                </div>
                <h3>Каталог</h3>
                <p>${teaCatalog.length}+ сортов чая</p>
            </div>
            
            <div class="nav-item" onclick="showOrders()">
                <div class="nav-icon icon-orders">
                    <i class="fas fa-box"></i>
                </div>
                <h3>Заказы</h3>
                <p>История покупок</p>
            </div>
            
            <div class="nav-item" onclick="showCartModal()">
                <div class="nav-icon icon-cart">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h3>Корзина</h3>
                <p>Товары: <span class="cart-count">0</span></p>
            </div>
            
            <div class="nav-item" onclick="showProfile()">
                <div class="nav-icon icon-profile">
                    <i class="fas fa-user"></i>
                </div>
                <h3>Профиль</h3>
                <p>${username || 'Ваш профиль'}</p>
            </div>
        </div>
        
        <!-- Популярные товары -->
        <div class="products-section fade-in" style="animation-delay: 0.3s">
            <h2 class="section-title">
                <i class="fas fa-fire"></i> Популярное
            </h2>
            <div class="products-grid" id="popular-products">
                <!-- Товары загружаются динамически -->
            </div>
        </div>
        
        <!-- Футер корзины -->
        <div class="cart-footer fade-in" style="animation-delay: 0.4s">
            <div class="cart-content">
                <div class="cart-total" id="cart-total">Корзина пуста</div>
                <button class="checkout-button" id="checkout-btn" onclick="checkout()" disabled>
                    Оформить заказ
                </button>
            </div>
        </div>
        
        <!-- Модальные окна -->
        <div id="cart-modal" class="modal"></div>
        <div id="product-modal" class="modal"></div>
        <div id="order-modal" class="modal"></div>
        <div id="profile-modal" class="modal"></div>
        <div id="catalog-modal" class="modal"></div>
    `;
    
    // Загружаем популярные товары
    loadPopularProducts();
    updateCart();
}

// Загрузка популярных товаров
function loadPopularProducts() {
    const popularTeas = teaCatalog.filter(tea => tea.tag).slice(0, 4);
    
    const container = document.getElementById('popular-products');
    container.innerHTML = popularTeas.map(tea => `
        <div class="product-card" onclick="showProduct(${tea.id})">
            <div class="product-image ${getTeaTypeClass(tea.type)}">
                ${tea.tag ? `<div class="product-tag">${tea.tag}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${tea.name}</h3>
                <div class="product-subtitle">${tea.subtitle}</div>
                <div class="product-price">${tea.price}₽</div>
                <button class="product-button" onclick="event.stopPropagation(); addToCart(${tea.id})">
                    + В корзину
                </button>
            </div>
        </div>
    `).join('');
}

// Получение класса для типа чая
function getTeaTypeClass(type) {
    const classes = {
        'Пуэр': 'puer',
        'Красный чай': 'red-tea',
        'Улун': 'oolong',
        'Габа': 'gaba',
        'Зеленый чай': 'green-tea'
    };
    return classes[type] || '';
}

// Добавление в корзину
function addToCart(productId) {
    const product = teaCatalog.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ 
            ...product, 
            quantity: 1,
            // Сохраняем только нужные данные
            id: product.id,
            name: product.name,
            price: product.price,
            type: product.type
        });
    }
    
    saveCart();
    
    // Анимация добавления
    tg.HapticFeedback.impactOccurred('light');
    tg.showAlert(`✅ ${product.name} добавлен в корзину!`);
}

// Показать полный каталог
function showFullCatalog() {
    const modal = document.getElementById('catalog-modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-mug-hot"></i> Каталог чая</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body" style="padding: 0;">
                <div style="max-height: 60vh; overflow-y: auto;">
                    ${teaCatalog.map(tea => `
                        <div class="catalog-item" onclick="showProduct(${tea.id})" style="padding: 15px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.3s;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div class="tea-icon ${getTeaTypeClass(tea.type)}" style="width: 50px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
                                    <i class="fas fa-leaf"></i>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; font-size: 16px;">${tea.name}</div>
                                    <div style="font-size: 14px; color: #666; margin: 2px 0;">${tea.subtitle}</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                                        <div style="color: #4CAF50; font-weight: 700;">${tea.price}₽</div>
                                        <button onclick="event.stopPropagation(); addToCart(${tea.id})" style="padding: 5px 15px; background: #4CAF50; color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 14px;">
                                            + Добавить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    // Добавляем стили для иконок чая
    const style = document.createElement('style');
    style.textContent = `
        .tea-icon.puer { background: linear-gradient(135deg, #8D6E63, #5D4037); }
        .tea-icon.red-tea { background: linear-gradient(135deg, #FF5252, #D32F2F); }
        .tea-icon.oolong { background: linear-gradient(135deg, #FFB74D, #F57C00); }
        .tea-icon.gaba { background: linear-gradient(135deg, #7B1FA2, #4A148C); }
        .tea-icon.green-tea { background: linear-gradient(135deg, #4CAF50, #2E7D32); }
        .catalog-item:hover { background: #f8f9fa; }
    `;
    document.head.appendChild(style);
    
    modal.style.display = 'flex';
}

// Показать детальную информацию о товаре
function showProduct(productId) {
    const product = teaCatalog.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-leaf"></i> ${product.name}</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div style="font-size: 18px; font-weight: 600;">${product.subtitle}</div>
                        <div style="background: #4CAF50; color: white; padding: 5px 15px; border-radius: 15px; font-weight: 600;">
                            ${product.type}
                        </div>
                    </div>
                    ${product.tag ? `<div style="background: #FF9800; color: white; padding: 5px 10px; border-radius: 10px; display: inline-block; margin-bottom: 15px; font-size: 14px;">${product.tag}</div>` : ''}
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px; color: #333;">Описание:</h4>
                    <p style="color: #666; line-height: 1.5;">${product.description}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px; color: #333;">🍶 Способ заваривания:</h4>
                    <ul style="color: #666; padding-left: 20px; line-height: 1.6;">
                        ${product.brewing.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h4 style="margin-bottom: 10px; color: #333;">🌿 Полезные свойства:</h4>
                    <ul style="color: #666; padding-left: 20px; line-height: 1.6;">
                        ${product.benefits.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #eee;">
                    <div style="font-size: 24px; font-weight: 700; color: #4CAF50;">${product.price}₽</div>
                    <button onclick="addToCart(${product.id}); closeModal();" style="padding: 12px 30px; background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; border: none; border-radius: 25px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-cart-plus"></i> Добавить в корзину
                    </button>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// Показать заказы
async function showOrders() {
    const orders = await loadOrders();
    const modal = document.getElementById('order-modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-box"></i> История заказов</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                ${orders.length === 0 ? `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 48px; color: #ddd; margin-bottom: 20px;">
                            <i class="fas fa-box-open"></i>
                        </div>
                        <h4 style="color: #666; margin-bottom: 10px;">Заказов пока нет</h4>
                        <p style="color: #999;">Совершите первую покупку!</p>
                    </div>
                ` : `
                    <div style="max-height: 50vh; overflow-y: auto;">
                        ${orders.map((order, index) => `
                            <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <div style="font-weight: 600;">Заказ #${orders.length - index}</div>
                                    <div style="color: #4CAF50; font-weight: 700;">${order.total}₽</div>
                                </div>
                                <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
                                    ${new Date(order.timestamp).toLocaleDateString('ru-RU')}
                                </div>
                                <div style="font-size: 14px; color: #888;">
                                    Товаров: ${order.cart.reduce((sum, item) => sum + item.quantity, 0)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// Показать корзину
function showCartModal() {
    if (cart.length === 0) {
        tg.showAlert('🛒 Корзина пуста');
        return;
    }
    
    const modal = document.getElementById('cart-modal');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-shopping-cart"></i> Корзина</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="max-height: 40vh; overflow-y: auto; margin-bottom: 20px;">
                    ${cart.map(item => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #eee; background: #f8f9fa; border-radius: 10px; margin-bottom: 10px;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; margin-bottom: 5px;">${item.name}</div>
                                <div style="font-size: 14px; color: #666;">${item.type} • ${item.price}₽/шт</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="display: flex; align-items: center; gap: 10px; background: white; padding: 5px 15px; border-radius: 20px;">
                                    <button onclick="updateQuantity(${item.id}, -1)" style="width: 30px; height: 30px; border-radius: 50%; border: none; background: #f0f0f0; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
                                    <span style="font-weight: 600; min-width: 20px; text-align: center;">${item.quantity}</span>
                                    <button onclick="updateQuantity(${item.id}, 1)" style="width: 30px; height: 30px; border-radius: 50%; border: none; background: #4CAF50; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
                                </div>
                                <div style="font-weight: 700; color: #4CAF50; min-width: 60px; text-align: right;">
                                    ${item.price * item.quantity}₽
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #4CAF50;">
                    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; margin-bottom: 15px;">
                        <span>Итого:</span>
                        <span>${total}₽</span>
                    </div>
                    <button onclick="checkout()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <i class="fas fa-paper-plane"></i> Оформить заказ
                    </button>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// Обновить количество товара
function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }
    
    saveCart();
    tg.HapticFeedback.impactOccurred('light');
    
    if (cart.length === 0) {
        closeModal();
    } else {
        showCartModal();
    }
}

// Оформление заказа
async function checkout() {
    if (cart.length === 0) {
        tg.showAlert('Добавьте товары в корзину');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const order = {
        id: Date.now(),
        user_id: userId,
        user_name: userData.first_name || 'Гость',
        cart: [...cart],
        total: total,
        timestamp: new Date().toISOString()
    };
    
    // Сохраняем заказ
    await saveOrder(order);
    
    // Отправляем данные в бота
    tg.sendData(JSON.stringify({
        action: 'checkout',
        user_id: userData.id || userId,
        user_name: userData.first_name || 'Гость',
        user_username: userData.username || '',
        cart: cart,
        total: total,
        order_id: order.id,
        timestamp: order.timestamp
    }));
    
    // Очищаем корзину
    cart = [];
    await saveCart();
    
    tg.showAlert(`✅ Заказ #${order.id} на ${total}₽ отправлен! С вами свяжется менеджер.`);
    closeModal();
}

// Показать профиль
function showProfile() {
    const modal = document.getElementById('profile-modal');
    const userPhotoUrl = userData.photo_url || '';
    const firstName = userData.first_name || 'Гость';
    const lastName = userData.last_name || '';
    const username = userData.username ? `@${userData.username}` : '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user"></i> Мой профиль</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="width: 100px; height: 100px; margin: 0 auto 15px; background: ${userPhotoUrl ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: ${userPhotoUrl ? 'inherit' : '42px'}; color: white; overflow: hidden; border: 3px solid #4CAF50;">
                        ${userPhotoUrl ? 
                            `<img src="${userPhotoUrl}" alt="${fullName}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                            `${firstName.charAt(0)}`
                        }
                    </div>
                    <h3 style="margin-bottom: 5px;">${fullName}</h3>
                    ${username ? `<p style="color: #666; font-size: 16px;">${username}</p>` : ''}
                    ${userData.id ? `<p style="color: #999; font-size: 14px; margin-top: 5px;">ID: ${userData.id}</p>` : ''}
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 25px;">
                    <h4 style="margin-bottom: 15px; color: #333; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-info-circle"></i> Информация
                    </h4>
                    <div style="color: #666; line-height: 1.6;">
                        <p style="margin-bottom: 10px;">📱 Вы используете ${tg.isExpanded ? 'развернутый' : 'компактный'} режим Telegram Web App</p>
                        <p>🔄 Все ваши данные синхронизируются между устройствами</p>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 15px; margin-bottom: 25px;">
                    <h4 style="margin-bottom: 15px; color: #333; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-headset"></i> Контакты поддержки
                    </h4>
                    <div style="color: #666; line-height: 1.6;">
                        <div style="margin-bottom: 10px; padding: 10px; background: white; border-radius: 10px;">
                            <div style="font-weight: 600; margin-bottom: 5px;">Telegram:</div>
                            <a href="https://t.me/ivan_likhov" target="_blank" style="color: #4CAF50; text-decoration: none;">@ivan_likhov</a>
                        </div>
                        <div style="padding: 10px; background: white; border-radius: 10px;">
                            <div style="font-weight: 600; margin-bottom: 5px;">Телефон:</div>
                            <a href="tel:+79038394670" style="color: #4CAF50; text-decoration: none;">+7 (903) 839-46-70</a>
                        </div>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 15px;">
                    <h4 style="margin-bottom: 15px; color: #333; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-clock"></i> Часы работы
                    </h4>
                    <div style="color: #666;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Понедельник - Воскресенье:</span>
                            <span style="font-weight: 600;">09:00 - 21:00</span>
                        </div>
                        <p style="margin-top: 10px; font-size: 14px; color: #888;">Принимаем заказы 24/7</p>
                    </div>
                </div>
                
                <button onclick="openChannel()" style="width: 100%; padding: 15px; margin-top: 20px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <i class="fab fa-telegram"></i> Наш телеграм-канал
                </button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// Открыть канал
function openChannel() {
    tg.openLink('https://t.me/teatea_bar');
}

// Закрыть модальное окно
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Проверка и обновление синхронизации
async function checkAndSyncData() {
    if (isTelegramUser && tg.CloudStorage) {
        try {
            // Проверяем, есть ли более свежие данные в Cloud Storage
            const cloudCart = await new Promise((resolve) => {
                tg.CloudStorage.getItem('cart', (error, value) => {
                    if (!error && value) resolve(value);
                    else resolve(null);
                });
            });
            
            if (cloudCart) {
                const parsedCloudCart = JSON.parse(cloudCart);
                const localStorageKey = `tutu_cart_${userId}`;
                const localCart = localStorage.getItem(localStorageKey);
                
                // Если данные в Cloud Storage новее или localCart пуст
                if (!localCart || parsedCloudCart.length > JSON.parse(localCart).length) {
                    cart = parsedCloudCart;
                    await saveCart();
                    updateCart();
                    console.log('Cart synced from Cloud Storage');
                }
            }
        } catch (error) {
            console.log('Sync check error:', error);
        }
    }
}

// Вызываем проверку синхронизации при загрузке
setTimeout(checkAndSyncData, 2000);

// Обработчик для получения сообщений от родительского окна (если запущено в iframe)
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'telegram_user_data') {
        userData = event.data.user;
        isTelegramUser = true;
        userId = generateUserId();
        showMainInterface();
    }
});

// Обработчики Telegram событий
tg.onEvent('viewportChanged', (event) => {
    console.log('Viewport changed:', event);
});

tg.onEvent('themeChanged', () => {
    console.log('Theme changed');
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initApp);

// Обработка закрытия приложения
window.addEventListener('beforeunload', () => {
    saveCart();
});

// Старая функция для обратной совместимости
function showCatalog() {
    showFullCatalog();
}

// Функция для отладки (можно вызывать из консоли)
function debugUser() {
    console.log('User Data:', userData);
    console.log('User ID:', userId);
    console.log('Is Telegram User:', isTelegramUser);
    console.log('Cart:', cart);
    console.log('Telegram WebApp:', tg);
    console.log('Telegram initDataUnsafe:', tg.initDataUnsafe);
}
