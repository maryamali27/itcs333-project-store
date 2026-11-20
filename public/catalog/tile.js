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

// A product card. The product name is the link that covers the whole card:
// with `href` it is a normal link (home page), without it a button with data-id
// (the catalog page opens the details sheet).
export function productTile(p, categoryName, href = '') {
  const name = escapeHtml(p.name);
  const link = href
    ? `<a class="tile-link stretched-link" href="${href}">${name}</a>`
    : `<button type="button" class="tile-link stretched-link" data-id="${p.id}">${name}</button>`;

  return `
    <div class="card card-hover h-100">
      <div class="card-body p-4">
        <p class="eyebrow mb-1">${escapeHtml(categoryName || '')}</p>
        <h3 class="tile-name mb-3">${link}</h3>
        <p class="price mb-1">${formatPrice(p.price)}</p>
        ${stockText(p)}
      </div>
    </div>`;
}

// Gray placeholder card shown while products are loading.
export function skeletonTile() {
  return `
    <div class="card h-100 placeholder-glow" aria-hidden="true">
      <div class="card-body p-4">
        <span class="placeholder col-4 mb-2"></span>
        <span class="placeholder col-8 placeholder-lg mb-3"></span>
        <span class="placeholder col-3 mb-1"></span>
        <span class="placeholder col-5"></span>
      </div>
    </div>`;
}
