// app.js — Обновлённый, рабочий файл
// Защищённая работа с Telegram WebApp и полная реализация каталога/заказов/корзины

/* ========== GLOBALS ========== */
let tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
let cart = [];
let userData = null;
let userId = null;
let isTelegramUser = false;
let popularity = {}; // { teaId: count }

/* ========== CATALOG ========== */
const teaCatalog = [
    { id:1, name:'ЛАО ЧА ТОУ', subtitle:'Старые чайные головы', type:'Пуэр', price:1200, description:'Насыщенный и бархатистый...', brewing:['🌿 5 гр чая на 500 мл воды','🌡 температура 95°C и выше','⏳ 3-5 минут'], benefits:['♥️ мощный антиоксидант'], tag:'Хит' },
    { id:2, name:'ХЭЙ ЦЗИНЬ', subtitle:'Черное золото', type:'Красный чай', price:950, description:'Аромат сладости...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡 85-95°C','⏳ 20-30 сек'], benefits:['❄️ согревает'], tag:'Популярное' },
    { id:3, name:'ЖОУ ГУЙ НУН СЯН', subtitle:'Мясистая корица', type:'Улун', price:1100, description:'Чай для концентрации...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡 80-90°C','⏳ 30-40 сек'], benefits:['🦋 стимулирует обмен веществ'], tag:'Рекомендуем' },
    { id:4, name:'ДЯНЬ ХУН', subtitle:'Красный чай из Юньнани', type:'Красный чай', price:850, description:'Теплый, хлебно-медовый...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡 85-95°C','⏳ 20-30 сек'], benefits:['❄️ согревает'] },
    { id:5, name:'ГАБА МАО ЧА', subtitle:'Чай-сырец', type:'Габа', price:1400, description:'В аромате жареные семечки...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡 85°C','⏳ 20-30 сек'], benefits:['♥️ полезен для сердца'], tag:'Новинка' },
    { id:6, name:'ГУ ШУ ХУН ЧА', subtitle:'Красный чай со старых деревьев', type:'Красный чай', price:1300, description:'Насыщенные медово-сливовые...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡85-90°C','⏳20-30 сек'], benefits:['❄️ согревает'] },
    { id:7, name:'ТЕ ГУАНЬ ИНЬ', subtitle:'Железная богиня', type:'Улун', price:1050, description:'Классический улун...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡85°C','⏳20-25 сек'], benefits:['👨🏻‍🦳 антиоксиданты'], tag:'Классика' },
    { id:8, name:'МО ЛИ ХУА ЧА', subtitle:'Жасмин', type:'Зеленый чай', price:900, description:'Свежий жасминовый аромат...', brewing:['🌿 5-8 гр на 150-200 мл воды','🌡70°C','⏳20-40 сек'], benefits:['🧘🏻‍♀️ снимает стресс'] }
];

function getTeaTypeClass(type) {
    const classes = { 'Пуэр':'puer','Красный чай':'red-tea','Улун':'oolong','Габа':'gaba','Зеленый чай':'green-tea' };
    return classes[type] || '';
}

/* ========== HELPERS ========== */
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
function showLoaderMessage(text){
    const status = document.getElementById('loader-status');
    if (status) status.textContent = text;
    console.log('[LOADER]', text);
}
window.onerror = function(message, source, lineno, colno, error){
    console.error('Global error caught:', message, source + ':' + lineno + ':' + colno, error);
    try {
        showLoaderMessage('Ошибка: ' + (message||'unknown') + '. Откройте консоль (F12).');
        const loader = document.getElementById('loader'); if (loader) loader.style.opacity = '0.95';
        const app = document.getElementById('app'); if (app) app.style.display = 'block';
    } catch(e){}
    return false;
};

