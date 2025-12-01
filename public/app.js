// Telegram Web App инициализация
let tg = window.Telegram.WebApp;
let cart = [];
let userData = null;

// Полный каталог товаров
const teaCatalog = [
    {
        id: 1,
        name: 'Зеленый чай Лунцзин',
        description: 'Элитный зеленый чай с нежным ароматом и мягким вкусом',
        price: 800,
        category: 'green',
        weight: '50г',
        tags: ['Хит', 'Популярное'],
        imageClass: 'green'
    },
    {
        id: 2,
        name: 'Улун Те Гуань Инь',
        description: 'Полуферментированный чай с цветочным ароматом',
        price: 1200,
        category: 'oolong',
        weight: '50г',
        tags: ['Популярное'],
        imageClass: 'oolong'
    },
    {
        id: 3,
        name: 'Пуэр Шу',
        description: 'Выдержанный чай с землистым вкусом и глубоким ароматом',
        price: 1500,
        category: 'puer',
        weight: '100г',
        tags: ['Премиум'],
        imageClass: 'puer'
    },
    {
        id: 4,
        name: 'Белый чай Байхао Иньчжэнь',
        description: 'Нежный чай из молодых почек с медовым послевкусием',
        price: 2200,
        category: 'white',
        weight: '30г',
        tags: ['Элитный'],
        imageClass: 'white'
    },
    {
        id: 5,
        name: 'Красный чай Дянь Хун',
        description: 'Ароматный чай с нотами сухофруктов и меда',
        price: 950,
        category: 'red',
        weight: '50г',
        tags: ['Новинка'],
        imageClass: 'red'
    },
    {
        id: 6,
        name: 'Желтый чай Цзюнь Шань Инь Чжэнь',
        description: 'Редкий чай с мягким вкусом и тонким ароматом',
        price: 1800,
        category: 'yellow',
        weight: '40г',
        tags: ['Эксклюзив'],
        imageClass: 'yellow'
    }
];

// Функция для отладки
function debugLog(message, data = null) {
    console.log(`[DEBUG] ${message}`, data || '');
}

