// ========== DATA ==========
let invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
let clients = JSON.parse(localStorage.getItem('clients') || '[]');
let settings = JSON.parse(localStorage.getItem('settings') || '{}');
let editingInvoiceId = null;

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setDefaultDate();
    addLineItem();
    renderAll();
    bindEvents();
});

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    document.getElementById('invDate').value = today;
    document.getElementById('invDue').value = due;

    const lastNum = invoices.length > 0
        ? Math.max(...invoices.map(i => parseInt(i.number.replace(/\D/g, '')) || 0))
        : 0;
    document.getElementById('invNumber').value = `INV-${String(lastNum + 1).padStart(3, '0')}`;
}

// ========== EVENTS ==========
function bindEvents() {
    document.querySelectorAll('.sidebar-link').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    document.getElementById('addItemBtn').addEventListener('click', () => addLineItem());
    document.getElementById('taxRate').addEventListener('input', calculateTotals);
    document.getElementById('saveInvoiceBtn').addEventListener('click', saveInvoice);
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadCurrentPdf);
    document.getElementById('addClientBtn').addEventListener('click', () => toggleModal('clientModal', true));
    document.getElementById('cancelClientBtn').addEventListener('click', () => toggleModal('clientModal', false));
    document.getElementById('saveClientBtn').addEventListener('click', saveClient);
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('bizName').value = settings.name || '';
        document.getElementById('bizEmail').value = settings.email || '';
        document.getElementById('bizPhone').value = settings.phone || '';
        document.getElementById('bizAddress').value = settings.address || '';
        toggleModal('settingsModal', true);
    });
    document.getElementById('cancelSettingsBtn').addEventListener('click', () => toggleModal('settingsModal', false));
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('closePreviewBtn').addEventListener('click', () => toggleModal('previewModal', false));
    document.getElementById('previewDownloadBtn').addEventListener('click', downloadPreviewPdf);

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) toggleModal(overlay.id, false);
        });
    });

    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchView(btn.dataset.view);
        });
    });
}