/* ========== INIT & USER ========== */
async function initApp(){
    try {
        showLoaderMessage('Инициализация приложения...');
        if (!tg && window.Telegram && window.Telegram.WebApp) tg = window.Telegram.WebApp;
        if (tg) {
            try{ tg.ready(); }catch(e){}
            try{ tg.expand(); }catch(e){}
            try{ tg.setHeaderColor && tg.setHeaderColor('#4CAF50'); }catch(e){}
            try{ tg.setBackgroundColor && tg.setBackgroundColor('#f0f4f7'); }catch(e){}
            showLoaderMessage('Telegram WebApp инициализирован.');
            // mark telegram user if initData present
            isTelegramUser = Boolean(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe);
        } else showLoaderMessage('Работа в гостевом режиме (без Telegram).');

        userData = await getUserData();
        showLoaderMessage(`Пользователь: ${userData.first_name || 'Гость'}`);

        userId = generateUserId();

        showLoaderMessage('Загружаю настройки, корзину и заказы...');
        await loadPopularity();
        await loadCart();
        await loadOrders(); // preload (but not stored globally)
        showMainInterface();

        // hide loader
        setTimeout(()=>{ const loader = document.getElementById('loader'); if (loader) loader.style.opacity='0'; setTimeout(()=>{ if(loader) loader.style.display='none'; const app=document.getElementById('app'); if(app) app.style.display='block'; }, 400); }, 350);
    } catch (err) {
        console.error('initApp error', err);
        showLoaderMessage('Ошибка запуска — откройте консоль (F12).');
        const loader = document.getElementById('loader'); if (loader) loader.style.opacity='0.95';
        const app = document.getElementById('app'); if (app) app.style.display='block';
    }
}

async function getUserData(){
    if (window.Telegram && window.Telegram.WebApp) {
        for (let i=0;i<8;i++){
            const maybe = window.Telegram.WebApp.initDataUnsafe;
            if (maybe && maybe.user) {
                const u = maybe.user;
                return { id:u.id||null, first_name:u.first_name||'', last_name:u.last_name||'', username:u.username||'', photo_url:u.photo_url||'', is_bot:u.is_bot||false, language_code:u.language_code||'ru' };
            }
            await sleep(120);
        }
        console.log('initDataUnsafe not present after retries');
    }
    // debug param ?tgUser=...
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const tgUser = urlParams.get('tgUser');
        if (tgUser) return JSON.parse(decodeURIComponent(tgUser));
    } catch(e){ console.warn('tgUser parse failed', e); }

    return { id:null, first_name:'Гость', last_name:'', username:'', photo_url:'', is_bot:false, language_code:'ru' };
}

function generateUserId(){
    if (userData && userData.id) return `tg_${userData.id}`;
    let guest = localStorage.getItem('tutu_guest_id');
    if (!guest) { guest = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2,9); localStorage.setItem('tutu_guest_id', guest); }
    return guest;
}

/* ========== POPULARITY STORAGE ========== */
function popularityKey(){ return `tutu_popularity_${userId || 'anon'}`; }
async function loadPopularity(){
    // cloud first
    if (tg && tg.CloudStorage && userData && userData.id) {
        try {
            const cloud = await new Promise(res => { tg.CloudStorage.getItem('popularity', (err,val)=>{ if(!err && val) res(val); else res(null); }); });
            if (cloud) { popularity = JSON.parse(cloud); return; }
        } catch(e){ console.warn('pop cloud load', e); }
    }
    const saved = localStorage.getItem(popularityKey());
    popularity = saved ? JSON.parse(saved) : {};
}
async function savePopularity(){
    localStorage.setItem(popularityKey(), JSON.stringify(popularity));
    if (tg && tg.CloudStorage && userData && userData.id) {
        try { await new Promise((res,rej)=>{ tg.CloudStorage.setItem('popularity', JSON.stringify(popularity), (err)=>{ if(err) rej(err); else res(); }); }); }
        catch(e){ console.warn('pop cloud save', e); }
    }
}