// Инициализация приложения
function initApp() {
    debugLog('=== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===');
    
    // Проверяем, что мы в Telegram Web App
    if (!window.Telegram || !window.Telegram.WebApp) {
        debugLog('Не в Telegram Web App. Запускаем в тестовом режиме.');
        initializeTestMode();
        return;
    }
    
    // Инициализируем Telegram Web App
    tg.ready();
    tg.expand();
    
    // Настраиваем цвета
    tg.setHeaderColor('#4CAF50');
    tg.setBackgroundColor('#f0f4f7');
    
    // Получаем данные пользователя из Telegram
    const initData = tg.initDataUnsafe;
    debugLog('Telegram initData:', initData);
    
    // Проверяем разные способы получения данных
    userData = getUserDataFromTelegram(initData);
    debugLog('Данные пользователя:', userData);
    
    // Сохраняем пользователя в localStorage
    saveUserToStorage(userData);
    
    // Загружаем корзину из localStorage
    loadCart();
    
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

// Получение данных пользователя из Telegram
function getUserDataFromTelegram(initData) {
    let user = null;
    
    // Способ 1: initDataUnsafe.user (основной)
    if (initData && initData.user) {
        user = {
            id: initData.user.id,
            first_name: initData.user.first_name || 'Гость',
            last_name: initData.user.last_name || '',
            username: initData.user.username || '',
            language_code: initData.user.language_code || 'ru',
            is_premium: initData.user.is_premium || false,
            photo_url: initData.user.photo_url || null,
            source: 'telegram_user'
        };
        debugLog('Данные получены через initData.user');
    }
    
    // Способ 2: query_id (если есть доступ)
    if (!user && initData && initData.query_id) {
        user = {
            id: 'query_' + initData.query_id.substring(0, 8),
            first_name: 'Пользователь',
            username: '',
            photo_url: null,
            source: 'telegram_query'
        };
        debugLog('Данные получены через query_id');
    }
    
    // Способ 3: auth_date (базовая информация)
    if (!user && initData && initData.auth_date) {
        user = {
            id: 'auth_' + initData.auth_date,
            first_name: 'Посетитель',
            username: '',
            photo_url: null,
            source: 'telegram_auth'
        };
        debugLog('Данные получены через auth_date');
    }
    
    // Способ 4: Загружаем сохраненные данные
    if (!user) {
        const savedUser = loadUserFromStorage();
        if (savedUser) {
            user = savedUser;
            user.source = 'local_storage';
            debugLog('Данные загружены из localStorage');
        }
    }
    
    // Способ 5: Гостевой режим
    if (!user) {
        user = {
            id: 'guest_' + Date.now(),
            first_name: 'Гость',
            username: '',
            photo_url: null,
            source: 'guest'
        };
        debugLog('Запущен гостевой режим');
    }
    
    return user;
}

// Тестовый режим (если открыто не в Telegram)
function initializeTestMode() {
    debugLog('Запуск в тестовом режиме');
    
    // Создаем тестовые данные
    userData = {
        id: 'test_' + Date.now(),
        first_name: 'Тестовый',
        last_name: 'Пользователь',
        username: 'testuser',
        photo_url: 'https://i.pravatar.cc/150?img=1',
        language_code: 'ru',
        is_premium: true,
        source: 'test_mode'
    };
    
    // Загружаем корзину
    loadCart();
    
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

// Сохраняем пользователя в localStorage
function saveUserToStorage(user) {
    const userStorage = {
        id: user.id || Date.now(),
        first_name: user.first_name || 'Гость',
        last_name: user.last_name || '',
        username: user.username || '',
        photo_url: user.photo_url || null,
        source: user.source || 'unknown',
        last_visit: new Date().toISOString(),
        total_orders: localStorage.getItem(`user_${user.id}_orders`) || 0,
        total_spent: localStorage.getItem(`user_${user.id}_spent`) || 0
    };
    
    localStorage.setItem('current_user', JSON.stringify(userStorage));
    
    // Сохраняем в историю пользователей
    let allUsers = JSON.parse(localStorage.getItem('all_users')) || [];
    const existingUserIndex = allUsers.findIndex(u => u.id === user.id);
    
    if (existingUserIndex !== -1) {
        allUsers[existingUserIndex] = userStorage;
    } else {
        allUsers.push(userStorage);
    }
    
    localStorage.setItem('all_users', JSON.stringify(allUsers));
}

// Загрузка пользователя из localStorage
function loadUserFromStorage() {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
        return JSON.parse(savedUser);
    }
    return null;
}

// Загрузка корзины
function loadCart() {
    const savedCart = localStorage.getItem('tutu_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCart();
}

// Сохранение корзины
function saveCart() {
    localStorage.setItem('tutu_cart', JSON.stringify(cart));
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
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
    
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

// Показать главный интерфейс
function showMainInterface() {
    const app = document.getElementById('app');
    
    // Определяем аватарку
    let userAvatar = getAvatarHTML(userData);
    
    // Определяем имя для приветствия
    let greetingName = userData.first_name || 'Друг';
    if (userData.last_name) {
        greetingName += ' ' + userData.last_name;
    }
    
    // Определяем username для отображения
    let usernameDisplay = '';
    if (userData.username) {
        usernameDisplay = `<p style="color: #666; font-size: 14px; margin-top: 5px;">@${userData.username}</p>`;
    }
    
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
                <div class="user-avatar" onclick="showProfile()">
                    ${userAvatar}
                    <div class="cart-badge" style="display: none; position: absolute; top: -5px; right: -5px; background: #FF5252; color: white; width: 20px; height: 20px; border-radius: 50%; font-size: 12px; align-items: center; justify-content: center;">0</div>
                </div>
            </div>
        </div>
        
        <!-- Приветствие -->
        <div class="welcome-banner fade-in" style="animation-delay: 0.1s">
            <h2 id="user-greeting">Привет, ${greetingName}!</h2>
            <p>Аутентичный китайский чай с доставкой</p>
            ${usernameDisplay}
        </div>
        
        <!-- Навигация -->
        <div class="nav-grid fade-in" style="animation-delay: 0.2s">
            <div class="nav-item" onclick="showCatalog()">
                <div class="nav-icon icon-tea">
                    <i class="fas fa-mug-hot"></i>
                </div>
                <h3>Каталог</h3>
                <p>50+ сортов чая</p>
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
                <p>${userData.username ? '@' + userData.username : 'Ваш профиль'}</p>
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
                <button class="checkout-button" id="checkout-btn" onclick="processCheckout()" disabled>
                    Оформить заказ
                </button>
            </div>
        </div>
        
        <!-- Модальные окна -->
        <div id="cart-modal" class="modal"></div>
        <div id="product-modal" class="modal"></div>
        <div id="order-modal" class="modal"></div>
        <div id="profile-modal" class="modal"></div>
        <div id="checkout-modal" class="modal"></div>
        <div id="debug-modal" class="modal"></div>
        <div id="catalog-modal" class="modal"></div>
    `;
    
    // Кнопка для отладки (только в разработке)
    if (userData.source === 'test_mode') {
        app.innerHTML += `
            <button onclick="showDebugInfo()" style="position: fixed; bottom: 80px; right: 20px; width: 50px; height: 50px; border-radius: 50%; background: #2196F3; color: white; border: none; font-size: 20px; cursor: pointer; z-index: 1000;">
                🐛
            </button>
        `;
    }
    
    // Загружаем товары
    loadPopularProducts();
    updateCart();
}

// Получение HTML для аватарки
function getAvatarHTML(user) {
    if (user.photo_url) {
        return `<img src="${user.photo_url}" class="user-avatar-img" alt="${user.first_name}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\"user-avatar-initial\">${user.first_name?.charAt(0) || 'Г'}</div>'">`;
    } else if (user.first_name) {
        return `<div class="user-avatar-initial">${user.first_name.charAt(0)}</div>`;
    } else {
        return `<div class="user-avatar-initial">👤</div>`;
    }
}

// Показать отладочную информацию
function showDebugInfo() {
    const modal = document.getElementById('debug-modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-bug"></i> Отладочная информация</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <h4>Данные пользователя:</h4>
                <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; max-height: 200px;">
${JSON.stringify(userData, null, 2)}
                </pre>
                
                <h4>Корзина:</h4>
                <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; max-height: 150px;">
${JSON.stringify(cart, null, 2)}
                </pre>
                
                <h4 style="margin-top: 20px;">Telegram WebApp:</h4>
                <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; max-height: 100px;">
${JSON.stringify({
    version: tg.version,
    platform: tg.platform,
    colorScheme: tg.colorScheme,
    initData: tg.initDataUnsafe ? 'Доступны' : 'Не доступны'
}, null, 2)}
                </pre>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// Загрузка популярных товаров
function loadPopularProducts() {
    const container = document.getElementById('popular-products');
    if (!container) return;
    
    const popularProducts = teaCatalog.slice(0, 4); // Первые 4 товара как популярные
    
    container.innerHTML = popularProducts.map(product => `
        <div class="product-card" onclick="showProductDetails(${product.id})">
            <div class="product-image ${product.imageClass}">
                ${product.tags && product.tags.length > 0 ? 
                    `<div class="product-tag">${product.tags[0]}</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">${product.price}₽</div>
                <button class="product-button" onclick="event.stopPropagation(); addToCart(${product.id})">
                    + В корзину
                </button>
            </div>
        </div>
    `).join('');
}

// Показать детали товара
function showProductDetails(productId) {
    const product = teaCatalog.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('product-modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-mug-hot"></i> ${product.name}</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="product-detail-image ${product.imageClass}" style="height: 200px; border-radius: 10px; margin-bottom: 15px; position: relative;">
                    ${product.tags && product.tags.length > 0 ? 
                        `<div class="product-tag">${product.tags[0]}</div>` : ''}
                </div>
                <p style="margin-bottom: 10px;">${product.description}</p>
                <p style="margin-bottom: 10px;"><strong>Категория:</strong> ${getCategoryName(product.category)}</p>
                <p style="margin-bottom: 10px;"><strong>Вес:</strong> ${product.weight}</p>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <div class="product-price" style="font-size: 24px;">${product.price}₽</div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="updateCartQuantity(${product.id}, -1)" style="padding: 10px 15px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; font-size: 18px;">-</button>
                        <span style="font-size: 18px; font-weight: 600;" id="detail-quantity-${product.id}">1</span>
                        <button onclick="updateCartQuantity(${product.id}, 1)" style="padding: 10px 15px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 18px;">+</button>
                    </div>
                </div>
                
                <button onclick="addToCart(${product.id}, parseInt(document.getElementById('detail-quantity-${product.id}').textContent))" style="width: 100%; padding: 15px; margin-top: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 16px;">
                    <i class="fas fa-cart-plus"></i> Добавить в корзину
                </button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function getCategoryName(category) {
    const categories = {
        'green': 'Зеленый чай',
        'oolong': 'Улун',
        'puer': 'Пуэр',
        'white': 'Белый чай',
        'red': 'Красный чай',
        'yellow': 'Желтый чай'
    };
    return categories[category] || 'Чай';
}

// Обновить количество в модальном окне товара
function updateCartQuantity(productId, delta) {
    const quantityElement = document.getElementById(`detail-quantity-${productId}`);
    if (!quantityElement) return;
    
    let quantity = parseInt(quantityElement.textContent) + delta;
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    
    quantityElement.textContent = quantity;
}

// Добавление в корзину с количеством
function addToCart(productId, quantity = 1) {
    const product = teaCatalog.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ 
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity 
        });
    }
    
    saveCart();
    
    // Анимация добавления
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    // Показываем уведомление
    const message = quantity > 1 ? 
        `✅ ${product.name} (${quantity} шт.) добавлен в корзину!` :
        `✅ ${product.name} добавлен в корзину!`;
    
    if (tg.showAlert) {
        tg.showAlert(message);
    }
    
    // Закрываем модальное окно товара
    closeModal();
}

// Показать каталог
function showCatalog() {
    const modal = document.getElementById('catalog-modal');
    
    const categories = {
        'green': 'Зеленые чаи',
        'oolong': 'Улуны',
        'puer': 'Пуэры',
        'white': 'Белые чаи',
        'red': 'Красные чаи',
        'yellow': 'Желтые чаи'
    };
    
    let catalogHTML = '';
    
    Object.entries(categories).forEach(([categoryId, categoryName]) => {
        const categoryProducts = teaCatalog.filter(p => p.category === categoryId);
        
        catalogHTML += `
            <div class="catalog-category">
                <h3 style="margin-bottom: 10px; color: #4CAF50;">${categoryName}</h3>
                <div class="catalog-products">
                    ${categoryProducts.map(product => `
                        <div class="catalog-item" onclick="showProductDetails(${product.id})">
                            <div class="catalog-item-image ${product.imageClass}"></div>
                            <div class="catalog-item-info">
                                <div style="font-weight: 600; margin-bottom: 5px;">${product.name}</div>
                                <div style="color: #4CAF50; font-weight: 700;">${product.price}₽</div>
                                <div style="font-size: 12px; color: #666;">${product.weight}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-list"></i> Каталог чая</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                ${catalogHTML}
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// Показать заказы
function showOrders() {
    const savedUser = loadUserFromStorage();
    const orderHistory = JSON.parse(localStorage.getItem(`user_${savedUser?.id}_order_history`)) || [];
    
    const modal = document.getElementById('order-modal');
    
    let ordersHTML = '';
    if (orderHistory.length > 0) {
        ordersHTML = orderHistory.map((order, index) => `
            <div class="order-history-item">
                <div class="order-header">
                    <span>Заказ #${order.id.toString().substr(-6)}</span>
                    <span>${new Date(order.date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.name}</span>
                            <span>${item.quantity} × ${item.price}₽</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    Статус: <span style="color: ${order.status === 'completed' ? '#4CAF50' : order.status === 'pending' ? '#FF9800' : '#F44336'}">${getStatusText(order.status)}</span>
                    <strong style="margin-left: auto;">${order.total}₽</strong>
                </div>
            </div>
        `).join('');
    } else {
        ordersHTML = '<div style="text-align: center; padding: 40px 20px; color: #666;"><i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i><p>У вас пока нет заказов</p></div>';
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-box"></i> История заказов</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                ${ordersHTML}
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function getStatusText(status) {
    const statuses = {
        'pending': 'В обработке',
        'confirmed': 'Подтвержден',
        'shipped': 'Отправлен',
        'completed': 'Завершен',
        'cancelled': 'Отменен'
    };
    return statuses[status] || status;
}

// Показать корзину
function showCartModal() {
    if (cart.length === 0) {
        if (tg.showAlert) {
            tg.showAlert('🛒 Корзина пуста');
        }
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
                ${cart.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; margin-bottom: 5px;">${item.name}</div>
                            <div style="font-size: 14px; color: #666;">${item.price}₽ × ${item.quantity}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button onclick="updateQuantity(${item.id}, -1)" style="width: 30px; height: 30px; border-radius: 50%; border: none; background: #f0f0f0; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
                            <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                            <button onclick="updateQuantity(${item.id}, 1)" style="width: 30px; height: 30px; border-radius: 50%; border: none; background: #4CAF50; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
                        </div>
                    </div>
                `).join('')}
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #4CAF50;">
                    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; margin-bottom: 15px;">
                        <span>Итого:</span>
                        <span>${total}₽</span>
                    </div>
                    <button onclick="processCheckout()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 16px;">
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
    
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    if (cart.length === 0) {
        closeModal();
    } else {
        showCartModal();
    }
}

// Процесс оформления заказа
function processCheckout() {
    if (cart.length === 0) {
        if (tg.showAlert) {
            tg.showAlert('Добавьте товары в корзину');
        }
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const savedUser = loadUserFromStorage();
    
    // Показываем модальное окно подтверждения
    const modal = document.getElementById('checkout-modal');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-shopping-bag"></i> Подтверждение заказа</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; color: #4CAF50; margin-bottom: 10px;">📦</div>
                    <h3 style="margin-bottom: 10px;">Заказ на ${total}₽</h3>
                    <p>${savedUser?.first_name || 'Гость'}, подтвердите оформление заказа</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px;">Состав заказа:</h4>
                    ${cart.map(item => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>${item.name}</span>
                            <span>${item.quantity} × ${item.price}₽</span>
                        </div>
                    `).join('')}
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button onclick="confirmCheckout()" style="padding: 15px; background: #4CAF50; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 16px;">
                        <i class="fas fa-check"></i> Подтвердить
                    </button>
                    <button onclick="closeModal()" style="padding: 15px; background: #f0f0f0; color: #333; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 16px;">
                        <i class="fas fa-times"></i> Отмена
                    </button>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// Подтверждение заказа
function confirmCheckout() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const savedUser = loadUserFromStorage();
    
    // Сохраняем заказ в историю
    const order = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: [...cart],
        total: total,
        status: 'pending'
    };
    
    // Сохраняем заказ пользователя
    let orderHistory = JSON.parse(localStorage.getItem(`user_${savedUser?.id}_order_history`)) || [];
    orderHistory.unshift(order);
    localStorage.setItem(`user_${savedUser?.id}_order_history`, JSON.stringify(orderHistory));
    
    // Обновляем статистику пользователя
    if (savedUser) {
        savedUser.total_orders = (parseInt(savedUser.total_orders) || 0) + 1;
        savedUser.total_spent = (parseFloat(savedUser.total_spent) || 0) + total;
        localStorage.setItem('current_user', JSON.stringify(savedUser));
    }
    
    // Отправляем данные в бота
    if (tg && tg.sendData) {
        tg.sendData(JSON.stringify({
            action: 'checkout',
            user_id: savedUser?.id || userData?.id || 'guest',
            user_name: savedUser?.first_name || userData?.first_name || 'Гость',
            user_username: savedUser?.username || userData?.username || '',
            cart: cart,
            total: total,
            timestamp: new Date().toISOString(),
            order_id: order.id
        }));
    }
    
    // Очищаем корзину
    cart = [];
    saveCart();
    
    // Закрываем модальные окна
    closeModal();
    
    // Показываем подтверждение
    if (tg.showAlert) {
        tg.showAlert(`✅ Заказ #${order.id} оформлен!\n\nСумма: ${total}₽\n\nС вами свяжется менеджер для подтверждения.`);
    }
}

// Показать профиль
function showProfile() {
    const savedUser = loadUserFromStorage() || userData;
    const orderHistory = JSON.parse(localStorage.getItem(`user_${savedUser?.id}_order_history`)) || [];
    
    const modal = document.getElementById('profile-modal');
    
    // Определяем аватарку для профиля
    let profileAvatar = getAvatarHTML(savedUser);
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user"></i> Мой профиль</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="width: 100px; height: 100px; margin: 0 auto 15px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 48px; color: white;">
                        ${profileAvatar}
                    </div>
                    <h3>${savedUser.first_name || 'Гость'}</h3>
                    ${savedUser.username ? `<p style="color: #666; font-size: 16px; margin-top: 5px;">@${savedUser.username}</p>` : ''}
                    ${savedUser.id ? `<p style="color: #999; font-size: 14px; margin-top: 5px;">ID: ${savedUser.id}</p>` : ''}
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 15px; color: #333;">📊 Статистика</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            <div style="font-size: 24px; font-weight: 700; color: #4CAF50; margin-bottom: 5px;">${orderHistory.length}</div>
                            <div style="font-size: 12px; color: #666;">Всего заказов</div>
                        </div>
                        <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            <div style="font-size: 24px; font-weight: 700; color: #2196F3; margin-bottom: 5px;">${savedUser.total_spent || 0}₽</div>
                            <div style="font-size: 12px; color: #666;">Всего потрачено</div>
                        </div>
                    </div>
                </div>
                
                <button onclick="openChannel()" style="width: 100%; padding: 12px; margin-bottom: 10px; background: #4CAF50; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 16px;">
                    <i class="fab fa-telegram"></i> Наш канал @teatea_bar
                </button>
                
                <button onclick="showSupport()" style="width: 100%; padding: 12px; background: #2196F3; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 16px;">
                    <i class="fas fa-headset"></i> Поддержка
                </button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// Открыть канал
function openChannel() {
    if (tg.openLink) {
        tg.openLink('https://t.me/teatea_bar');
    }
}

// Поддержка
function showSupport() {
    if (tg.showAlert) {
        tg.showAlert('📞 Служба поддержки:\n\n' +
                    'Telegram: @teatea_bar\n' +
                    'Email: support@teatea.ru\n' +
                    'Часы работы: 10:00-20:00');
    }
}

// Закрыть модальное окно
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initApp);

// Обработка закрытия приложения
window.addEventListener('beforeunload', () => {
    saveCart();
});
