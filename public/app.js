// app.js (обновлённый)

// Надёжная инициализация Telegram.WebApp
let tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
let cart = [];
let userData = null;
let userId = null;
let isTelegramUser = false;
let popularity = {}; // { teaId: count }
// ----------------- CATALOG -----------------
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
            '⚡️ способствует улучшению работы нервной системы, придает организму энергию, устраняет головную боль'
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
// ----------------- END CATALOG -----------------
// Простая функция для классов по типу чая
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

// Небольшая util-функция sleep
function sleep(ms){ return new Promise(res => setTimeout(res, ms)); }
// Показывать сообщение в статусе загрузчика (если элемент есть)
function showLoaderMessage(text) {
    const status = document.getElementById('loader-status');
    if (status) status.textContent = text;
    console.log('[LOADER]', text);
}

// Глобальный обработчик ошибок — чтобы не падал silently
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error caught:', message, 'at', source + ':' + lineno + ':' + colno, error);
    try {
        showLoaderMessage('Ошибка: ' + (message || 'unknown') + '. Смотрите консоль.');
        const loader = document.getElementById('loader');
        if (loader) loader.style.opacity = '0.95';
        const app = document.getElementById('app');
        if (app) app.style.display = 'block';
    } catch(e){}
    // возвращаем false, чтобы браузер также показывал ошибку
    return false;
};

// Инициализация приложения
// Надёжная инициализация приложения (замените существующую функцию initApp)
async function initApp() {
    try {
        showLoaderMessage('Инициализация приложения...');

        // Подхватываем Telegram.WebApp, если он появился поздно
        if (!tg && window.Telegram && window.Telegram.WebApp) tg = window.Telegram.WebApp;

        if (tg) {
            try { tg.ready(); } catch(e){ console.warn('tg.ready() error', e); }
            try { tg.expand(); } catch(e){ /* ignore */ }
            try { tg.setHeaderColor && tg.setHeaderColor('#4CAF50'); } catch(e){}
            try { tg.setBackgroundColor && tg.setBackgroundColor('#f0f4f7'); } catch(e){}
            showLoaderMessage('Telegram WebApp инициализирован...');
        } else {
            showLoaderMessage('Не обнаружен Telegram WebApp — работаем в гостевом режиме');
        }

        // Получаем данные пользователя (возвращает объект даже для гостя)
        userData = await getUserData();
        showLoaderMessage(`Пользователь: ${userData.first_name || 'Гость'}`);

        // Генерация ID
        userId = generateUserId();

        // Загружаем popularity/корзину/заказы
        showLoaderMessage('Загружаем настройки и корзину...');
        await loadPopularity();
        await loadCart();
        await loadOrders();

        // Показываем интерфейс (все возможные ошибки внутри showMainInterface будут пойманы ниже)
        showMainInterface();

        // Если всё прошло — скрываем загрузчик через небольшой таймаут чтобы увидеть UI
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) loader.style.opacity = '0';
            setTimeout(() => {
                if (loader) loader.style.display = 'none';
                const app = document.getElementById('app');
                if (app) app.style.display = 'block';
            }, 450);
        }, 400);

    } catch (err) {
        console.error('initApp error', err);
        // Показываем пользователю понятную ошибку в загрузчике и открываем app, чтобы можно было смотреть консоль
        showLoaderMessage('Произошла ошибка при запуске. Откройте консоль (F12) для деталей.');
        const loader = document.getElementById('loader');
        if (loader) {
            // оставим loader видимым, но полупрозрачным, чтобы пользователь понял что случилось
            loader.style.opacity = '0.95';
        }
        // Показываем блок app (чтобы можно было взаимодействовать) — но не скрываем loader полностью
        const app = document.getElementById('app');
        if (app) app.style.display = 'block';
    }
}