/* ========== CART & ORDERS ========== */
async function loadCart(){
    if (tg && tg.CloudStorage && userData && userData.id) {
        try {
            const cloudCart = await new Promise(res => { tg.CloudStorage.getItem('cart', (err,val)=>{ if(!err && val) res(val); else res(null); }); });
            if (cloudCart) {
                try { cart = JSON.parse(cloudCart); return; } catch(e){ console.warn('parse cloud cart', e); }
            }
        } catch(e){ console.warn('cloud cart error', e); }
    }
    const key = `tutu_cart_${userId}`;
    const saved = localStorage.getItem(key);
    cart = saved ? JSON.parse(saved) : [];
}

async function saveCart(){
    const key = `tutu_cart_${userId}`;
    localStorage.setItem(key, JSON.stringify(cart));
    if (tg && tg.CloudStorage && userData && userData.id) {
        try { await new Promise((res,rej)=>{ tg.CloudStorage.setItem('cart', JSON.stringify(cart), (err)=>{ if(err) rej(err); else res(); }); }); } catch(e){ console.warn('cloud saveCart', e); }
    }
    localStorage.setItem('tutu_cart_backup', JSON.stringify({ userId, cart, timestamp:new Date().toISOString()}));
    updateCart();
}

async function loadOrders(){ // returns array but not stored globally
    if (tg && tg.CloudStorage && userData && userData.id) {
        try {
            const cloud = await new Promise(res => { tg.CloudStorage.getItem('orders', (err,val)=>{ if(!err && val) res(val); else res(null); }); });
            if (cloud) { try { return JSON.parse(cloud); } catch(e){ console.warn('parse cloud orders', e); } }
        } catch(e){ console.warn('cloud orders', e); }
    }
    const key = `tutu_orders_${userId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
}

async function saveOrder(order){
    const orders = await loadOrders();
    orders.push(order);
    const key = `tutu_orders_${userId}`;
    localStorage.setItem(key, JSON.stringify(orders));
    if (tg && tg.CloudStorage && userData && userData.id) {
        try { await new Promise((res,rej)=>{ tg.CloudStorage.setItem('orders', JSON.stringify(orders), (err)=>{ if(err) rej(err); else res(); }); }); } catch(e){ console.warn('cloud saveOrder', e); }
    }
    updatePopularityFromOrder(order);
    await savePopularity();
}

function updatePopularityFromOrder(order){
    if (!order || !Array.isArray(order.cart)) return;
    order.cart.forEach(it => {
        const id = String(it.id);
        const qty = +it.quantity || 1;
        popularity[id] = (popularity[id] || 0) + qty;
    });
}

/* ========== UI: main, popular, catalog, product, cart, orders ========== */

function showMainInterface(){
    const app = document.getElementById('app');
    const firstName = (userData && userData.first_name) ? userData.first_name : 'Гость';
    const lastName = (userData && userData.last_name) ? userData.last_name : '';
    const fullName = `${firstName} ${lastName}`.trim();
    const username = (userData && userData.username) ? `@${userData.username}` : '';
    const hasPhoto = userData && userData.photo_url && userData.photo_url.trim() !== '';

    app.innerHTML = `
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

        <div class="banner fade-in" style="animation-delay:0.1s">
            <h2>🍵 Добро пожаловать, ${firstName}!</h2>
            <p>${isTelegramUser ? 'Рады видеть вас снова!' : 'Аутентичный китайский чай с доставкой'}</p>
            <a href="#" class="banner-button" onclick="showFullCatalog(); return false;">Смотреть каталог</a>
        </div>

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

        <div class="products-section fade-in" style="animation-delay:0.3s">
            <h2 class="section-title"><i class="fas fa-fire"></i> Популярное</h2>
            <div class="products-grid" id="popular-products"></div>
        </div>

        <div class="cart-footer fade-in" style="animation-delay:0.4s">
            <div class="cart-content">
                <div class="cart-total" id="cart-total">Корзина пуста</div>
                <button class="checkout-button" id="checkout-btn" onclick="checkout()" disabled>Оформить заказ</button>
            </div>
        </div>

        <div id="cart-modal" class="modal"></div>
        <div id="product-modal" class="modal"></div>
        <div id="order-modal" class="modal"></div>
        <div id="profile-modal" class="modal"></div>
        <div id="catalog-modal" class="modal"></div>
    `;
    loadPopularProducts();
    updateCart();
}

function loadPopularProducts(){
    const counts = {};
    teaCatalog.forEach(t => counts[String(t.id)] = popularity[String(t.id)] || 0);
    const sorted = [...teaCatalog].sort((a,b) => {
        const pa = counts[String(a.id)]||0; const pb = counts[String(b.id)]||0;
        if (pa !== pb) return pb - pa;
        return a.id - b.id;
    });
    const popular = sorted.slice(0,4);
    const container = document.getElementById('popular-products');
    container.innerHTML = popular.map(t => `
        <div class="product-card" onclick="showProduct(${t.id})">
            <div class="product-image ${getTeaTypeClass(t.type)}">${t.tag?`<div class="product-tag">${t.tag}</div>`:''}</div>
            <div class="product-info">
                <h3 class="product-name">${t.name}</h3>
                <div class="product-subtitle">${t.subtitle}</div>
                <div class="product-price">${t.price}₽</div>
                <button class="product-button" onclick="event.stopPropagation(); addToCart(${t.id});">+ В корзину</button>
            </div>
        </div>
    `).join('');
}

/* ========== CATALOG ========== */
function showFullCatalog(){
    const modal = document.getElementById('catalog-modal');
    modal.classList.add('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content" style="max-height:85vh; overflow-y:auto;">
            <div class="modal-header">
                <h3><i class="fas fa-list"></i> Каталог</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body" style="padding:10px;">
                ${teaCatalog.map(t => `
                    <div class="catalog-item" onclick="showProduct(${t.id})" style="padding:12px;border-radius:10px;display:flex;gap:12px;align-items:center;margin-bottom:10px;background:white;box-shadow:0 4px 10px rgba(0,0,0,0.04);">
                        <div style="width:64px;height:64px;border-radius:10px;display:flex;align-items:center;justify-content:center;" class="tea-icon ${getTeaTypeClass(t.type)}"><i class="fas fa-leaf"></i></div>
                        <div style="flex:1;">
                            <div style="font-weight:700;">${t.name}</div>
                            <div style="color:#666;font-size:14px;">${t.subtitle}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="color:#4CAF50;font-weight:700;margin-bottom:8px;">${t.price}₽</div>
                            <button onclick="event.stopPropagation(); addToCart(${t.id}); showFullCatalog();" style="padding:6px 10px;border-radius:10px;background:#4CAF50;color:white;border:none;cursor:pointer;">+ Добавить</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    modal.onclick = (e)=>{ if (e.target === modal) closeModal(); };
}

