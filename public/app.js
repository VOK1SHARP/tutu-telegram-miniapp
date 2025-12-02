// Telegram Web App инициализация
let tg = window.Telegram.WebApp;
let cart = [];
let userData = null;

// Инициализация приложения
function initApp() {
    // Инициализируем Telegram Web App
    tg.ready();
    tg.expand();
    
    // Настраиваем цвета
    tg.setHeaderColor('#4CAF50');
    tg.setBackgroundColor('#f0f4f7');
    
    // Получаем данные пользователя
    const initData = tg.initDataUnsafe;
    userData = initData.user || { first_name: 'Гость', id: Date.now() };
    
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
    
    // Сохраняем в Telegram Cloud Storage (если доступно)
    if (tg.CloudStorage) {
        tg.CloudStorage.setItem('cart', JSON.stringify(cart));
    }
}

// Показать главный интерфейс
function showMainInterface() {
    const app = document.getElementById('app');
    
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
                    <i class="fas fa-user"></i>
                    <span class="cart-badge" style="display: none;">0</span>
                </div>
            </div>
        </div>
        
        <!-- Баннер -->
        <div class="banner fade-in" style="animation-delay: 0.1s">
            <h2>🍵 Добро пожаловать, ${userData.first_name}!</h2>
            <p>Аутентичный китайский чай с доставкой</p>
            <a href="#" class="banner-button" onclick="showCatalog()">Смотреть каталог</a>
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
                <p>Бонусы и скидки</p>
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
    `;
    
    // Загружаем товары
    loadPopularProducts();
    updateCart();
}

// Загрузка популярных товаров
function loadPopularProducts() {
    const products = [
        { id: 1, name: 'Зеленый чай Лунцзин', price: 800, tag: 'Хит' },
        { id: 2, name: 'Улун Те Гуань Инь', price: 1200, tag: 'Популярное' },
        { id: 3, name: 'Пуэр Шу', price: 1500, tag: 'Премиум' },
        { id: 4, name: 'Белый чай', price: 2200, tag: 'Элитный' }
    ];
    
    const container = document.getElementById('popular-products');
    container.innerHTML = products.map(product => `
        <div class="product-card" onclick="showProduct(${product.id})">
            <div class="product-image ${product.id === 2 ? 'oolong' : product.id === 3 ? 'puer' : ''}">
                ${product.tag ? `<div class="product-tag">${product.tag}</div>` : ''}
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

// Добавление в корзину
function addToCart(productId) {
    const products = {
        1: { id: 1, name: 'Зеленый чай Лунцзин', price: 800 },
        2: { id: 2, name: 'Улун Те Гуань Инь', price: 1200 },
        3: { id: 3, name: 'Пуэр Шу', price: 1500 },
        4: { id: 4, name: 'Белый чай', price: 2200 }
    };
    
    const product = products[productId];
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    
    // Анимация добавления
    tg.HapticFeedback.impactOccurred('light');
    tg.showAlert(`✅ ${product.name} добавлен в корзину!`);
}

// Показать каталог
function showCatalog() {
    tg.showAlert('Каталог чая скоро будет доступен!');
    // Здесь можно реализовать полный каталог
}

// Показать заказы
function showOrders() {
    const modal = document.getElementById('order-modal');
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-box"></i> Мои заказы</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <p>Здесь будет история ваших заказов.</p>
                <p>Функция в разработке...</p>
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
                ${cart.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                        <div>
                            <div style="font-weight: 600;">${item.name}</div>
                            <div style="font-size: 14px; color: #666;">${item.price}₽ × ${item.quantity}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button onclick="updateQuantity(${item.id}, -1)" style="width: 30px; height: 30px; border-radius: 50%; border: none; background: #f0f0f0; cursor: pointer;">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity(${item.id}, 1)" style="width: 30px; height: 30px; border-radius: 50%; border: none; background: #4CAF50; color: white; cursor: pointer;">+</button>
                        </div>
                    </div>
                `).join('')}
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #4CAF50;">
                    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700;">
                        <span>Итого:</span>
                        <span>${total}₽</span>
                    </div>
                    <button onclick="checkout()" style="width: 100%; padding: 15px; margin-top: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">
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
function checkout() {
    if (cart.length === 0) {
        tg.showAlert('Добавьте товары в корзину');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Отправляем данные в бота
    tg.sendData(JSON.stringify({
        action: 'checkout',
        user_id: userData.id,
        user_name: userData.first_name,
        cart: cart,
        total: total,
        timestamp: new Date().toISOString()
    }));
    
    tg.showAlert(`✅ Заказ на ${total}₽ отправлен! С вами свяжется менеджер.`);
    
    // Очищаем корзину
    cart = [];
    saveCart();
    closeModal();
}

// Показать профиль
function showProfile() {
    const modal = document.getElementById('profile-modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user"></i> Мой профиль</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="width: 80px; height: 80px; margin: 0 auto 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; color: white;">
                        ${userData.first_name ? userData.first_name.charAt(0) : 'Г'}
                    </div>
                    <h3>${userData.first_name || 'Гость'}</h3>
                    ${userData.id ? `<p style="color: #666; font-size: 14px;">ID: ${userData.id}</p>` : ''}
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Бонусные баллы:</span>
                        <span style="font-weight: 700; color: #4CAF50;">150</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Заказов всего:</span>
                        <span style="font-weight: 700;">2</span>
                    </div>
                </div>
                
                <button onclick="openChannel()" style="width: 100%; padding: 12px; margin-bottom: 10px; background: #4CAF50; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">
                    <i class="fab fa-telegram"></i> Наш канал
                </button>
                
                <button onclick="showSupport()" style="width: 100%; padding: 12px; background: #2196F3; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-headset"></i> Поддержка
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

// Поддержка
function showSupport() {
    tg.showAlert('📞 Служба поддержки:\n\n' +
                 'Telegram: @teatea_bar\n' +
                 'Email: support@teatea.ru\n' +
                 'Часы работы: 10:00-20:00');
}

// Закрыть модальное окно
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Показать товар
function showProduct(productId) {
    tg.showAlert('Детальная информация о товаре скоро будет доступна!');
}

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
