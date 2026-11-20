// m2_catalog page: browse, filter by category, search, and view one product.
// Uses apiFetch(), showBanner() and escapeHtml() from ../app.js.
'use strict';

// Fill the category dropdown.
async function loadCategories() {
  const res = await apiFetch('/api/catalog/categories');
  if (!res) return;
  if (!res.ok) {
    showBanner('Could not load categories.');
    return;
  }
  const body = await res.json();
  const select = document.getElementById('category');
  select.innerHTML += body.data.map((c) =>
    `<option value="${c.id}">${escapeHtml(c.name)}</option>`
  ).join('');
}

// Show products, using the chosen category and search text.
async function loadCatalog() {
  const params = new URLSearchParams();
  const category = document.getElementById('category').value;
  const q = document.getElementById('search').value.trim();
  if (category) params.set('category_id', category);
  if (q) params.set('q', q);

  const res = await apiFetch('/api/catalog/products?' + params);
  if (!res) return;
  if (!res.ok) {
    showBanner('Could not load products.');
    return;
  }
  hideBanner();
  const body = await res.json();
  const list = document.getElementById('catalog-list');

  if (body.data.length === 0) {
    list.innerHTML = '<p class="text-muted">No products found.</p>';
    return;
  }
  list.innerHTML = body.data.map((p) => `
    <div class="col-sm-6 col-md-4 col-lg-3">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${escapeHtml(p.name)}</h5>
          <p class="card-text fw-bold">$${p.price.toFixed(2)}</p>
          ${p.stock > 0
            ? `<span class="badge text-bg-success">${p.stock} in stock</span>`
            : '<span class="badge text-bg-secondary">Out of stock</span>'}
        </div>
        <div class="card-footer bg-transparent border-0">
          <button type="button" class="btn btn-sm btn-outline-primary stretched-link"
                  data-id="${p.id}">View details</button>
        </div>
      </div>
    </div>`
  ).join('');
}

// Show one product's details.
async function showProduct(id) {
  const res = await apiFetch('/api/catalog/products/' + id);
  if (!res) return;
  const box = document.getElementById('product-detail');
  box.hidden = false;
  box.scrollIntoView({ behavior: 'smooth' });

  if (!res.ok) {
    box.innerHTML = '<div class="card-body">Product not found.</div>';
    return;
  }
  const p = await res.json();
  box.innerHTML = `
    <div class="card-body">
      <h4 class="card-title">${escapeHtml(p.name)}</h4>
      <p class="mb-1">Price: $${p.price.toFixed(2)}</p>
      <p class="mb-0">Stock: ${p.stock}</p>
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadCatalog();

  document.getElementById('category').addEventListener('change', loadCatalog);

  // Wait until the user stops typing for 300 ms, then search once.
  let timer;
  document.getElementById('search').addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(loadCatalog, 300);
  });

  document.getElementById('catalog-list').addEventListener('click', (e) => {
    const button = e.target.closest('button[data-id]');
    if (button) showProduct(button.dataset.id);
  });
});
