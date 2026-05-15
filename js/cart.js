
// ======================================================
// CARRINHO: ESTADO LOCAL, PERSISTÊNCIA, CHECKOUT (WHATSAPP)
// ======================================================

let cartItems = []; // { id, productId, name, price, quantity, size, color, image }

function loadCartFromStorage() {
    const stored = localStorage.getItem('aether_cart');
    if (stored) {
        cartItems = JSON.parse(stored);
    } else {
        cartItems = [];
    }
    updateCartUI();
}

function saveCartToStorage() {
    localStorage.setItem('aether_cart', JSON.stringify(cartItems));
    updateCartUI();
}

function updateCartUI() {
    const cartCountSpan = document.getElementById('cartCount');
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    cartCountSpan.innerText = totalItems;
    const container = document.getElementById('cartItemsContainer');
    const totalSpan = document.getElementById('cartTotalPrice');
    if (!cartItems.length) {
        container.innerHTML = '<div class="empty-cart-msg">Seu carrinho está vazio.</div>';
        totalSpan.innerText = 'R$ 0,00';
        return;
    }
    let total = 0;
    container.innerHTML = cartItems.map((item, idx) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        return `
            <div class="cart-item" data-index="${idx}">
                <img class="cart-item-img" src="${item.image || 'https://placehold.co/70x70'}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-size">Tam: ${item.size} / Cor: ${item.color}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" data-action="decr" data-idx="${idx}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" data-action="incr" data-idx="${idx}">+</button>
                        <button class="remove-item" data-action="remove" data-idx="${idx}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    totalSpan.innerText = `R$ ${total.toFixed(2)}`;
    // Eventos dos botões dinâmicos
    document.querySelectorAll('.qty-btn, .remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            const action = btn.dataset.action;
            if (action === 'incr') {
                cartItems[idx].quantity += 1;
                saveCartToStorage();
            } else if (action === 'decr') {
                if (cartItems[idx].quantity > 1) {
                    cartItems[idx].quantity -= 1;
                    saveCartToStorage();
                } else {
                    cartItems.splice(idx, 1);
                    saveCartToStorage();
                }
            } else if (action === 'remove') {
                cartItems.splice(idx, 1);
                saveCartToStorage();
            }
        });
    });
}

// Adicionar ao carrinho via modal
window.addToCart = (product, quantity, size, color) => {
    const existingIndex = cartItems.findIndex(item => item.productId === product.id && item.size === size && item.color === color);
    if (existingIndex !== -1) {
        cartItems[existingIndex].quantity += quantity;
    } else {
        cartItems.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            size: size,
            color: color,
            image: product.image_url,
        });
    }
    saveCartToStorage();
    window.showToast?.('Produto adicionado ao carrinho!', 'success');
};

// CHECKOUT: criar pedido + WhatsApp
async function processCheckout(customerName, customerPhone) {
    if (!cartItems.length) {
        window.showToast?.('Carrinho vazio', 'error');
        return false;
    }
    const total = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const orderNumber = `PED-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
    
    // 1. Salvar pedido no Supabase
    const { data: orderData, error: orderError } = await window.supabase
        .from('orders')
        .insert([{
            order_number: orderNumber,
            customer_name: customerName,
            customer_phone: customerPhone,
            total: total,
            status: 'pending_contact'
        }]).select();
    
    if (orderError) {
        console.error(orderError);
        window.showToast?.('Erro ao registrar pedido', 'error');
        return false;
    }
    const orderId = orderData[0].id;
    
    // 2. Inserir itens do pedido
    const orderItems = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price
    }));
    const { error: itemsError } = await window.supabase.from('order_items').insert(orderItems);
    if (itemsError) console.error(itemsError);
    
    // 3. Montar mensagem WhatsApp
    const productListStr = cartItems.map(i => `${i.name} (${i.quantity}x)`).join(', ');
    const message = `Olá! Tenho interesse no pedido ${orderNumber} Produtos: ${productListStr} Valor total: R$ ${total.toFixed(2)} Gostaria de finalizar minha compra.`;
    const encodedMsg = encodeURIComponent(message);
    const waLink = `https://wa.me/${window.CONFIG.WHATSAPP_SELLER_NUMBER}?text=${encodedMsg}`;
    
    // 4. Abrir WhatsApp e limpar carrinho
    window.open(waLink, '_blank');
    cartItems = [];
    saveCartToStorage();
    window.showToast?.(`Pedido ${orderNumber} criado! Redirecionando para WhatsApp.`, 'success');
    return true;
}

// Expor global
window.loadCartFromStorage = loadCartFromStorage;
window.saveCartToStorage = saveCartToStorage;
window.updateCartUI = updateCartUI;
window.processCheckout = processCheckout;
loadCartFromStorage();