/* ========== PRODUCT DETAILS ========== */
function showProduct(productId){
    const product = teaCatalog.find(p => p.id === productId);
    if (!product) return;
    const modal = document.getElementById('product-modal');
    modal.classList.add('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-leaf"></i> ${product.name}</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <div style="font-weight:700;">${product.subtitle}</div>
                    <div style="background:#4CAF50;color:white;padding:5px 10px;border-radius:12px;font-weight:700;">${product.type}</div>
                </div>
                ${product.tag ? `<div style="background:#FF9800;color:white;padding:6px 10px;border-radius:8px;display:inline-block;margin-bottom:12px;">${product.tag}</div>` : ''}
                <div style="background:#f8f9fa;padding:12px;border-radius:8px;margin-bottom:12px;">
                    <h4 style="margin:0 0 8px 0;color:#333;">Описание:</h4>
                    <p style="margin:0;color:#666;line-height:1.5;">${product.description}</p>
                </div>
                <div style="margin-bottom:12px;">
                    <h4 style="margin:0 0 8px 0;color:#333;">🍶 Способ заваривания:</h4>
                    <ul style="margin:0 0 0 18px;color:#666;">${product.brewing.map(b=>`<li>${b}</li>`).join('')}</ul>
                </div>
                <div style="margin-bottom:12px;">
                    <h4 style="margin:0 0 8px 0;color:#333;">🌿 Полезные свойства:</h4>
                    <ul style="margin:0 0 0 18px;color:#666;">${product.benefits.map(b=>`<li>${b}</li>`).join('')}</ul>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #eee;">
                    <div style="font-size:20px;font-weight:700;color:#4CAF50;">${product.price}₽</div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="addToCart(${product.id}); try{tg && tg.showAlert && tg.showAlert('Добавлено в корзину');}catch(e){}" style="padding:10px 14px;border-radius:12px;background:#2E7D32;color:white;border:none;cursor:pointer;font-weight:700;">Добавить и остаться</button>
                        <button onclick="addToCart(${product.id}); showFullCatalog();" style="padding:10px 14px;border-radius:12px;background:#4CAF50;color:white;border:none;cursor:pointer;font-weight:700;">Добавить и в каталог</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    modal.onclick = (e)=>{ if (e.target === modal) closeModal(); };
}

/* ========== CART UI ========== */
function showCartModal(){
    if (!cart || cart.length === 0) {
        try { tg && tg.showAlert && tg.showAlert('🛒 Корзина пуста'); } catch(e){ alert('Корзина пуста'); }
        return;
    }
    const modal = document.getElementById('cart-modal');
    const total = cart.reduce((s,i)=>s + i.price * i.quantity, 0);
    modal.classList.remove('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-shopping-cart"></i> Корзина</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="max-height:45vh;overflow-y:auto;margin-bottom:12px;">
                    ${cart.map(item => `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-radius:8px;margin-bottom:8px;background:#f8f9fa;">
                            <div style="flex:1;">
                                <div style="font-weight:700;">${item.name}</div>
                                <div style="color:#666;font-size:13px;">${item.type} • ${item.price}₽/шт</div>
                            </div>
                            <div style="display:flex;align-items:center;gap:8px;">
                                <button onclick="updateQuantity(${item.id}, -1)" style="width:30px;height:30px;border-radius:50%;border:none;background:#eee;cursor:pointer;">-</button>
                                <div style="min-width:26px;text-align:center;font-weight:700;">${item.quantity}</div>
                                <button onclick="updateQuantity(${item.id}, 1)" style="width:30px;height:30px;border-radius:50%;border:none;background:#4CAF50;color:white;cursor:pointer;">+</button>
                            </div>
                            <div style="width:80px;text-align:right;font-weight:700;color:#4CAF50;">${item.quantity * item.price}₽</div>
                        </div>
                    `).join('')}
                </div>
                <div style="border-top:2px solid #eee;padding-top:12px;display:flex;justify-content:space-between;align-items:center;">
                    <div style="font-weight:700;font-size:16px;">Итого: <span style="color:#4CAF50;">${total}₽</span></div>
                    <button onclick="checkout()" style="padding:10px 16px;border-radius:10px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;cursor:pointer;font-weight:700;">
                        Оформить (${cart.reduce((s,i)=>s+i.quantity,0)})
                    </button>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    modal.onclick = (e)=>{ if (e.target === modal) closeModal(); };
}

function updateQuantity(productId, delta){
    const item = cart.find(i=>i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i=>i.id !== productId);
    }
    saveCart();
    try{ tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred('light'); } catch(e){}
    if (cart.length === 0) closeModal(); else showCartModal();
}

/* ========== CART LOGIC ========== */
function addToCart(productId){
    const product = teaCatalog.find(p=>p.id === productId);
    if (!product) return;
    const existing = cart.find(i=>i.id === productId);
    if (existing) existing.quantity += 1;
    else cart.push({ id:product.id, name:product.name, price:product.price, type:product.type, quantity:1 });
    saveCart();
    try{ tg && tg.showAlert && tg.showAlert(`✅ ${product.name} добавлен в корзину!`); } catch(e){}
}

/* ========== UPDATE CART DISPLAY ========== */
function updateCart(){
    const totalItems = cart.reduce((s,i)=>s + (i.quantity||0), 0);
    const totalPrice = cart.reduce((s,i)=>s + ((i.price||0) * (i.quantity||0)), 0);
    const cartBadge = document.querySelector('.cart-badge'); if (cartBadge){ cartBadge.textContent = totalItems; cartBadge.style.display = totalItems>0 ? 'flex' : 'none'; }
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

/* ========== CHECKOUT: copy text & open manager chat ========== */
async function checkout(){
    if (!cart || cart.length === 0) { try{ tg && tg.showAlert && tg.showAlert('Добавьте товары в корзину'); }catch(e){}; return; }
    const total = cart.reduce((s,i)=>s + i.price * i.quantity, 0);
    const order = { id: Date.now(), user_id:userId, user_name: userData.first_name || 'Гость', cart:[...cart], total, timestamp: new Date().toISOString() };
    await saveOrder(order);

    // build message
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

    // try copy to clipboard
    let copied = false;
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(orderText);
            copied = true;
        }
    } catch(e){ console.warn('clipboard failed', e); }

    const managerUrl = 'https://t.me/ivan_likhov';
    try { tg && tg.openLink ? tg.openLink(managerUrl) : window.open(managerUrl, '_blank'); } catch(e){ window.open(managerUrl, '_blank'); }

    if (copied) {
        try { tg && tg.showAlert && tg.showAlert('Текст заказа скопирован в буфер. Перейдите в чат @ivan_likhov и вставьте.'); } catch(e){ alert('Текст заказа скопирован.'); }
    } else {
        showOrderCopyModal(orderText);
    }

    // clear cart locally
    cart = [];
    await saveCart();
    closeModal();
}

