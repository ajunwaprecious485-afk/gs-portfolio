let store = {};
let products = [];
let analytics = { views: 0, clicks: 0 };
let editingProductId = null;
let storeDocId = null;

// Get or create store ID from localStorage
function getStoreId() {
    let id = localStorage.getItem('wastore_id');
    if (!id) {
        id = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
        localStorage.setItem('wastore_id', id);
    }
    return id;
}

const storeId = getStoreId();

document.addEventListener('DOMContentLoaded', () => {
    loadStore();
    bindEvents();
});

// ========== FIREBASE OPERATIONS ==========
async function loadStore() {
    try {
        const doc = await db.collection('stores').doc(storeId).get();
        if (doc.exists) {
            store = doc.data();
            storeDocId = storeId;
            populateStoreForm();
            await loadProducts();
        }
    } catch (e) {
        console.log('Fresh start - no store yet');
    }
    updatePreview();
    updateViewStoreBtn();
    renderAll();
}

function populateStoreForm() {
    document.getElementById('storeName').value = store.name || '';
    document.getElementById('storeDesc').value = store.description || '';
    document.getElementById('storePhone').value = store.phone || '';
    document.getElementById('storeSlug').value = store.slug || '';
    if (store.color) {
        document.querySelectorAll('.color-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.color === store.color);
        });
    }
}

async function saveStoreToFirebase() {
    try {
        await db.collection('stores').doc(storeId).set(store);
    } catch (e) {
        console.error('Error saving store:', e);
    }
}

async function loadProducts() {
    try {
        const snapshot = await db.collection('stores').doc(storeId).collection('products').orderBy('createdAt', 'desc').get();
        products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
    } catch (e) {
        console.error('Error loading products:', e);
    }
}

async function saveProductToFirebase(product) {
    try {
        const ref = db.collection('stores').doc(storeId).collection('products').doc(product.id);
        await ref.set(product);
    } catch (e) {
        console.error('Error saving product:', e);
    }
}

async function deleteProductFromFirebase(id) {
    try {
        await db.collection('stores').doc(storeId).collection('products').doc(id).delete();
    } catch (e) {
        console.error('Error deleting product:', e);
    }
}

// ========== EVENTS ==========
function bindEvents() {
    document.querySelectorAll('.sidebar-link').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    document.getElementById('saveStoreBtn').addEventListener('click', async () => {
        const activeColor = document.querySelector('.color-btn.active');
        store = {
            name: document.getElementById('storeName').value.trim(),
            description: document.getElementById('storeDesc').value.trim(),
            phone: document.getElementById('storePhone').value.trim(),
            slug: document.getElementById('storeSlug').value.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
            color: activeColor ? activeColor.dataset.color : '#25D366',
            ownerId: storeId,
            updatedAt: new Date().toISOString()
        };
        await saveStoreToFirebase();
        updatePreview();
        updateViewStoreBtn();
        alert('Store saved!');
    });

    document.getElementById('addProductBtn').addEventListener('click', () => {
        editingProductId = null;
        document.getElementById('productModalTitle').textContent = 'Add Product';
        document.getElementById('prodName').value = '';
        document.getElementById('prodPrice').value = '';
        document.getElementById('prodDesc').value = '';
        document.getElementById('prodImage').value = '';
        document.getElementById('prodCategory').value = '';
        toggleModal('productModal', true);
    });

    document.getElementById('cancelProductBtn').addEventListener('click', () => toggleModal('productModal', false));
    document.getElementById('saveProductBtn').addEventListener('click', saveProduct);

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.getElementById('shareBtn').addEventListener('click', openShareModal);
    document.getElementById('closeShareBtn').addEventListener('click', () => toggleModal('shareModal', false));
    document.getElementById('copyLinkBtn').addEventListener('click', copyLink);
    document.getElementById('copyLinkBtn2').addEventListener('click', copyLink);

    document.getElementById('viewStoreBtn').addEventListener('click', (e) => {
        e.preventDefault();
        const slug = store.slug || 'my-store';
        window.open(`store.html?store=${slug}`, '_blank');
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) toggleModal(overlay.id, false);
        });
    });
}

// ========== VIEW SWITCHING ==========
function switchView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`.sidebar-link[data-view="${view}"]`).classList.add('active');
}

