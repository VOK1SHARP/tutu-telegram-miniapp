// app.js — полная, рабочая версия (заменить файл целиком)

/* ===========================
   ИНИЦИАЛИЗАЦИЯ / ГЛОБАЛЫ
   =========================== */
let tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
let cart = [];
let userData = null;
let userId = null;
let isTelegramUser = false;
let popularity = {}; // { teaId: count }

const APP_KEYS = {
    CART_KEY: (uid) => `tutu_cart_${uid}`,
    ORDERS_KEY: (uid) => `tutu_orders_${uid}`,
    POP_KEY: (uid) => `tutu_popularity_${uid}`
};

// ================= CATALOG (оставил твой каталог, можно редактировать) =================
const teaCatalog = [
    { id:1, name:'ЛАО ЧА ТОУ', subtitle:'Старые чайные головы', type:'Пуэр', price:1200, description:'Насыщенный и бархатистый...', brewing:['🌿 5 гр чая на 500 мл воды','🌡 95°C','⏳ 3-5 минут'], benefits:['♥️ антиоксидант'], tag:'Хит' },
    { id:2, name:'ХЭЙ ЦЗИНЬ', subtitle:'Черное золото', type:'Красный чай', price:950, description:'Аромат сладости...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡 85-95°C','⏳ 20-30 секунд'], benefits:['❄️ согревает'], tag:'Популярное' },
    { id:3, name:'ЖОУ ГУЙ НУН СЯН', subtitle:'Мясистая корица', type:'Улун', price:1100, description:'Чай для концентрации...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡 80-90°C','⏳ 30-40 секунд'], benefits:['🦋 стимулирует обмен веществ'], tag:'Рекомендуем' },
    { id:4, name:'ДЯНЬ ХУН', subtitle:'Красный чай из Юньнани', type:'Красный чай', price:850, description:'Теплый, хлебно-медовый аромат...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡 85-95°C','⏳ 20-30 секунд'], benefits:['❄️ согревает'] },
    { id:5, name:'ГАБА МАО ЧА', subtitle:'Чай-сырец', type:'Габа', price:1400, description:'В аромате жареные семечки...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡 85°C','⏳ 20-30 секунд'], benefits:['♥️ полезен для сердца'], tag:'Новинка' },
    { id:6, name:'ГУ ШУ ХУН ЧА', subtitle:'Красный чай со старых деревьев', type:'Красный чай', price:1300, description:'Насыщенные медово-сливовые оттенки...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡 85-90°C','⏳ 20-30 секунд'], benefits:['❄️ согревает'] },
    { id:7, name:'ТЕ ГУАНЬ ИНЬ', subtitle:'Железная богиня милосердия', type:'Улун', price:1050, description:'Классический расслабляющий светлый улун...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡 85°C','⏳ 20-25 секунд'], benefits:['👨🏻‍🦳 антиоксиданты'], tag:'Классика' },
    { id:8, name:'МО ЛИ ХУА ЧА', subtitle:'Жасмин', type:'Зеленый чай', price:900, description:'Свежий жасминовый аромат...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡 70°C','⏳ 20-40 секунд'], benefits:['🧘🏻‍♀️ снимает стресс'] }
];

// ------------ Утилиты ------------
function sleep(ms){ return new Promise(res => setTimeout(res, ms)); }
function log(...args){ console.log('[app]', ...args); }
function getTeaTypeClass(type){
    const classes = {'Пуэр':'puer','Красный чай':'red-tea','Улун':'oolong','Габа':'gaba','Зеленый чай':'green-tea'};
    return classes[type] || '';
}