// ========== VIEW SWITCHING ==========
function switchView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');

    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-link[data-view="${view}"]`);
    if (activeLink) activeLink.classList.add('active');

    document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
    const activeMobile = document.querySelector(`.mobile-nav-btn[data-view="${view}"]`);
    if (activeMobile) activeMobile.classList.add('active');

    if (view === 'create' && !editingInvoiceId) {
        resetForm();
    }

    if (view === 'invoices') renderInvoicesList();
    if (view === 'clients') renderClients();
    if (view === 'dashboard') renderDashboard();
}

// ========== MODALS ==========
function toggleModal(id, show) {
    document.getElementById(id).classList.toggle('active', show);
}

// ========== LINE ITEMS ==========
function addLineItem() {
    const container = document.getElementById('lineItems');
    const row = document.createElement('div');
    row.className = 'line-item';
    row.innerHTML = `
        <input type="text" class="item-desc" placeholder="Service or product">
        <input type="number" class="item-qty" value="1" min="1">
        <input type="number" class="item-rate" placeholder="0" min="0">
        <span class="item-amount">₦0</span>
        <button class="remove-item" onclick="removeItem(this)">&times;</button>
    `;
    container.appendChild(row);

    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            updateItemAmount(row);
            calculateTotals();
        });
    });
}

function removeItem(btn) {
    btn.closest('.line-item').remove();
    calculateTotals();
}

function updateItemAmount(row) {
    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
    const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
    row.querySelector('.item-amount').textContent = formatNaira(qty * rate);
}

function calculateTotals() {
    let subtotal = 0;
    document.querySelectorAll('.line-item').forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        subtotal += qty * rate;
    });

    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = formatNaira(subtotal);
    document.getElementById('taxAmount').textContent = formatNaira(tax);
    document.getElementById('totalAmount').textContent = formatNaira(total);
}

function formatNaira(amount) {
    return '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ========== SAVE INVOICE ==========
function saveInvoice() {
    const number = document.getElementById('invNumber').value.trim();
    const date = document.getElementById('invDate').value;
    const due = document.getElementById('invDue').value;
    const clientId = document.getElementById('invClient').value;
    const status = document.getElementById('invStatus').value;
    const notes = document.getElementById('invNotes').value.trim();

    if (!number || !date || !due) {
        alert('Please fill in invoice number, date, and due date.');
        return;
    }

    const items = [];
    document.querySelectorAll('.line-item').forEach(row => {
        const desc = row.querySelector('.item-desc').value.trim();
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        if (desc && qty > 0 && rate > 0) {
            items.push({ desc, qty, rate, amount: qty * rate });
        }
    });

    if (items.length === 0) {
        alert('Please add at least one line item.');
        return;
    }

    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    const client = clients.find(c => c.id === clientId);

    const invoice = {
        id: editingInvoiceId || Date.now().toString(),
        number, date, due, clientId, status, notes,
        items, taxRate, subtotal, tax, total,
        clientName: client ? client.name : 'Walk-in',
        clientEmail: client ? client.email : '',
        clientPhone: client ? client.phone : '',
        clientAddress: client ? client.address : '',
        createdAt: editingInvoiceId ? (invoices.find(i => i.id === editingInvoiceId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    if (editingInvoiceId) {
        invoices = invoices.map(i => i.id === editingInvoiceId ? invoice : i);
        editingInvoiceId = null;
    } else {
        invoices.unshift(invoice);
    }

    localStorage.setItem('invoices', JSON.stringify(invoices));
    renderAll();
    switchView('invoices');
}

function resetForm() {
    editingInvoiceId = null;
    document.getElementById('createTitle').textContent = 'New Invoice';
    document.getElementById('downloadPdfBtn').style.display = 'none';
    document.getElementById('invNumber').value = '';
    document.getElementById('invStatus').value = 'pending';
    document.getElementById('taxRate').value = 0;
    document.getElementById('invNotes').value = '';
    document.getElementById('lineItems').innerHTML = '';
    setDefaultDate();
    populateClientDropdown();
    addLineItem();
}

// ========== RENDER ==========
function renderAll() {
    renderDashboard();
    populateClientDropdown();
}

function renderDashboard() {
    const total = invoices.length;
    const paid = invoices.filter(i => i.status === 'paid').length;
    const pending = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;
    const revenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);

    document.getElementById('totalInvoices').textContent = total;
    document.getElementById('paidInvoices').textContent = paid;
    document.getElementById('pendingInvoices').textContent = pending;
    document.getElementById('totalRevenue').textContent = formatNaira(revenue);

    const tbody = document.getElementById('recentBody');
    const empty = document.getElementById('dashEmpty');

    if (invoices.length === 0) {
        tbody.innerHTML = '';
        empty.classList.add('show');
        return;
    }

    empty.classList.remove('show');
    tbody.innerHTML = invoices.slice(0, 5).map(inv => `
        <tr>
            <td><strong>${inv.number}</strong></td>
            <td>${inv.clientName}</td>
            <td>${formatNaira(inv.total)}</td>
            <td><span class="badge badge-${inv.status}">${inv.status}</span></td>
            <td>${formatDate(inv.date)}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="previewInvoice('${inv.id}')">View</button>
            </td>
        </tr>
    `).join('');
}

function renderInvoicesList() {
    const tbody = document.getElementById('invoicesBody');
    const empty = document.getElementById('invoicesEmpty');

    if (invoices.length === 0) {
        tbody.innerHTML = '';
        empty.classList.add('show');
        return;
    }

    empty.classList.remove('show');
    tbody.innerHTML = invoices.map(inv => `
        <tr>
            <td><strong>${inv.number}</strong></td>
            <td>${inv.clientName}</td>
            <td>${formatNaira(inv.total)}</td>
            <td><span class="badge badge-${inv.status}">${inv.status}</span></td>
            <td>${formatDate(inv.date)}</td>
            <td style="display:flex;gap:6px;flex-wrap:wrap;">
                <button class="btn btn-outline btn-sm" onclick="previewInvoice('${inv.id}')">View</button>
                <button class="btn btn-outline btn-sm" onclick="editInvoice('${inv.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteInvoice('${inv.id}')">Del</button>
            </td>
        </tr>
    `).join('');
}

function renderClients() {
    const grid = document.getElementById('clientsGrid');
    const empty = document.getElementById('clientsEmpty');

    if (clients.length === 0) {
        grid.innerHTML = '';
        empty.classList.add('show');
        return;
    }

    empty.classList.remove('show');
    grid.innerHTML = clients.map(c => `
        <div class="client-card">
            <h3>${c.name}</h3>
            <p>${c.email || 'No email'}</p>
            <p>${c.phone || 'No phone'}</p>
            <p>${c.address || ''}</p>
            <div class="client-actions">
                <button class="btn btn-outline btn-sm" onclick="deleteClient('${c.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function populateClientDropdown() {
    const select = document.getElementById('invClient');
    const current = select.value;
    select.innerHTML = '<option value="">Select a client</option>' +
        clients.map(c => `<option value="${c.id}" ${c.id === current ? 'selected' : ''}>${c.name}</option>`).join('');
}

// ========== CLIENTS ==========
function saveClient() {
    const name = document.getElementById('clientName').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const address = document.getElementById('clientAddress').value.trim();

    if (!name) {
        alert('Client name is required.');
        return;
    }

    clients.push({ id: Date.now().toString(), name, email, phone, address });
    localStorage.setItem('clients', JSON.stringify(clients));

    document.getElementById('clientName').value = '';
    document.getElementById('clientEmail').value = '';
    document.getElementById('clientPhone').value = '';
    document.getElementById('clientAddress').value = '';

    toggleModal('clientModal', false);
    renderClients();
    populateClientDropdown();
}