function toggleModal(id, show) {
    document.getElementById(id).classList.toggle('active', show);
}

// ========== STORE SETTINGS ==========
function updateViewStoreBtn() {
    const btn = document.getElementById('viewStoreBtn');
    if (store.slug) {
        btn.style.display = 'inline-flex';
    }
}

function updatePreview() {
    const name = store.name || 'Your Store';
    const desc = store.description || 'Your store description';
    const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    document.getElementById('previewName').textContent = name;
    document.getElementById('previewDesc').textContent = desc;
    document.getElementById('previewLogo').textContent = initials;

    const container = document.getElementById('previewProducts');
    if (products.length === 0) {
        container.innerHTML = '<p class="preview-empty">Add products to see them here</p>';
        return;
    }

    container.innerHTML = products.slice(0, 4).map(p => `
        <div class="preview-product">
            <div class="preview-product-img" style="background:url('${p.image || ''}') center/cover, #e5e7eb;"></div>
            <div class="preview-product-info">
                <h5>${p.name}</h5>
                <p>₦${Number(p.price).toLocaleString()}</p>
            </div>
        </div>
    `).join('');
}

// ========== PRODUCTS ==========
async function saveProduct() {
    const name = document.getElementById('prodName').value.trim();
    const price = document.getElementById('prodPrice').value;
    const desc = document.getElementById('prodDesc').value.trim();
    const image = document.getElementById('prodImage').value.trim();
    const category = document.getElementById('prodCategory').value.trim();

    if (!name || !price) {
        alert('Product name and price are required.');
        return;
    }

    const product = {
        id: editingProductId || Date.now().toString(),
        name, price: parseFloat(price), desc, image, category,
        createdAt: editingProductId ? (products.find(p => p.id === editingProductId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    await saveProductToFirebase(product);

    if (editingProductId) {
        products = products.map(p => p.id === editingProductId ? product : p);
    } else {
        products.unshift(product);
    }

    toggleModal('productModal', false);
    renderProducts();
    updatePreview();
}

function editProduct(id) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    editingProductId = id;
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('prodName').value = p.name;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodDesc').value = p.desc || '';
    document.getElementById('prodImage').value = p.image || '';
    document.getElementById('prodCategory').value = p.category || '';
    toggleModal('productModal', true);
}

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    await deleteProductFromFirebase(id);
    products = products.filter(p => p.id !== id);
    renderProducts();
    updatePreview();
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const empty = document.getElementById('productsEmpty');

    if (products.length === 0) {
        grid.innerHTML = '';
        empty.classList.add('show');
        return;
    }

    empty.classList.remove('show');
    grid.innerHTML = products.map(p => `
        <div class="product-card">
            <div class="product-img" style="background:url('${p.image || ''}') center/cover, #e5e7eb;"></div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="product-price">₦${Number(p.price).toLocaleString()}</p>
                <p class="product-desc">${p.desc || ''}</p>
                ${p.category ? `<p class="product-cat">${p.category}</p>` : ''}
                <div class="product-actions">
                    <button class="btn btn-outline btn-sm" onclick="editProduct('${p.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========== ANALYTICS ==========
function renderAnalytics() {
    document.getElementById('storeViews').textContent = analytics.views;
    document.getElementById('productCount').textContent = products.length;
    document.getElementById('whatsappClicks').textContent = analytics.clicks;
}

function renderAll() {
    renderProducts();
    renderAnalytics();
}

// ========== SHARE ==========
function openShareModal() {
    const slug = store.slug || 'my-store';
    const link = `${window.location.origin}/gs-portfolio/wa-store/store.html?store=${slug}`;
    document.getElementById('shareLink').value = link;
    document.getElementById('shareWhatsApp').href = `https://wa.me/?text=${encodeURIComponent('Check out my store: ' + link)}`;
    toggleModal('shareModal', true);
}

function copyLink() {
    const input = document.getElementById('shareLink');
    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
        document.getElementById('copyLinkBtn').textContent = 'Copied!';
        document.getElementById('copyLinkBtn2').textContent = 'Copied!';
        setTimeout(() => {
            document.getElementById('copyLinkBtn').textContent = 'Copy';
            document.getElementById('copyLinkBtn2').textContent = 'Copy Link';
        }, 2000);
    });
}