// Надёжное получение initData (несколько попыток)
async function getUserData() {
    // Если Telegram WebApp доступен — пытаемся прочитать initDataUnsafe несколько раз
    if (window.Telegram && window.Telegram.WebApp) {
        // если initDataUnsafe есть — сразу возвращаем
        for (let attempt = 0; attempt < 8; attempt++) {
            const maybe = window.Telegram.WebApp.initDataUnsafe;
            if (maybe && maybe.user) {
                const user = maybe.user;
                console.log('Telegram initDataUnsafe (got user):', user);
                return {
                    id: user.id || null,
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    username: user.username || '',
                    photo_url: user.photo_url || '',
                    is_bot: user.is_bot || false,
                    language_code: user.language_code || 'ru'
                };
            }
            // ждём немного и пробуем снова (иногда initData появляется чуть позже)
            await sleep(120);
        }
        console.log('Telegram initDataUnsafe not available after retries');
    }

    // Параметр в URL для локальной отладки: ?tgUser={...}
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const tgUser = urlParams.get('tgUser');
        if (tgUser) {
            const parsedUser = JSON.parse(decodeURIComponent(tgUser));
            console.log('Loaded user from tgUser param (debug):', parsedUser);
            return parsedUser;
        }
    } catch (e) {
        console.warn('Error parsing tgUser param', e);
    }

    // Гость по умолчанию
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

// Генерация ID
function generateUserId() {
    if (userData && userData.id) return `tg_${userData.id}`;
    let guestId = localStorage.getItem('tutu_guest_id');
    if (!guestId) {
        guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2,9);
        localStorage.setItem('tutu_guest_id', guestId);
    }
    return guestId;
}

/* ---------- POPULARITY STORAGE ---------- */
// Ключи
function popularityKey() { return `tutu_popularity_${userId || 'anon'}`; }

async function loadPopularity() {
    // Попробуем Telegram CloudStorage (если доступно)
    if (tg && tg.CloudStorage && userData && userData.id) {
        try {
            const cloud = await new Promise((res) => {
                tg.CloudStorage.getItem('popularity', (err, val) => {
                    if (!err && val) res(val); else res(null);
                });
            });
            if (cloud) {
                popularity = JSON.parse(cloud);
                console.log('Loaded popularity from cloud', popularity);
                return;
            }
        } catch(e){ console.warn('Cloud load popularity failed', e); }
    }

    // Из localStorage
    const saved = localStorage.getItem(popularityKey());
    if (saved) {
        try { popularity = JSON.parse(saved); }
        catch(e){ popularity = {}; }
    } else {
        popularity = {};
    }
}

async function savePopularity() {
    // save local
    localStorage.setItem(popularityKey(), JSON.stringify(popularity));
    // try cloud
    if (tg && tg.CloudStorage && userData && userData.id) {
        try {
            await new Promise((res, rej) => {
                tg.CloudStorage.setItem('popularity', JSON.stringify(popularity), (err) => {
                    if (err) rej(err); else res();
                });
            });
            console.log('Popularity saved to cloud');
        } catch(e){ console.warn('Popularity cloud save failed', e); }
    }
}

/* ---------- CART / ORDERS (без изменений логики, с вызовом обновления popularity) ---------- */

// ... (весь твой teaCatalog остаётся выше — не трогаю)