function deleteClient(id) {
    if (!confirm('Delete this client?')) return;
    clients = clients.filter(c => c.id !== id);
    localStorage.setItem('clients', JSON.stringify(clients));
    renderClients();
    populateClientDropdown();
}

// ========== SETTINGS ==========
function saveSettings() {
    settings = {
        name: document.getElementById('bizName').value.trim(),
        email: document.getElementById('bizEmail').value.trim(),
        phone: document.getElementById('bizPhone').value.trim(),
        address: document.getElementById('bizAddress').value.trim()
    };
    localStorage.setItem('settings', JSON.stringify(settings));
    toggleModal('settingsModal', false);
}

function loadSettings() {
    settings = JSON.parse(localStorage.getItem('settings') || '{}');
}

// ========== INVOICE ACTIONS ==========
function editInvoice(id) {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    editingInvoiceId = id;
    document.getElementById('createTitle').textContent = `Edit ${inv.number}`;
    document.getElementById('invNumber').value = inv.number;
    document.getElementById('invDate').value = inv.date;
    document.getElementById('invDue').value = inv.due;
    document.getElementById('invStatus').value = inv.status;
    document.getElementById('invNotes').value = inv.notes || '';
    document.getElementById('taxRate').value = inv.taxRate || 0;

    populateClientDropdown();
    if (inv.clientId) document.getElementById('invClient').value = inv.clientId;

    document.getElementById('lineItems').innerHTML = '';
    inv.items.forEach(item => {
        addLineItem();
        const rows = document.querySelectorAll('.line-item');
        const last = rows[rows.length - 1];
        last.querySelector('.item-desc').value = item.desc;
        last.querySelector('.item-qty').value = item.qty;
        last.querySelector('.item-rate').value = item.rate;
        updateItemAmount(last);
    });

    calculateTotals();
    switchView('create');
}

function deleteInvoice(id) {
    if (!confirm('Delete this invoice?')) return;
    invoices = invoices.filter(i => i.id !== id);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    renderAll();
    renderInvoicesList();
}

// ========== PREVIEW & PDF ==========
function previewInvoice(id) {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    const preview = document.getElementById('invoicePreview');
    preview.innerHTML = buildInvoiceHtml(inv);
    toggleModal('previewModal', true);

    document.getElementById('previewDownloadBtn').onclick = () => {
        const el = document.getElementById('invoicePreview');
        html2pdf().set({
            margin: 10,
            filename: `${inv.number}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(el).save();
    };
}

function downloadCurrentPdf() {
    const el = document.getElementById('invoicePreview');
    if (!el.innerHTML.trim()) return;
    const number = document.getElementById('invNumber').value || 'invoice';
    html2pdf().set({
        margin: 10,
        filename: `${number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(el).save();
}

function downloadPreviewPdf() {
    const el = document.getElementById('invoicePreview');
    html2pdf().set({
        margin: 10,
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(el).save();
}

function buildInvoiceHtml(inv) {
    return `
    <div class="invoice-preview">
        <div class="preview-header">
            <div>
                <h2>${settings.name || 'Your Business'}</h2>
                <p>${settings.address || ''}</p>
                <p>${settings.email || ''} ${settings.phone ? '| ' + settings.phone : ''}</p>
            </div>
            <div style="text-align:right;">
                <div class="inv-number">${inv.number}</div>
                <p>Date: ${formatDate(inv.date)}</p>
                <p>Due: ${formatDate(inv.due)}</p>
                <p>Status: <strong>${inv.status.toUpperCase()}</strong></p>
            </div>
        </div>
        <div class="preview-meta">
            <div class="meta-block">
                <h4>Bill To</h4>
                <p><strong>${inv.clientName}</strong></p>
                <p>${inv.clientEmail || ''}</p>
                <p>${inv.clientPhone || ''}</p>
                <p>${inv.clientAddress || ''}</p>
            </div>
            <div class="meta-block">
                <h4>Payment Details</h4>
                <p>Total Due: <strong>${formatNaira(inv.total)}</strong></p>
                <p>Due Date: ${formatDate(inv.due)}</p>
            </div>
        </div>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Rate</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${inv.items.map(i => `
                    <tr>
                        <td>${i.desc}</td>
                        <td class="text-right">${i.qty}</td>
                        <td class="text-right">${formatNaira(i.rate)}</td>
                        <td class="text-right">${formatNaira(i.amount)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="preview-totals">
            <div class="preview-total-row"><span>Subtotal</span><span>${formatNaira(inv.subtotal)}</span></div>
            ${inv.taxRate > 0 ? `<div class="preview-total-row"><span>Tax (${inv.taxRate}%)</span><span>${formatNaira(inv.tax)}</span></div>` : ''}
            <div class="preview-total-final"><span>Total</span><span>${formatNaira(inv.total)}</span></div>
        </div>
        ${inv.notes ? `<div class="preview-notes"><strong>Notes:</strong><br>${inv.notes.replace(/\n/g, '<br>')}</div>` : ''}
    </div>`;
}

// ========== HELPERS ==========
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}
