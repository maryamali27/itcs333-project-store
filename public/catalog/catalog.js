// m2_catalog page: browse, filter by category, search, and view one product.
// Loaded as a module (type="module"), so nothing here leaks into the global scope.
// Uses apiFetch(), showBanner(), hideBanner() and escapeHtml() from ../app.js.
import { formatPrice, stockText, productTile, skeletonTile } from './tile.js';

const categoryNames = {}; // id -> name, filled by loadCategories()
let selectedCategory = ''; // '' means all categories
let latestRequest = 0;     // used to ignore old answers that arrive late

// Wrap a tile in a Bootstrap grid column.
function column(html) {
  return `<div class="col-sm-6 col-lg-4 col-xl-3">${html}</div>`;
}

// Load categories and add one filter chip for each.
async function loadCategories() {
  const res = await apiFetch('/api/catalog/categories');
  if (!res) return;
  if (!res.ok) {
    showBanner('Could not load categories.');
    return;
  }
  const body = await res.json();
  body.data.forEach((c) => { categoryNames[c.id] = c.name; });

  document.getElementById('category-chips').insertAdjacentHTML('beforeend', body.data.map((c) =>
    `<button type="button" class="btn chip" data-category="${c.id}" aria-pressed="false">${escapeHtml(c.name)}</button>`
  ).join(''));
}

// Show products, using the chosen category and search text.
async function loadCatalog() {
  const params = new URLSearchParams();
  const q = document.getElementById('search').value.trim();
  if (selectedCategory) params.set('category_id', selectedCategory);
  if (q) params.set('q', q);

  const list = document.getElementById('catalog-list');
  const count = document.getElementById('result-count');

  const requestId = ++latestRequest;
  list.setAttribute('aria-busy', 'true');
  const res = await apiFetch('/api/catalog/products?' + params);
  if (requestId !== latestRequest) return; // a newer search has started
  list.setAttribute('aria-busy', 'false');

  if (!res || !res.ok) {
    if (res) showBanner('Could not load products.');
    list.innerHTML = '';
    count.textContent = '';
    return;
  }
  hideBanner();
  const body = await res.json();
  if (requestId !== latestRequest) return;

  count.textContent = body.data.length === 1 ? '1 product' : `${body.data.length} products`;
  if (body.data.length === 0) {
    list.innerHTML = '<p class="text-body-secondary">No products found. Try another search.</p>';
    return;
  }
  list.innerHTML = body.data.map((p) => column(productTile(p, categoryNames[p.category_id]))).join('');
}

// Open the details sheet for one product.
async function showProduct(id) {
  const res = await apiFetch('/api/catalog/products/' + encodeURIComponent(id));
  if (!res) return;

  const sheet = document.getElementById('product-sheet');
  const body = document.getElementById('sheet-body');

  if (!res.ok) {
    body.innerHTML = '<h2 id="sheet-title" class="h4">Product not found</h2>';
  } else {
    const p = await res.json();
    body.innerHTML = `
      <p class="eyebrow mb-2">${escapeHtml(categoryNames[p.category_id] || '')}</p>
      <h2 id="sheet-title" class="sheet-title mb-2">${escapeHtml(p.name)}</h2>
      <p class="price fs-3 mb-1">${formatPrice(p.price)}</p>
      ${stockText(p)}`;
  }
  if (!sheet.open) sheet.showModal();
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('catalog-list').innerHTML = column(skeletonTile()).repeat(4);

  // Category chips: only one can be selected at a time.
  document.getElementById('category-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-category]');
    if (!chip) return;
    selectedCategory = chip.dataset.category;
    document.querySelectorAll('#category-chips [data-category]').forEach((c) => {
      c.setAttribute('aria-pressed', String(c === chip));
    });
    loadCatalog();
  });

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

  const sheet = document.getElementById('product-sheet');
  // Clicking the blurred background (outside the sheet) closes it.
  sheet.addEventListener('click', (e) => {
    if (e.target === sheet) sheet.close();
  });
  // After closing, remove ?product=ID so a refresh does not open it again.
  sheet.addEventListener('close', () => {
    if (location.search) history.replaceState(null, '', location.pathname);
  });

  // Categories first, so tiles can show their category name.
  await loadCategories();
  await loadCatalog();

  // Links like catalog/?product=3 (from the home page) open that product directly.
  const productId = new URLSearchParams(location.search).get('product');
  if (productId && /^\d+$/.test(productId)) showProduct(productId);
});