// =========================
// TOAST (короткие уведомления)
// =========================
// Что такое «тоаст» — это небольшая подсказка/всплывающее сообщение в углу экрана, которое автоматически скрывается через несколько секунд.
// Здесь реализован минимальный тоаст: createToast(message, timeout).
const TOAST_TIMEOUT = 3500;
function ensureToastContainer(){
    if (document.getElementById('toast-container')) return;
    const c = document.createElement('div');
    c.id = 'toast-container';
    c.style.position = 'fixed';
    c.style.right = '14px';
    c.style.top = '14px';
    c.style.zIndex = 99999;
    c.style.display = 'flex';
    c.style.flexDirection = 'column';
    c.style.gap = '8px';
    document.body.appendChild(c);
}
function createToast(text, options = {}){
    ensureToastContainer();
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'app-toast';
    t.style.background = 'rgba(0,0,0,0.8)';
    t.style.color = 'white';
    t.style.padding = '10px 14px';
    t.style.borderRadius = '12px';
    t.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
    t.style.maxWidth = '320px';
    t.style.fontSize = '14px';
    t.style.opacity = '0';
    t.style.transform = 'translateY(-6px)';
    t.style.transition = 'opacity 220ms ease, transform 220ms ease';
    t.textContent = text;
    container.appendChild(t);
    requestAnimationFrame(()=>{ t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
    const timeout = options.timeout || TOAST_TIMEOUT;
    setTimeout(()=>{ t.style.opacity = '0'; t.style.transform = 'translateY(-6px)'; setTimeout(()=> t.remove(), 260); }, timeout);
}

// =========================
// CONFIRM DIALOG (кривой, но рабочий) — возвращает Promise<boolean>
// =========================
function showConfirm(message, title = 'Подтвердите действие'){
    // создаём простую модалку подтверждения
    return new Promise(resolve => {
        // контейнер
        let overlay = document.getElementById('confirm-overlay');
        if (!overlay){
            overlay = document.createElement('div');
            overlay.id = 'confirm-overlay';
            overlay.style.position = 'fixed';
            overlay.style.left = 0;
            overlay.style.top = 0;
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.background = 'rgba(0,0,0,0.45)';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.zIndex = 100000;
            document.body.appendChild(overlay);
        }
        overlay.innerHTML = `
            <div style="width:92%;max-width:420px;background:white;border-radius:14px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.3);">
                <div style="background:#4CAF50;color:white;padding:14px 16px;font-weight:700;font-size:16px;">${title}</div>
                <div style="padding:16px;font-size:15px;color:#333;">${message}</div>
                <div style="display:flex;gap:10px;padding:12px;background:#fafafa;justify-content:flex-end;">
                    <button id="confirm-no" style="background:#eee;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;">Отмена</button>
                    <button id="confirm-yes" style="background:#4CAF50;color:white;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;">Подтвердить</button>
                </div>
            </div>
        `;
        overlay.style.opacity = '1';
        overlay.querySelector('#confirm-no').onclick = ()=>{ overlay.style.opacity='0'; setTimeout(()=> overlay.innerHTML=''; resolve(false), 180); };
        overlay.querySelector('#confirm-yes').onclick = ()=>{ overlay.style.opacity='0'; setTimeout(()=> overlay.innerHTML=''; resolve(true), 180); };
    });
}

// =========================
// STORAGE: cart / orders / popularity
// =========================
async function loadCart(){
    cart = [];
    if (!userId) userId = generateUserId();
    const key = APP_KEYS.CART_KEY(userId);
    if (tg && tg.CloudStorage && isTelegramUser){
        try {
            const cloud = await new Promise(res => tg.CloudStorage.getItem('cart', (err, val) => res(!err && val ? val : null)));
            if (cloud){
                cart = JSON.parse(cloud);
                updateCart();
                return;
            }
        } catch(e){ log('cloud cart err', e); }
    }
    const saved = localStorage.getItem(key);
    if (saved) try { cart = JSON.parse(saved); } catch(e){ cart = []; }
    updateCart();
}
async function saveCart(){
    if (!userId) userId = generateUserId();
    const key = APP_KEYS.CART_KEY(userId);
    try { localStorage.setItem(key, JSON.stringify(cart)); } catch(e){ console.warn('localStorage write failed', e); }
    if (tg && tg.CloudStorage && isTelegramUser){
        try {
            await new Promise((res,rej)=> tg.CloudStorage.setItem('cart', JSON.stringify(cart), (err)=> err ? rej(err) : res() ));
        } catch(e){ log('cloud save cart failed', e); }
    }
    // резервная копия
    try { localStorage.setItem('tutu_cart_backup', JSON.stringify({userId, cart, timestamp: new Date().toISOString()})); } catch(e){}
    updateCart();
}

async function loadOrders(){
    if (!userId) userId = generateUserId();
    const key = APP_KEYS.ORDERS_KEY(userId);
    if (tg && tg.CloudStorage && isTelegramUser){
        try {
            const cloud = await new Promise(res => tg.CloudStorage.getItem('orders', (err, val) => res(!err && val ? val : null)));
            if (cloud) return JSON.parse(cloud);
        } catch(e){ log('cloud orders err', e); }
    }
    const saved = localStorage.getItem(key);
    if (saved) try { return JSON.parse(saved); } catch(e){ return []; }
    return [];
}
async function saveOrder(order){
    if (!userId) userId = generateUserId();
    const key = APP_KEYS.ORDERS_KEY(userId);
    const orders = await loadOrders();
    orders.push(order);
    try { localStorage.setItem(key, JSON.stringify(orders)); } catch(e){}
    if (tg && tg.CloudStorage && isTelegramUser){
        try { await new Promise((res,rej)=> tg.CloudStorage.setItem('orders', JSON.stringify(orders), (err)=> err ? rej(err) : res() )); }
        catch(e){ log('cloud save orders failed', e); }
    }
    // обновим популярность
    updatePopularityFromOrder(order);
    await savePopularity();
}

// popularity
async function loadPopularity(){
    if (!userId) userId = generateUserId();
    const key = APP_KEYS.POP_KEY(userId);
    if (tg && tg.CloudStorage && isTelegramUser){
        try {
            const cloud = await new Promise(res => tg.CloudStorage.getItem('popularity', (err, val) => res(!err && val ? val : null)));
            if (cloud){ popularity = JSON.parse(cloud); return; }
        } catch(e){ log('cloud pop err', e); }
    }
    const saved = localStorage.getItem(key);
    popularity = saved ? JSON.parse(saved) : {};
}
async function savePopularity(){
    if (!userId) userId = generateUserId();
    const key = APP_KEYS.POP_KEY(userId);
    try { localStorage.setItem(key, JSON.stringify(popularity)); } catch(e){}
    if (tg && tg.CloudStorage && isTelegramUser){
        try { await new Promise((res,rej)=> tg.CloudStorage.setItem('popularity', JSON.stringify(popularity), (err) => err ? rej(err) : res() )); }
        catch(e){ log('cloud save pop failed', e); }
    }
}
function updatePopularityFromOrder(order){
    if (!order || !Array.isArray(order.cart)) return;
    order.cart.forEach(it => {
        const id = String(it.id);
        const q = Number(it.quantity || 1);
        popularity[id] = (popularity[id] || 0) + q;
    });
}

// =========================
// ID & USER DATA
// =========================
function generateUserId(){
    if (userData && userData.id) return `tg_${userData.id}`;
    let guest = localStorage.getItem('tutu_guest_id');
    if (!guest) { guest = 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2,9); localStorage.setItem('tutu_guest_id', guest); }
    return guest;
}

async function getUserData(){
    // пытаемся получить initDataUnsafe (несколько попыток)
    if (window.Telegram && window.Telegram.WebApp){
        for (let i=0;i<6;i++){
            const maybe = window.Telegram.WebApp.initDataUnsafe;
            if (maybe && maybe.user) {
                const u = maybe.user;
                isTelegramUser = true;
                return { 
                    id: u.id || null, 
                    first_name: u.first_name || '', 
                    last_name: u.last_name || '', 
                    username: u.username || '', 
                    photo_url: u.photo_url || '', 
                    is_bot: u.is_bot || false, 
                    language_code: u.language_code || 'ru' 
                };
            }
            await sleep(120);
        }
    }
    // debug via URL ?tgUser=...
    try {
        const p = new URLSearchParams(window.location.search).get('tgUser');
        if (p) return JSON.parse(decodeURIComponent(p));
    } catch(e){ log('tgUser parse fail', e); }
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

// =========================
// UI: MAIN INTERFACE
// =========================
function showMainInterface(){
    const app = document.getElementById('app');
    if (!app) return;
    const firstName = (userData && userData.first_name) ? userData.first_name : 'Гость';
    const lastName = (userData && userData.last_name) ? userData.last_name : '';
    const username = (userData && userData.username) ? `@${userData.username}` : '';
    const fullName = `${firstName} ${lastName}`.trim();
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
                    ${hasPhoto ? `<img src="${userData.photo_url}" alt="${fullName}" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : `<i class="fas fa-user"></i>`}
                    <span class="cart-badge" style="display:none">0</span>
                    ${isTelegramUser ? `<div class="tg-badge" title="Telegram пользователь">TG</div>` : ''}
                </div>
            </div>
        </div>

        <!-- Banner -->
        <div class="banner fade-in" style="animation-delay:0.1s">
            <h2>🍵 Добро пожаловать, ${firstName}!</h2>
            <p>${isTelegramUser ? 'Рады видеть вас снова!' : 'Аутентичный китайский чай с доставкой'}</p>
            <a href="#" class="banner-button" onclick="showFullCatalog(); return false;">Смотреть каталог</a>
        </div>

        <!-- Navigation -->
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

        <!-- Popular -->
        <div class="products-section fade-in" style="animation-delay:0.3s">
            <h2 class="section-title"><i class="fas fa-fire"></i> Популярное</h2>
            <div class="products-grid" id="popular-products"></div>
        </div>

        <!-- cart footer -->
        <div class="cart-footer fade-in" style="animation-delay:0.4s">
            <div class="cart-content">
                <div class="cart-total" id="cart-total">Корзина пуста</div>
                <button class="checkout-button" id="checkout-btn" onclick="checkout()" disabled>Оформить заказ</button>
            </div>
        </div>

        <!-- modals placeholders -->
        <div id="cart-modal" class="modal"></div>
        <div id="product-modal" class="modal"></div>
        <div id="order-modal" class="modal"></div>
        <div id="profile-modal" class="modal"></div>
        <div id="catalog-modal" class="modal"></div>
    `;

    loadPopularProducts();
    updateCart();
}

// =========================
// POPULAR LIST
// =========================
function loadPopularProducts(){
    // build counts
    const counts = {};
    teaCatalog.forEach(t => counts[String(t.id)] = popularity[String(t.id)] || 0);
    const sorted = [...teaCatalog].sort((a,b) => {
        const pa = counts[String(a.id)]||0; const pb = counts[String(b.id)]||0;
        if (pa !== pb) return pb - pa;
        return a.id - b.id;
    });
    const popular = sorted.slice(0,4);
    const container = document.getElementById('popular-products');
    if (!container) return;
    container.innerHTML = popular.map(t => `
        <div class="product-card" onclick="showProduct(${t.id})">
            <div class="product-image ${getTeaTypeClass(t.type)}">
                ${t.tag ? `<div class="product-tag">${t.tag}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${t.name}</h3>
                <div class="product-subtitle">${t.subtitle}</div>
                <div class="product-price">${t.price}₽</div>
                <button class="product-button" onclick="event.stopPropagation(); addToCart(${t.id});">+ В корзину</button>
            </div>
        </div>
    `).join('');
}

// =========================
// MODALS: open/close helpers
// =========================
function closeAllModals(){
    document.querySelectorAll('.modal').forEach(m => { m.style.display = 'none'; m.classList.remove('bottom-sheet'); m.onclick = null; });
}
function closeModalById(id){
    const m = document.getElementById(id);
    if (m) { m.style.display='none'; m.classList.remove('bottom-sheet'); m.onclick = null; }
}

// =========================
// CATALOG (список всех товаров)
// =========================
function showFullCatalog(){
    closeAllModals();
    const modal = document.getElementById('catalog-modal');
    if (!modal) return;
    modal.classList.add('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content" style="max-height:85vh; overflow:auto;">
            <div class="modal-header">
                <h3><i class="fas fa-list"></i> Каталог</h3>
                <button class="modal-close" onclick="closeAllModals()">×</button>
            </div>
            <div class="modal-body" style="padding:10px;">
                ${teaCatalog.map(t => `
                    <div class="catalog-item" onclick="showProduct(${t.id})" style="padding:12px;border-radius:10px;display:flex;gap:12px;align-items:center;margin-bottom:10px;background:#fff;">
                        <div style="width:64px;height:64px;border-radius:10px;display:flex;align-items:center;justify-content:center;" class="tea-icon ${getTeaTypeClass(t.type)}"><i class="fas fa-leaf"></i></div>
                        <div style="flex:1;">
                            <div style="font-weight:700;">${t.name}</div>
                            <div style="color:#666;font-size:14px;">${t.subtitle}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:#4CAF50;font-weight:700;margin-bottom:8px;">${t.price}₽</div>
                            <button onclick="event.stopPropagation(); addToCart(${t.id}); showToast('Добавлено в корзину');" style="padding:6px 10px;border-radius:10px;background:#4CAF50;color:white;border:none;cursor:pointer;">+ Добавить</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    modal.onclick = (e)=> { if (e.target === modal) closeAllModals(); };
}

// =========================
// PRODUCT CARD (детали товара)
// =========================
function showProduct(productId){
    // Закрываем другие модалки, но если каталог открыт — закроем его (чтобы не было наложения)
    closeAllModals();
    const product = teaCatalog.find(p => p.id === productId);
    if (!product) return;
    const modal = document.getElementById('product-modal');
    modal.classList.add('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-leaf"></i> ${product.name}</h3>
                <button class="modal-close" onclick="closeAllModals()">×</button>
            </div>
            <div class="modal-body">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <div style="font-weight:700;">${product.subtitle}</div>
                    <div style="background:#4CAF50;color:#fff;padding:6px 10px;border-radius:12px;font-weight:700;">${product.type}</div>
                </div>
                ${product.tag ? `<div style="background:#FF9800;color:white;padding:6px 8px;border-radius:8px;display:inline-block;margin-bottom:12px;">${product.tag}</div>` : ''}
                <div style="background:#f8f9fa;padding:12px;border-radius:8px;margin-bottom:12px;">
                    <h4 style="margin:0 0 8px 0;color:#333;">Описание:</h4>
                    <p style="margin:0;color:#666;line-height:1.5;">${product.description}</p>
                </div>
                <div style="margin-bottom:12px;">
                    <h4 style="margin:0 0 8px 0;color:#333;">🍶 Способ заваривания:</h4>
                    <ul style="margin:0;color:#666;padding-left:20px;line-height:1.6;">
                        ${product.brewing.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>
                <div style="margin-bottom:12px;">
                    <h4 style="margin:0 0 8px 0;color:#333;">🌿 Полезные свойства:</h4>
                    <ul style="margin:0;color:#666;padding-left:20px;line-height:1.6;">
                        ${product.benefits ? product.benefits.map(b => `<li>${b}</li>`).join('') : ''}
                    </ul>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid #eee;">
                    <div style="font-size:20px;font-weight:700;color:#4CAF50;">${product.price}₽</div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="addToCart(${product.id})" style="padding:10px 14px;border-radius:10px;background:linear-gradient(135deg,#4CAF50,#2E7D32);color:white;border:none;cursor:pointer;">Добавить</button>
                        <button onclick="showFullCatalog()" style="padding:10px 14px;border-radius:10px;background:#eee;border:none;cursor:pointer;">Каталог</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    modal.onclick = (e) => { if (e.target === modal) closeAllModals(); };
}

// =========================
// CART: открыть/обновить/удаление/очистка
// =========================
function showCartModal(){
    closeAllModals();
    const modal = document.getElementById('cart-modal');
    modal.classList.add('bottom-sheet');
    const total = cart.reduce((s,i)=> s + (i.price * i.quantity), 0);
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-shopping-cart"></i> Корзина</h3>
                <button class="modal-close" onclick="closeAllModals()">×</button>
            </div>
            <div class="modal-body">
                <div style="max-height:40vh;overflow:auto;margin-bottom:12px;">
                    ${cart.length === 0 ? `<div style="text-align:center;padding:40px 10px;color:#888;"><i class="fas fa-box-open" style="font-size:42px;color:#ddd;"></i><div>Корзина пуста</div></div>` : cart.map(item => `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-radius:10px;background:#f8f9fa;margin-bottom:10px;">
                            <div style="flex:1;">
                                <div style="font-weight:700;">${item.name}</div>
                                <div style="color:#666;font-size:13px;">${item.type} • ${item.price}₽/шт</div>
                            </div>
                            <div style="display:flex;align-items:center;gap:10px;">
                                <button onclick="updateQuantity(${item.id}, -1)" style="width:32px;height:32px;border-radius:50%;border:none;background:#eee;cursor:pointer;">-</button>
                                <div style="min-width:28px;text-align:center;font-weight:700;">${item.quantity}</div>
                                <button onclick="updateQuantity(${item.id}, 1)" style="width:32px;height:32px;border-radius:50%;border:none;background:#4CAF50;color:white;cursor:pointer;">+</button>
                                <div style="min-width:70px;text-align:right;font-weight:700;color:#4CAF50;margin-left:8px;">${item.price * item.quantity}₽</div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:2px solid #e9f5ee;">
                    <div style="font-weight:700;font-size:18px;">Итого: <span style="color:#4CAF50;">${total}₽</span></div>
                    <div style="display:flex;gap:10px;">
                        <button onclick="clearCart()" style="padding:10px 12px;border-radius:10px;background:#f44336;color:white;border:none;cursor:pointer;">Очистить</button>
                        <button onclick="checkout()" style="padding:10px 14px;border-radius:10px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;cursor:pointer;" ${cart.length===0 ? 'disabled' : ''}>Оформить</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    modal.onclick = (e)=> { if (e.target === modal) closeAllModals(); };
}

// Изменение количества товара (спрашиваем подтверждение при удалении)
async function updateQuantity(productId, delta){
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    const newQty = (item.quantity || 0) + delta;
    if (newQty <= 0){
        const ok = await showConfirm(`Удалить "${item.name}" из корзины?`);
        if (!ok) return;
        cart = cart.filter(i => i.id !== productId);
    } else {
        item.quantity = newQty;
    }
    await saveCart();
    createToast('Корзина обновлена');
    showCartModal();
}

// Добавить товар в корзину
async function addToCart(productId){
    const p = teaCatalog.find(t => t.id === productId);
    if (!p) return;
    const ex = cart.find(i=> i.id === productId);
    if (ex) ex.quantity += 1;
    else cart.push({ id: p.id, name: p.name, price: p.price, type: p.type, quantity: 1 });
    await saveCart();
    createToast(`✅ ${p.name} добавлен в корзину`);
    // обновляем UI
    updateCart();
}

// Очистка корзины с подтверждением
async function clearCart(){
    if (!cart || cart.length === 0){ createToast('Корзина уже пуста'); return; }
    const ok = await showConfirm('Очистить всю корзину? Это действие необратимо.');
    if (!ok) return;
    cart = [];
    await saveCart();
    updateCart();
    createToast('Корзина очищена');
}

// Обновление отображения корзины в UI
function updateCart(){
    const totalItems = cart.reduce((s,i)=> s + (i.quantity||0), 0);
    const totalPrice = cart.reduce((s,i)=> s + ((i.price||0)*(i.quantity||0)), 0);
    const badge = document.querySelector('.cart-badge'); if (badge){ badge.textContent = totalItems; badge.style.display = totalItems>0 ? 'flex' : 'none'; }
    const count = document.querySelector('.cart-count'); if (count) count.textContent = totalItems;
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    if (cartTotal && checkoutBtn){
        if (totalItems > 0){
            cartTotal.innerHTML = `Итого: <span>${totalPrice}₽</span>`;
            checkoutBtn.textContent = `Оформить (${totalItems})`;
            checkoutBtn.disabled = false;
        } else {
            cartTotal.innerHTML = `Корзина пуста`;
            checkoutBtn.textContent = `Добавьте товары`;
            checkoutBtn.disabled = true;
        }
    }
}

// =========================
// CHECKOUT: сохранить заказ, скопировать текст, открыть чат @ivan_likhov
// =========================
async function checkout(){
    if (!cart || cart.length === 0){ createToast('Добавьте товары в корзину'); return; }
    const ok = await showConfirm('Подтвердить оформление заказа?');
    if (!ok) return;
    const total = cart.reduce((s,i)=> s + i.price * i.quantity, 0);
    const order = { id: Date.now(), user_id: userId, user_name: userData.first_name || 'Гость', cart: [...cart], total, timestamp: new Date().toISOString() };
    await saveOrder(order);

    // формируем текст
    const lines = [];
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

    // копируем в буфер
    let copied = false;
    try {
        if (navigator.clipboard && navigator.clipboard.writeText){
            await navigator.clipboard.writeText(orderText);
            copied = true;
        }
    } catch(e){ log('clipboard failed', e); }

    // открываем чат менеджера
    const managerUrl = 'https://t.me/ivan_likhov';
    try { if (tg && tg.openLink) tg.openLink(managerUrl); else window.open(managerUrl, '_blank'); } catch(e){ window.open(managerUrl, '_blank'); }

    if (copied) {
        createToast('Текст заказа скопирован в буфер. Перейдите в чат @ivan_likhov и вставьте его.');
    } else {
        // показываем модал с текстом для ручного копирования
        showOrderCopyModal(orderText);
    }

    // очистим корзину локально
    cart = [];
    await saveCart();
    updateCart();
    closeAllModals();
}

// fallback: показать текст заказа в модалке для копирования
function showOrderCopyModal(text){
    closeAllModals();
    const modal = document.getElementById('order-modal');
    modal.classList.remove('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-paper-plane"></i> Текст заказа</h3>
                <button class="modal-close" onclick="closeAllModals()">×</button>
            </div>
            <div class="modal-body">
                <textarea id="order-copy-area" style="width:100%;height:220px;border-radius:8px;padding:10px;">${text}</textarea>
                <div style="display:flex;gap:10px;margin-top:12px;">
                    <button onclick="copyOrderText()" style="flex:1;padding:10px;border-radius:8px;background:#4CAF50;color:white;border:none;cursor:pointer;">Копировать</button>
                    <button onclick="(tg && tg.openLink ? tg.openLink('https://t.me/ivan_likhov') : window.open('https://t.me/ivan_likhov'))" style="flex:1;padding:10px;border-radius:8px;background:#2196F3;color:white;border:none;cursor:pointer;">Открыть чат</button>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

async function copyOrderText(){
    const area = document.getElementById('order-copy-area');
    if (!area) return;
    try {
        await navigator.clipboard.writeText(area.value);
        createToast('Скопировано! Откройте чат @ivan_likhov и вставьте сообщение.');
    } catch(e){
        area.select();
        document.execCommand('copy');
        createToast('Скопировано (fallback).');
    }
}

// =========================
// ORDERS: просмотр истории
// =========================
async function showOrders(){
    closeAllModals();
    const orders = await loadOrders();
    const modal = document.getElementById('order-modal');
    modal.classList.add('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-box"></i> История заказов</h3>
                <button class="modal-close" onclick="closeAllModals()">×</button>
            </div>
            <div class="modal-body">
                ${orders.length === 0 ? `<div style="text-align:center;padding:40px;color:#888;"><i class="fas fa-box-open" style="font-size:42px;color:#ddd"></i><div>Заказов пока нет</div></div>` :
                `<div style="max-height:60vh;overflow:auto;">
                    ${orders.slice().reverse().map((o, idx) => `
                        <div style="background:#f8f9fa;padding:12px;border-radius:10px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <div style="font-weight:700;">Заказ #${o.id}</div>
                                <div style="color:#666;font-size:13px;">${new Date(o.timestamp).toLocaleString('ru-RU')}</div>
                                <div style="color:#888;font-size:13px;">Товаров: ${o.cart.reduce((s,i)=>s + i.quantity, 0)}</div>
                            </div>
                            <div style="text-align:right;display:flex;flex-direction:column;gap:8px;">
                                <div style="font-weight:700;color:#4CAF50;">${o.total}₽</div>
                                <div style="display:flex;gap:8px;">
                                    <button onclick="showOrderDetails(${o.id})" style="padding:6px 8px;border-radius:8px;border:none;background:#fff;cursor:pointer;">Открыть</button>
                                    <button onclick="reorder(${o.id})" style="padding:6px 8px;border-radius:8px;border:none;background:#4CAF50;color:white;cursor:pointer;">Повторить</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>`}
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    modal.onclick = (e) => { if (e.target === modal) closeAllModals(); };
}

// открыть детали заказа
async function showOrderDetails(orderId){
    const orders = await loadOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) { createToast('Заказ не найден'); return; }
    const modal = document.getElementById('order-modal');
    modal.classList.remove('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-receipt"></i> Заказ #${order.id}</h3>
                <button class="modal-close" onclick="showOrders()">← Назад</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom:12px;"><strong>Покупатель:</strong> ${order.user_name}</div>
                <div style="margin-bottom:12px;"><strong>Сумма:</strong> ${order.total}₽</div>
                <div style="margin-bottom:12px;"><strong>Товары:</strong>
                    <ul style="padding-left:18px;margin:6px 0;">
                        ${order.cart.map(i => `<li>${i.name} × ${i.quantity} (${i.price}₽)</li>`).join('')}
                    </ul>
                </div>
                <div style="display:flex;gap:8px;">
                    <button onclick="copyOrderDetails(${order.id})" style="flex:1;padding:10px;border-radius:8px;background:#4CAF50;color:white;border:none;cursor:pointer;">Копировать</button>
                    <button onclick="reorder(${order.id})" style="flex:1;padding:10px;border-radius:8px;background:#2196F3;color:white;border:none;cursor:pointer;">Повторить заказ</button>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    modal.onclick = (e) => { if (e.target === modal) closeAllModals(); };
}

// копировать текст заказа
async function copyOrderDetails(orderId){
    const orders = await loadOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return createToast('Заказ не найден');
    const lines = [];
    lines.push(`Заказ #${order.id}`);
    lines.push(`Покупатель: ${order.user_name} ${userData.username ? `(${userData.username})` : ''}`);
    lines.push(`Сумма: ${order.total}₽`);
    lines.push('Товары:');
    order.cart.forEach(it => lines.push(` - ${it.name} × ${it.quantity} (${it.price}₽)`));
    const txt = lines.join('\n');
    try { await navigator.clipboard.writeText(txt); createToast('Скопировано'); } catch(e){ createToast('Не удалось скопировать'); }
}

// повторить заказ (копирует текст и открывает чат)
async function reorder(orderId){
    const orders = await loadOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return createToast('Заказ не найден');
    const lines = [];
    lines.push(`Новый заказ (повтор) #${Date.now()}`);
    lines.push(`Покупатель: ${userData.first_name || 'Гость'} ${userData.username ? `(${userData.username})` : ''}`);
    lines.push(`Сумма: ${order.total}₽`);
    lines.push('Товары:');
    order.cart.forEach(it => lines.push(` - ${it.name} × ${it.quantity} (${it.price}₽)`));
    lines.push('');
    lines.push('Пожалуйста, укажите адрес и контакты для доставки и отправьте сообщение.');
    lines.push('Адрес: ');
    const txt = lines.join('\n');
    let copied = false;
    try { await navigator.clipboard.writeText(txt); copied = true; } catch(e){ log('clipboard', e); }
    const managerUrl = 'https://t.me/ivan_likhov';
    try { if (tg && tg.openLink) tg.openLink(managerUrl); else window.open(managerUrl, '_blank'); } catch(e){ window.open(managerUrl, '_blank'); }
    if (copied) createToast('Текст заказа скопирован. Вставьте в чат менеджера.');
    else showOrderCopyModal(txt);
}

// =========================
// PROFILE
// =========================
function showProfile(){
    closeAllModals();
    const modal = document.getElementById('profile-modal');
    const photo = userData && userData.photo_url ? userData.photo_url : '';
    const firstName = (userData && userData.first_name) ? userData.first_name : 'Гость';
    const lastName = (userData && userData.last_name) ? userData.last_name : '';
    const username = (userData && userData.username) ? `@${userData.username}` : '';
    const fullName = `${firstName} ${lastName}`.trim();

    modal.classList.remove('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user"></i> Мой профиль</h3>
                <button class="modal-close" onclick="closeAllModals()">×</button>
            </div>
            <div class="modal-body">
                <div style="text-align:center;margin-bottom:20px;">
                    <div style="width:100px;height:100px;margin:0 auto 12px;border-radius:50%;overflow:hidden;border:3px solid #4CAF50;display:flex;align-items:center;justify-content:center;background:${photo ? 'transparent' : 'linear-gradient(135deg,#667eea,#764ba2)'};">
                        ${photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;">` : (firstName.charAt(0) || 'G')}
                    </div>
                    <h3 style="margin:0 0 6px 0;">${fullName}</h3>
                    ${username ? `<p style="color:#666;margin:6px 0;">${username}</p>` : ''}
                    ${userData && userData.id ? `<p style="color:#999;font-size:13px;margin-top:6px;">ID: ${userData.id}</p>` : ''}
                </div>

                <div style="background:#f8f9fa;padding:14px;border-radius:12px;margin-bottom:12px;">
                    <h4 style="margin:0 0 8px 0;color:#333;"><i class="fas fa-headset"></i> Контакты поддержки</h4>
                    <div style="margin-top:6px;">
                        <div style="background:white;padding:10px;border-radius:8px;margin-bottom:8px;">
                            <div style="font-weight:700;">Telegram:</div>
                            <a href="https://t.me/ivan_likhov" target="_blank" style="color:#4CAF50;text-decoration:none;">@ivan_likhov</a>
                        </div>
                        <div style="background:white;padding:10px;border-radius:8px;">
                            <div style="font-weight:700;">Телефон:</div>
                            <a href="tel:+79038394670" style="color:#4CAF50;text-decoration:none;">+7 (903) 839-46-70</a>
                        </div>
                    </div>
                </div>

                <div style="background:#f8f9fa;padding:14px;border-radius:12px;">
                    <h4 style="margin:0 0 8px 0;color:#333;"><i class="fas fa-clock"></i> Часы работы</h4>
                    <div>Пн–Вс: <strong>09:00 - 21:00</strong></div>
                    <div style="color:#888;font-size:13px;margin-top:8px;">Принимаем заказы 24/7</div>
                </div>

                <button onclick="openChannel()" style="width:100%;padding:12px;margin-top:14px;background:linear-gradient(135deg,#4CAF50,#2E7D32);color:white;border:none;border-radius:10px;cursor:pointer;"><i class="fab fa-telegram"></i> Наш телеграм-канал</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    modal.onclick = (e) => { if (e.target === modal) closeAllModals(); };
}

function openChannel(){
    const url = 'https://t.me/teatea_bar';
    if (tg && tg.openLink) tg.openLink(url); else window.open(url, '_blank');
}

// =========================
// SYNC: check Cloud vs Local
// =========================
async function checkAndSyncData(){
    if (!userId) userId = generateUserId();
    if (userData && userData.id && tg && tg.CloudStorage){
        try {
            const cloudCart = await new Promise(res => tg.CloudStorage.getItem('cart', (err,val)=> res(!err && val ? val : null)));
            if (cloudCart){
                const parsed = JSON.parse(cloudCart);
                const local = localStorage.getItem(APP_KEYS.CART_KEY(userId));
                if (!local || (Array.isArray(parsed) && parsed.length > JSON.parse(local).length)){
                    cart = parsed;
                    await saveCart();
                    updateCart();
                    createToast('Корзина синхронизирована из облака');
                }
            }
        } catch(e){ log('sync error', e); }
    }
}

// =========================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// =========================
async function initApp(){
    try {
        log('initApp start');
        // обновляем tg если поздно подхватили
        if (!tg && window.Telegram && window.Telegram.WebApp) tg = window.Telegram.WebApp;
        try { if (tg) { tg.ready && tg.ready(); tg.expand && tg.expand(); tg.setHeaderColor && tg.setHeaderColor('#4CAF50'); tg.setBackgroundColor && tg.setBackgroundColor('#f0f4f7'); } } catch(e){ log('tg init warnings', e); }
        userData = await getUserData();
        userId = generateUserId();
        await loadPopularity();
        await loadCart();
        await loadOrders(); // preload
        showMainInterface();
        // скрываем loader если он есть
        const loader = document.getElementById('loader');
        if (loader){ loader.style.opacity = '0'; setTimeout(()=> loader.style.display='none', 420); }
        setTimeout(checkAndSyncData, 1600);
        log('initApp done');
    } catch(e){
        console.error('initApp error', e);
        // покажем сообщение в загрузчике, если есть
        const ls = document.getElementById('loader-status');
        if (ls) ls.textContent = 'Ошибка при инициализации — откройте консоль (F12).';
        const app = document.getElementById('app'); if (app) app.style.display = 'block';
    }
}

// =========================
// Вспомогательные экспорты (для onclick в HTML)
// =========================
window.showFullCatalog = showFullCatalog;
window.showProduct = showProduct;
window.showCartModal = showCartModal;
window.showOrders = showOrders;
window.showProfile = showProfile;
window.addToCart = addToCart;
window.checkout = checkout;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.copyOrderText = copyOrderText;
window.reorder = reorder;
window.showOrderDetails = showOrderDetails;
window.copyOrderDetails = copyOrderDetails;
window.debugUser = ()=> { console.log({ userData, userId, cart, popularity }); };

// запуск
document.addEventListener('DOMContentLoaded', initApp);
window.addEventListener('beforeunload', () => { try { saveCart(); } catch(e){} });

// =========================
// Пояснение: что такое тоаст уведомление
// =========================
/*
Тоаст (toast) — это короткое всплывающее уведомление, обычно появляется в углу экрана,
автоматически исчезает через несколько секунд и не блокирует взаимодействие с интерфейсом.
В коде выше есть функция createToast(text), которая создаёт и показывает такой тоаст.
Я использую их для уведомлений вроде "Добавлено в корзину", "Скопировано" и т.п.
*/

// Конец файла
