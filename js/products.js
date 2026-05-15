// ======================================================
// PRODUTOS - CATÁLOGO COM WHATSAPP (SEM CARRINHO)
// ======================================================

let allProducts = [];
let currentFilteredProducts = [];

const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const modal = document.getElementById('productModal');
const modalBody = document.getElementById('modalBody');

// Mostrar skeleton enquanto carrega
function showSkeletons() {
    productsGrid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        productsGrid.appendChild(skeleton);
    }
}

// Carregar produtos ativos do Supabase
async function loadProducts() {
    showSkeletons();
    try {
        const { data, error } = await window.supabase
            .from('products')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });
        if (error) throw error;
        allProducts = data || [];
        currentFilteredProducts = [...allProducts];
        renderProducts(currentFilteredProducts);
    } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        productsGrid.innerHTML = '<p class="empty-state">Falha ao carregar produtos. Tente novamente.</p>';
    }
}

// Renderizar grid de produtos
function renderProducts(products) {
    if (!products.length) {
        productsGrid.innerHTML = '<p class="empty-state">Nenhum produto encontrado.</p>';
        return;
    }

    productsGrid.innerHTML = products.map(product => {
        const isLowStock = product.stock <= 3 && product.stock > 0;
        const stockBadge = product.stock <= 0 ? '<div class="stock-badge" style="background:#666;">Esgotado</div>' :
                           (isLowStock ? '<div class="stock-badge">Últimas unidades</div>' : '');
        const promoBadge = product.promo ? '<div class="promo-badge">Promoção</div>' : ''; // Se tiver campo promo

        return `
            <div class="product-card" data-id="${product.id}">
                ${promoBadge}
                ${stockBadge}
                <img class="product-image" src="${product.image_url || 'https://placehold.co/400x500/222/white?text=SEM+IMAGEM'}" alt="${product.name}">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">R$ ${Number(product.price).toFixed(2)}</p>
                    <button class="whatsapp-card-btn" data-id="${product.id}">
                        <i class="fab fa-whatsapp"></i> Consultar no WhatsApp
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Adicionar eventos aos botões WhatsApp dos cards
    document.querySelectorAll('.whatsapp-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const product = allProducts.find(p => p.id === id);
            if (product) openWhatsApp(product);
        });
    });

    // Abrir modal de detalhes ao clicar no card (exceto no botão)
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('whatsapp-card-btn')) {
                const id = card.dataset.id;
                const product = allProducts.find(p => p.id === id);
                if (product) openProductModal(product);
            }
        });
    });
}

// Modal de detalhes (com botão "Solicitar mais fotos")
function openProductModal(product) {
    const stockText = product.stock <= 0 ? 'Esgotado' :
                      (product.stock <= 3 ? `Últimas ${product.stock} unidades` : `${product.stock} disponíveis`);
    
    modalBody.innerHTML = `
        <div class="modal-product">
            <img src="${product.image_url}" style="width:100%; border-radius:16px; margin-bottom:16px;">
            <h2>${product.name}</h2>
            <p class="product-price">R$ ${Number(product.price).toFixed(2)}</p>
            <p><strong>Descrição:</strong> ${product.description || 'Sem descrição'}</p>
            <p><strong>Categoria:</strong> ${product.category}</p>
            <p><strong>Estoque:</strong> ${stockText}</p>
            ${product.sizes && product.sizes.length ? `<p><strong>Tamanhos:</strong> ${product.sizes.join(', ')}</p>` : ''}
            ${product.colors && product.colors.length ? `<p><strong>Cores:</strong> ${product.colors.join(', ')}</p>` : ''}
            <button id="whatsappModalBtn" class="btn btn-primary" style="background:#25D366; margin-top:20px;">
                <i class="fab fa-whatsapp"></i> Solicitar mais fotos
            </button>
        </div>
    `;
    modal.style.display = 'flex';
    
    document.getElementById('whatsappModalBtn').addEventListener('click', () => {
        openWhatsApp(product);
        closeModal();
    });
}

// Função que gera a mensagem e abre o WhatsApp
function openWhatsApp(product) {
    const numero = window.CONFIG.WHATSAPP_SELLER_NUMBER;
    const mensagem = `Olá! Tenho interesse neste produto:

*${product.name}*

Valor: R$ ${Number(product.price).toFixed(2)}

Gostaria de ver mais fotos e confirmar disponibilidade 😊`;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

function closeModal() {
    modal.style.display = 'none';
}

// Filtros (apenas busca por nome e categoria)
function applyFilters() {
    let filtered = [...allProducts];
    const term = searchInput.value.toLowerCase().trim();
    if (term) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(term));
    }
    const category = categoryFilter.value;
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    currentFilteredProducts = filtered;
    renderProducts(currentFilteredProducts);
}

// Event listeners dos filtros
searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);

// Fechar modal ao clicar fora
document.querySelectorAll('.modal-close').forEach(el => el.addEventListener('click', closeModal));
window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// Inicializar
document.addEventListener('DOMContentLoaded', loadProducts);

// Expor globalmente se necessário
window.openWhatsApp = openWhatsApp;