/* ========== ORDER COPY MODAL (fallback) ========== */
function showOrderCopyModal(text){
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
    modal.onclick = (e)=>{ if (e.target === modal) closeModal(); };
}
async function copyOrderText(){
    const area = document.getElementById('order-copy-area'); if (!area) return;
    try {
        await navigator.clipboard.writeText(area.value);
        try { tg && tg.showAlert && tg.showAlert('Скопировано! Откройте чат @ivan_likhov и вставьте сообщение.'); } catch(e){ alert('Скопировано!'); }
    } catch(e) {
        area.select(); document.execCommand('copy');
        try { tg && tg.showAlert && tg.showAlert('Скопировано (fallback).'); } catch(e){ alert('Скопировано!'); }
    }
}

/* ========== ORDERS PAGE (реализована) ========== */
async function showOrders(){
    const orders = await loadOrders();
    const modal = document.getElementById('order-modal');
    modal.classList.remove('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-box"></i> История заказов</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                ${orders.length === 0 ? `
                    <div style="text-align:center;padding:40px 20px;color:#666;">
                        <div style="font-size:48px;color:#ddd;margin-bottom:10px;"><i class="fas fa-box-open"></i></div>
                        <h4>Заказов пока нет</h4>
                        <p>Совершите первую покупку — и она появится здесь.</p>
                    </div>
                ` : `
                    <div style="max-height:60vh;overflow-y:auto;">
                        ${orders.slice().reverse().map((order, idx) => `
                            <div style="background:#f8f9fa;padding:12px;border-radius:10px;margin-bottom:12px;">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                    <div style="font-weight:700;">Заказ #${order.id}</div>
                                    <div style="color:#4CAF50;font-weight:700;">${order.total}₽</div>
                                </div>
                                <div style="color:#666;font-size:13px;margin-bottom:8px;">${new Date(order.timestamp).toLocaleString('ru-RU')}</div>
                                <div style="color:#444;margin-bottom:8px;">Товаров: ${order.cart.reduce((s,i)=>s+i.quantity,0)}</div>
                                <div style="display:flex;gap:8px;">
                                    <button onclick="showOrderDetails(${order.id})" style="padding:8px;border-radius:8px;border:none;background:#2196F3;color:white;cursor:pointer;">Детали</button>
                                    <button onclick="reorder(${order.id})" style="padding:8px;border-radius:8px;border:none;background:#4CAF50;color:white;cursor:pointer;">Повторить</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    modal.onclick = (e)=>{ if (e.target === modal) closeModal(); };
}

async function showOrderDetails(orderId){
    const orders = await loadOrders();
    const order = orders.find(o=>o.id === orderId);
    if (!order) return;
    const modal = document.getElementById('order-modal');
    modal.classList.remove('bottom-sheet');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-receipt"></i> Заказ #${order.id}</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom:10px;color:#666;">${new Date(order.timestamp).toLocaleString('ru-RU')}</div>
                <div style="margin-bottom:10px;"><strong>Сумма: </strong> ${order.total}₽</div>
                <div style="margin-bottom:12px;"><strong>Товары:</strong></div>
                <div style="max-height:40vh;overflow-y:auto;">
                    ${order.cart.map(it => `
                        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;">
                            <div><strong>${it.name}</strong><div style="color:#666;font-size:13px;">${it.quantity} × ${it.price}₽</div></div>
                            <div style="font-weight:700;color:#4CAF50;">${it.quantity * it.price}₽</div>
                        </div>
                    `).join('')}
                </div>
                <div style="display:flex;gap:8px;margin-top:12px;">
                    <button onclick="reorder(${order.id})" style="padding:10px;border-radius:8px;border:none;background:#4CAF50;color:white;cursor:pointer;">Повторить заказ</button>
                    <button onclick="copyOrderDetails(${order.id})" style="padding:10px;border-radius:8px;border:none;background:#2196F3;color:white;cursor:pointer;">Копировать текст</button>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    modal.onclick = (e)=>{ if (e.target === modal) closeModal(); };
}

async function copyOrderDetails(orderId){
    const orders = await loadOrders();
    const order = orders.find(o=>o.id===orderId);
    if (!order) return;
    const lines = [`Заказ #${order.id}`, `Сумма: ${order.total}₽`, 'Товары:'];
    order.cart.forEach(it => lines.push(` - ${it.name} × ${it.quantity} (${it.price}₽)`));
    const txt = lines.join('\n');
    try { await navigator.clipboard.writeText(txt); try{ tg && tg.showAlert && tg.showAlert('Скопировано в буфер обмена'); }catch(e){ alert('Скопировано'); } } catch(e){ alert('Не удалось скопировать'); }
}

async function reorder(orderId){
    const orders = await loadOrders();
    const order = orders.find(o=>o.id === orderId);
    if (!order) return;
    // merge into cart (increment if exists)
    order.cart.forEach(it => {
        const existing = cart.find(c => c.id === it.id);
        if (existing) existing.quantity += it.quantity;
        else cart.push({ id: it.id, name: it.name, price: it.price, type: it.type || '', quantity: it.quantity });
    });
    await saveCart();
    try{ tg && tg.showAlert && tg.showAlert('Товары добавлены в корзину'); } catch(e){}
    closeModal();
}

/* ========== PROFILE ========== */
function showProfile(){
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
                <div style="text-align:center;margin-bottom:18px;">
                    <div style="width:100px;height:100px;margin:0 auto 12px;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;border:3px solid #4CAF50;">
                        ${userPhotoUrl ? `<img src="${userPhotoUrl}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="font-size:36px;color:white;background:linear-gradient(135deg,#667eea,#764ba2);width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${firstName.charAt(0)||'G'}</div>`}
                    </div>
                    <h3 style="margin:0 0 6px 0;">${fullName}</h3>
                    ${username ? `<p style="color:#666;margin:0 0 6px 0;">${username}</p>` : ''}
                    ${userData && userData.id ? `<p style="color:#999;font-size:13px;margin:0 0 6px 0;">ID: ${userData.id}</p>` : ''}
                </div>
                <div style="background:#f8f9fa;padding:16px;border-radius:12px;margin-bottom:12px;">
                    <h4 style="margin:0 0 8px 0;color:#333;"><i class="fas fa-headset"></i> Контакты поддержки</h4>
                    <div style="margin-top:8px;">
                        <div style="margin-bottom:8px;"><strong>Telegram:</strong> <a href="https://t.me/ivan_likhov" target="_blank" style="color:#4CAF50;">@ivan_likhov</a></div>
                        <div><strong>Телефон:</strong> <a href="tel:+79038394670" style="color:#4CAF50;">+7 (903) 839-46-70</a></div>
                    </div>
                </div>
                <div style="background:#f8f9fa;padding:16px;border-radius:12px;">
                    <h4 style="margin:0 0 8px 0;color:#333;"><i class="fas fa-clock"></i> Часы работы</h4>
                    <div>Пн-Вс: <strong>09:00 - 21:00</strong></div>
                    <p style="color:#888;margin-top:8px;">Принимаем заказы 24/7 — подтверждаем вручную в рабочие часы.</p>
                </div>
                <button onclick="openChannel()" style="width:100%;padding:12px;margin-top:14px;border-radius:10px;border:none;background:linear-gradient(135deg,#4CAF50,#2E7D32);color:white;font-weight:700;cursor:pointer;"><i class="fab fa-telegram"></i> Наш телеграм-канал</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    modal.onclick = (e)=>{ if (e.target === modal) closeModal(); };
}
function openChannel(){ const url = 'https://t.me/teatea_bar'; if (tg && tg.openLink) tg.openLink(url); else window.open(url,'_blank'); }

/* ========== MODAL CLOSE ========== */
function closeModal(){
    document.querySelectorAll('.modal').forEach(m => { m.style.display = 'none'; m.classList.remove('bottom-sheet'); m.onclick = null; });
}

/* ========== SYNC CHECK ========== */
setTimeout(checkAndSyncData, 2000);
async function checkAndSyncData(){
    if (userData && userData.id && tg && tg.CloudStorage) {
        try {
            const cloudCart = await new Promise(res => { tg.CloudStorage.getItem('cart', (err,val)=>{ if(!err && val) res(val); else res(null); }); });
            if (cloudCart) {
                const parsed = JSON.parse(cloudCart);
                const key = `tutu_cart_${userId}`;
                const localCart = localStorage.getItem(key);
                if (!localCart || parsed.length > JSON.parse(localCart).length) {
                    cart = parsed;
                    await saveCart(); updateCart(); console.log('Cart synced from cloud');
                }
            }
        } catch(e){ console.warn('sync error', e); }
    }
}

/* ========== EVENTS & INIT ========== */
window.addEventListener('message', function(event){
    if (event.data && event.data.type === 'telegram_user_data') {
        userData = event.data.user;
        isTelegramUser = true;
        userId = generateUserId();
        showMainInterface();
    }
});
if (tg) { try{ tg.onEvent && tg.onEvent('viewportChanged', e=>console.log('Viewport changed', e)); }catch(e){} try{ tg.onEvent && tg.onEvent('themeChanged', ()=>console.log('Theme changed')); }catch(e){} }
document.addEventListener('DOMContentLoaded', initApp);
window.addEventListener('beforeunload', ()=>{ try{ saveCart(); }catch(e){} });

/* ========== DEBUG ========== */
function debugUser(){
    console.log({ userData, userId, isTelegramUser, cart, popularity, tg });
}
