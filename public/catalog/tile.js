// m2_catalog - one product tile design, shared by the catalog page and the home page.
// Uses escapeHtml() from ../app.js (load app.js before any module that imports this file).

export function formatPrice(price) {
  return '$' + price.toFixed(2);
}

// "50 in stock" or "Out of stock".
export function stockText(p) {
  return p.stock > 0
    ? `<p class="stock">${p.stock} in stock</p>`
    : '<p class="stock stock-out">Out of stock</p>';
}

// A product card. With `href` the tile is a link (home page);
// without it, it is a button with data-id (catalog page opens the sheet).
export function productTile(p, categoryName, href = '') {
  const name = escapeHtml(p.name);
  const label = `View details<i class="bi bi-chevron-right ms-1" aria-hidden="true"></i>`;
  const action = href
    ? `<a class="link-more stretched-link" href="${href}" aria-label="View details: ${name}">${label}</a>`
    : `<button type="button" class="link-more stretched-link" data-id="${p.id}" aria-label="View details: ${name}">${label}</button>`;

  return `
    <div class="card card-hover h-100">
      <div class="card-body p-4 d-flex flex-column">
        <p class="eyebrow mb-2">${escapeHtml(categoryName || '')}</p>
        <h3 class="card-title tile-name mb-2">${name}</h3>
        <p class="price mb-1">${formatPrice(p.price)}</p>
        ${stockText(p)}
        <div class="mt-auto pt-4">${action}</div>
      </div>
    </div>`;
}

// Gray placeholder card shown while products are loading.
export function skeletonTile() {
  return `
    <div class="card h-100 placeholder-glow" aria-hidden="true">
      <div class="card-body p-4">
        <span class="placeholder col-4 mb-3"></span>
        <span class="placeholder col-8 placeholder-lg mb-2"></span>
        <span class="placeholder col-3 mb-5"></span>
        <span class="placeholder col-5"></span>
      </div>
    </div>`;
}