// Загрузка корзины (оставляем как есть, с мелкой защитой от tg=null)
async function loadCart() {
    if (tg && tg.CloudStorage && userData && userData.id) {
        try {
            const cloudCart = await new Promise((resolve) => {
                tg.CloudStorage.getItem('cart', (error, value) => {
                    if (!error && value) resolve(value); else resolve(null);
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

    const localStorageKey = `tutu_cart_${userId}`;
    const savedCart = localStorage.getItem(localStorageKey);
    if (savedCart) {
        try { cart = JSON.parse(savedCart); } catch(e) { cart = []; }
    } else cart = [];
}

async function saveCart() {
    const localStorageKey = `tutu_cart_${userId}`;
    localStorage.setItem(localStorageKey, JSON.stringify(cart));
    if (tg && tg.CloudStorage && userData && userData.id) {
        try {
            await new Promise((res, rej) => {
                tg.CloudStorage.setItem('cart', JSON.stringify(cart), (err) => {
                    if (err) rej(err); else res();
                });
            });
            console.log('Cart saved to cloud');
        } catch(e){ console.warn('Cart cloud save failed', e); }
    }
    // backup
    localStorage.setItem('tutu_cart_backup', JSON.stringify({ userId, cart, timestamp: new Date().toISOString() }));
    updateCart();
}

// Orders storage (returns array)
async function loadOrders() {
    if (tg && tg.CloudStorage && userData && userData.id) {
        try {
            const cloudOrders = await new Promise((resolve) => {
                tg.CloudStorage.getItem('orders', (error, value) => {
                    if (!error && value) resolve(value); else resolve(null);
                });
            });
            if (cloudOrders) {
                try { return JSON.parse(cloudOrders); } catch(e){ console.warn(e); }
            }
        } catch(e){ console.warn(e); }
    }
    const localStorageKey = `tutu_orders_${userId}`;
    const savedOrders = localStorage.getItem(localStorageKey);
    if (savedOrders) {
        try { return JSON.parse(savedOrders); } catch(e){ return []; }
    }
    return [];
}

async function saveOrder(order) {
    const orders = await loadOrders();
    orders.push(order);
    const localStorageKey = `tutu_orders_${userId}`;
    localStorage.setItem(localStorageKey, JSON.stringify(orders));
    if (tg && tg.CloudStorage && userData && userData.id) {
        try {
            await new Promise((res, rej) => {
                tg.CloudStorage.setItem('orders', JSON.stringify(orders), (err) => {
                    if (err) rej(err); else res();
                });
            });
        } catch(e){ console.warn('Orders cloud save failed', e); }
    }
    // Обновим popularity на основе заказа
    updatePopularityFromOrder(order);
    await savePopularity();
}

// Обновление popularity на основе заказа (order.cart содержит items с id и quantity)
function updatePopularityFromOrder(order) {
    if (!order || !Array.isArray(order.cart)) return;
    order.cart.forEach(item => {
        const id = String(item.id);
        const qty = +item.quantity || 1;
        popularity[id] = (popularity[id] || 0) + qty;
    });
}

/* ---------- UI: showMainInterface & popular items ---------- */

function showMainInterface() {
    const app = document.getElementById('app');
    const firstName = (userData && userData.first_name) ? userData.first_name : 'Гость';
    const lastName = (userData && userData.last_name) ? userData.last_name : '';
    const fullName = `${firstName} ${lastName}`.trim();
    const username = (userData && userData.username) ? `@${userData.username}` : '';
    const hasPhoto = userData && userData.photo_url && userData.photo_url.trim() !== '';

    app.innerHTML = `
        <!-- Header -->
        <div class="header fade-in">
            <div class="header-content">
                <div class="logo">
                    <div class="logo-icon"><i class="fas fa-leaf"></i></div>
                    <div class="logo-text"><h1>ТИ•ТИ</h1><div class="subtitle">Чайная лавка</div></div>
                </div>
                <div class="user-avatar" onclick="showProfile()" title="${fullName}${username ? ` (${username})` : ''}">
                    ${hasPhoto ?
                        `<img src="${userData.photo_url}" alt="${fullName}" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'"
                              style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` :
                        `<i class="fas fa-user"></i>`
                    }
                    <span class="cart-badge" style="display:none">0</span>
                    ${isTelegramUser ? `<div class="tg-badge" title="Telegram пользователь">TG</div>` : ''}
                </div>
            </div>
        </div>

        <!-- Баннер -->
        <div class="banner fade-in" style="animation-delay:0.1s">
            <h2>🍵 Добро пожаловать, ${firstName}!</h2>
            <p>${isTelegramUser ? 'Рады видеть вас снова!' : 'Аутентичный китайский чай с доставкой'}</p>
            <a href="#" class="banner-button" onclick="showFullCatalog()">Смотреть каталог</a>
        </div>

        <!-- Навигация -->
        <div class="nav-grid fade-in" style="animation-delay:0.2s">
            <div class="nav-item" onclick="showFullCatalog()">
                <div class="nav-icon icon-tea"><i class="fas fa-mug-hot"></i></div>
                <h3>Каталог</h3><p>${teaCatalog.length}+ сортов чая</p>
            </div>
            <div class="nav-item" onclick="showOrders()">
                <div class="nav-icon icon-orders"><i class="fas fa-box"></i></div>
                <h3>Заказы</h3><p>История покупок</p>
            </div>
            <div class="nav-item" onclick="showCartModal()">
                <div class="nav-icon icon-cart"><i class="fas fa-shopping-cart"></i></div>
                <h3>Корзина</h3><p>Товары: <span class="cart-count">0</span></p>
            </div>
            <div class="nav-item" onclick="showProfile()">
                <div class="nav-icon icon-profile"><i class="fas fa-user"></i></div>
                <h3>Профиль</h3><p>${username || 'Ваш профиль'}</p>
            </div>
        </div>

        <!-- Популярные товары -->
        <div class="products-section fade-in" style="animation-delay:0.3s">
            <h2 class="section-title"><i class="fas fa-fire"></i> Популярное</h2>
            <div class="products-grid" id="popular-products"></div>
        </div>

        <!-- Футер корзины -->
        <div class="cart-footer fade-in" style="animation-delay:0.4s">
            <div class="cart-content">
                <div class="cart-total" id="cart-total">Корзина пуста</div>
                <button class="checkout-button" id="checkout-btn" onclick="checkout()" disabled>Оформить заказ</button>
            </div>
        </div>

        <!-- Модальные окна -->
        <div id="cart-modal" class="modal"></div>
        <div id="product-modal" class="modal"></div>
        <div id="order-modal" class="modal"></div>
        <div id="profile-modal" class="modal"></div>
        <div id="catalog-modal" class="modal"></div>
    `;

    loadPopularProducts();
    updateCart();
}

// Загрузка популярных - сортируем teaCatalog по popularity и показываем top 4
function loadPopularProducts() {
    // создаём массив с key = id и popularity count (0 по умолчанию)
    const popularityCounts = {};
    teaCatalog.forEach(t => popularityCounts[String(t.id)] = popularity[String(t.id)] || 0);

    // сортируем копию каталога
    const sorted = [...teaCatalog].sort((a,b) => {
        const pa = popularityCounts[String(a.id)] || 0;
        const pb = popularityCounts[String(b.id)] || 0;
        // сначала по убыванию популярности, затем по id
        if (pa !== pb) return pb - pa;
        return a.id - b.id;
    });

    const popular = sorted.slice(0, 4);
    const container = document.getElementById('popular-products');
    container.innerHTML = popular.map(tea => `
        <div class="product-card" onclick="showProduct(${tea.id})">
            <div class="product-image ${getTeaTypeClass(tea.type)}">
                ${tea.tag ? `<div class="product-tag">${tea.tag}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${tea.name}</h3>
                <div class="product-subtitle">${tea.subtitle}</div>
                <div class="product-price">${tea.price}₽</div>
                <button class="product-button" onclick="event.stopPropagation(); addToCart(${tea.id})">+ В корзину</button>
            </div>
        </div>
    `).join('');
}

// Остальной UI (каталог, product modal и т.д.) — почти без изменений, но showProduct теперь открывает bottom-sheet

function showProduct(productId) {
    const product = teaCatalog.find(p => p.id === productId);
    if (!product) return;
    const modal = document.getElementById('product-modal');

    // делаем modal bottom-sheet (чтобы не перекрывать сверху)
    modal.classList.add('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-leaf"></i> ${product.name}</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-size:16px; font-weight:600;">${product.subtitle}</div>
                    <div style="background:#4CAF50;color:white;padding:4px 10px;border-radius:12px;font-weight:600;">${product.type}</div>
                </div>
                ${product.tag ? `<div style="background:#FF9800;color:white;padding:5px 8px;border-radius:8px;display:inline-block;margin-bottom:12px;font-size:13px;">${product.tag}</div>` : ''}
                <div style="background:#f8f9fa;padding:12px;border-radius:8px;margin-bottom:12px;">
                    <h4 style="margin-bottom:8px;color:#333;">Описание:</h4>
                    <p style="color:#666;line-height:1.5;margin:0">${product.description}</p>
                </div>
                <div style="margin-bottom:12px;">
                    <h4 style="margin-bottom:8px;color:#333;">🍶 Способ заваривания:</h4>
                    <ul style="color:#666;padding-left:20px;line-height:1.6;margin:0;">
                        ${product.brewing.map(item=>`<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div style="margin-bottom:12px;">
                    <h4 style="margin-bottom:8px;color:#333;">🌿 Полезные свойства:</h4>
                    <ul style="color:#666;padding-left:20px;line-height:1.6;margin:0;">
                        ${product.benefits.map(item=>`<li>${item}</li>`).join('')}
                    </ul>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #eee;">
                    <div style="font-size:22px;font-weight:700;color:#4CAF50;">${product.price}₽</div>
                    <button onclick="addToCart(${product.id}); closeModal();" style="padding:10px 18px;background:linear-gradient(135deg,#4CAF50,#2E7D32);color:white;border:none;border-radius:20px;font-weight:700;cursor:pointer;">
                        <i class="fas fa-cart-plus"></i> Добавить
                    </button>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';

    // закрытие по клику вне контента
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

// showFullCatalog — сохраняем прежним, но если понадобятся правки — можно сделать похожим bottom-sheet

// Добавление в корзину (без изменений, но с защитой tg)
function addToCart(productId) {
    const product = teaCatalog.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.quantity += 1;
    else cart.push({ id: product.id, name: product.name, price: product.price, type: product.type, quantity: 1 });

    saveCart();
    try { tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred('light'); } catch(e){}
    try { tg && tg.showAlert && tg.showAlert(`✅ ${product.name} добавлен в корзину!`); } catch(e){}
}

// Показать корзину — как было (без изменений логики)

// updateQuantity, updateCart — оставляем (но убедимся, что updateCart использует актуальные cart данные)

function updateCart() {
    const totalItems = cart.reduce((s,i)=>s + (i.quantity||0), 0);
    const totalPrice = cart.reduce((s,i)=>s + ((i.price||0) * (i.quantity||0)), 0);
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) { cartBadge.textContent = totalItems; cartBadge.style.display = totalItems>0 ? 'flex' : 'none'; }
    const cartCount = document.querySelector('.cart-count'); if (cartCount) cartCount.textContent = totalItems;
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

// Checkout — НЕ закрываем WebApp. Копируем текст заказа в буфер и открываем чат @ivan_likhov
async function checkout() {
    if (!cart || cart.length === 0) {
        try { tg && tg.showAlert && tg.showAlert('Добавьте товары в корзину'); } catch(e){}
        return;
    }

    const total = cart.reduce((s,i)=>s + (i.price * i.quantity), 0);
    const order = {
        id: Date.now(),
        user_id: userId,
        user_name: userData.first_name || 'Гость',
        cart: [...cart],
        total,
        timestamp: new Date().toISOString()
    };

    // Сохраняем локально и в облако
    await saveOrder(order);

    // Формируем удобный текст сообщения для менеджера
    let lines = [];
    lines.push(`Новый заказ #${order.id}`);
    lines.push(`Покупатель: ${order.user_name} ${userData.username ? `(${userData.username})` : ''}`);
    lines.push(`ID пользователя: ${userData.id || userId}`);
    lines.push(`Сумма: ${order.total}₽`);
    lines.push(`Товары:`);
    order.cart.forEach(it => lines.push(` - ${it.name} × ${it.quantity} (${it.price}₽)`));
    lines.push('');
    lines.push('Пожалуйста, укажите адрес и контакты для доставки и отправьте сообщение.');
    lines.push('Адрес: ');

    const orderText = lines.join('\n');

    // Копируем в буфер обмена и открываем чат менеджера
    let copied = false;
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(orderText);
            copied = true;
        }
    } catch (e) {
        console.warn('Clipboard write failed', e);
    }

    // Попробуем открыть чат менеджера
    const managerUrl = 'https://t.me/ivan_likhov';
    try {
        // Открываем ссылку (в приложении/в браузере)
        tg && tg.openLink ? tg.openLink(managerUrl) : window.open(managerUrl, '_blank');
    } catch (e) {
        window.open(managerUrl, '_blank');
    }

    // Показать инструкцию пользователю: если скопировали — скажем вставить; если нет — покажем textarea для ручного копирования
    if (copied) {
        try { tg && tg.showAlert && tg.showAlert('Текст заказа скопирован в буфер обмена. Перейдите в чат @ivan_likhov, вставьте текст и укажите адрес.'); }
        catch(e){ alert('Текст заказа скопирован. Перейдите в чат @ivan_likhov и вставьте его.'); }
    } else {
        // Покажем модал с текстом для ручного копирования
        showOrderCopyModal(orderText);
    }

    // Очистим корзину локально (пользователь всё равно должен отправить сообщение вручную)
    cart = [];
    await saveCart();
    closeModal();
}

// Показываем модальное окно с текстом заказа для ручного копирования (fallback)
function showOrderCopyModal(text) {
    const modal = document.getElementById('order-modal');
    modal.classList.remove('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-paper-plane"></i> Текст заказа</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <textarea id="order-copy-area" style="width:100%;height:200px;border-radius:8px;padding:10px;">${text}</textarea>
                <div style="display:flex;gap:10px;margin-top:12px;">
                    <button onclick="copyOrderText()" style="flex:1;padding:10px;border-radius:8px;background:#4CAF50;color:white;border:none;cursor:pointer;">Копировать</button>
                    <button onclick="(tg && tg.openLink ? tg.openLink('https://t.me/ivan_likhov') : window.open('https://t.me/ivan_likhov'))" style="flex:1;padding:10px;border-radius:8px;background:#2196F3;color:white;border:none;cursor:pointer;">Открыть чат</button>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

async function copyOrderText() {
    const area = document.getElementById('order-copy-area');
    if (!area) return;
    try {
        await navigator.clipboard.writeText(area.value);
        try { tg && tg.showAlert && tg.showAlert('Скопировано! Откройте чат @ivan_likhov и вставьте сообщение.'); } catch(e){ alert('Скопировано!'); }
    } catch(e) {
        area.select();
        document.execCommand('copy');
        try { tg && tg.showAlert && tg.showAlert('Скопировано (fallback).'); } catch(e){ alert('Скопировано!'); }
    }
}

// Показ профиля — убрал секцию "Информация" как просили
function showProfile() {
    const modal = document.getElementById('profile-modal');
    const userPhotoUrl = (userData && userData.photo_url) ? userData.photo_url : '';
    const firstName = (userData && userData.first_name) ? userData.first_name : 'Гость';
    const lastName = (userData && userData.last_name) ? userData.last_name : '';
    const username = (userData && userData.username) ? `@${userData.username}` : '';
    const fullName = `${firstName} ${lastName}`.trim();

    modal.classList.remove('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user"></i> Мой профиль</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="text-align:center;margin-bottom:20px;">
                    <div style="width:100px;height:100px;margin:0 auto 12px;background:${userPhotoUrl ? 'transparent' : 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)'};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${userPhotoUrl ? 'inherit' : '42px'};color:white;overflow:hidden;border:3px solid #4CAF50;">
                        ${userPhotoUrl ? `<img src="${userPhotoUrl}" alt="${fullName}" style="width:100%;height:100%;object-fit:cover;">` : (firstName.charAt(0) || 'G')}
                    </div>
                    <h3 style="margin-bottom:6px;">${fullName}</h3>
                    ${username ? `<p style="color:#666;font-size:16px;">${username}</p>` : ''}
                    ${userData && userData.id ? `<p style="color:#999;font-size:14px;margin-top:6px;">ID: ${userData.id}</p>` : ''}
                </div>

                <div style="background:#f8f9fa;padding:20px;border-radius:15px;margin-bottom:15px;">
                    <h4 style="margin-bottom:12px;color:#333;display:flex;align-items:center;gap:10px;"><i class="fas fa-headset"></i> Контакты поддержки</h4>
                    <div style="color:#666;line-height:1.6;">
                        <div style="margin-bottom:10px;padding:10px;background:white;border-radius:10px;">
                            <div style="font-weight:600;margin-bottom:5px;">Telegram:</div>
                            <a href="https://t.me/ivan_likhov" target="_blank" style="color:#4CAF50;text-decoration:none;">@ivan_likhov</a>
                        </div>
                        <div style="padding:10px;background:white;border-radius:10px;">
                            <div style="font-weight:600;margin-bottom:5px;">Телефон:</div>
                            <a href="tel:+79038394670" style="color:#4CAF50;text-decoration:none;">+7 (903) 839-46-70</a>
                        </div>
                    </div>
                </div>

                <div style="background:#f8f9fa;padding:20px;border-radius:15px;">
                    <h4 style="margin-bottom:12px;color:#333;display:flex;align-items:center;gap:10px;"><i class="fas fa-clock"></i> Часы работы</h4>
                    <div style="color:#666;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span>Понедельник - Воскресенье:</span><span style="font-weight:600;">09:00 - 21:00</span>
                        </div>
                        <p style="margin-top:10px;font-size:14px;color:#888;">Принимаем заказы 24/7</p>
                    </div>
                </div>

                <button onclick="openChannel()" style="width:100%;padding:12px;margin-top:18px;background:linear-gradient(135deg,#4CAF50 0%,#2E7D32 100%);color:white;border:none;border-radius:10px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;">
                    <i class="fab fa-telegram"></i> Наш телеграм-канал
                </button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// открытие канала
function openChannel() {
    const url = 'https://t.me/teatea_bar';
    if (tg && tg.openLink) tg.openLink(url); else window.open(url, '_blank');
}

// Закрыть модальные окна (и очистить onclick)
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('bottom-sheet');
        modal.onclick = null;
    });
}

// Синхронизация popularity при загрузке (если нужно)
setTimeout(checkAndSyncData, 2000);

// Проверяем CloudStorage cart vs local (оставлена логика)
async function checkAndSyncData() {
    if (userData && userData.id && tg && tg.CloudStorage) {
        try {
            const cloudCart = await new Promise((resolve) => {
                tg.CloudStorage.getItem('cart', (err, val) => { if (!err && val) resolve(val); else resolve(null); });
            });
            if (cloudCart) {
                const parsedCloudCart = JSON.parse(cloudCart);
                const localStorageKey = `tutu_cart_${userId}`;
                const localCart = localStorage.getItem(localStorageKey);
                if (!localCart || parsedCloudCart.length > JSON.parse(localCart).length) {
                    cart = parsedCloudCart;
                    await saveCart();
                    updateCart();
                    console.log('Cart synced from Cloud Storage');
                }
            }
        } catch(e){ console.warn('Sync check error', e); }
    }
}

// Message listener (if parent supplies telegram_user_data)
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'telegram_user_data') {
        userData = event.data.user;
        isTelegramUser = true;
        userId = generateUserId();
        showMainInterface();
    }
});

// Telegram events (safety: only if tg exists)
if (tg) {
    try { tg.onEvent && tg.onEvent('viewportChanged', (e)=>console.log('Viewport changed', e)); } catch(e){}
    try { tg.onEvent && tg.onEvent('themeChanged', ()=>console.log('Theme changed')); } catch(e){}
}

// Инициализация после загрузки
document.addEventListener('DOMContentLoaded', initApp);

// Сохраняем корзину перед выгрузкой
window.addEventListener('beforeunload', () => { try { saveCart(); } catch(e){} });

/* Вспомогательная отладочная функция */
function debugUser() {
    console.log('User Data:', userData);
    console.log('User ID:', userId);
    console.log('Is Telegram User:', isTelegramUser);
    console.log('Cart:', cart);
    console.log('Popularity:', popularity);
    console.log('Telegram WebApp:', tg);
}
function showFullCatalog() {
    const modal = document.getElementById('catalog-modal');

    modal.classList.add('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content" style="max-height:85vh; overflow-y:auto;">
            <div class="modal-header">
                <h3><i class="fas fa-list"></i> Весь каталог</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>

            <div class="modal-body">
                ${teaCatalog.map(t => `
                    <div class="product-card catalog-card" onclick="showProduct(${t.id})">
                        <div class="product-image ${getTeaTypeClass(t.type)}">
                            ${t.tag ? `<div class="product-tag">${t.tag}</div>` : ''}
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">${t.name}</h3>
                            <div class="product-subtitle">${t.subtitle}</div>
                            <div class="product-type">${t.type}</div>
                            <div class="product-price">${t.price}₽</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}
function closeModal() {
    document.querySelectorAll('.modal').forEach(m => {
        m.style.display = 'none';
        m.classList.remove('bottom-sheet');
    });
}

