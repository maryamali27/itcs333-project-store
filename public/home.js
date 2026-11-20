// Home page: "Shop by category" cards and the "New in the catalog" shelf (with arrow buttons).
// Loaded as a module. Uses apiFetch() and escapeHtml() from app.js and the catalog's shared tile.
import { productTile, skeletonTile } from './catalog/tile.js';

const categoryList = document.getElementById('category-list');
const shelf = document.getElementById('latest-list');
const prev = document.getElementById('shelf-prev');
const next = document.getElementById('shelf-next');

// Enable/disable the arrows at the start and end of the shelf
// (a few pixels of tolerance, because scroll snapping can stop just short of the edge).
function updatePaddles() {
  const max = shelf.scrollWidth - shelf.clientWidth;
  prev.disabled = shelf.scrollLeft <= 4;
  next.disabled = shelf.scrollLeft >= max - 4;
}

function scrollShelf(direction) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  shelf.scrollBy({ left: direction * shelf.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
}

// One compact card per category, with how many products it has.
function renderCategories(categories, products) {
  categoryList.innerHTML = categories.map((c) => {
    const count = products.filter((p) => p.category_id === c.id).length;
    return `
      <div class="card card-hover category-tile">
        <div class="card-body px-4 py-3 d-flex align-items-center justify-content-between gap-3">
          <div>
            <h3 class="category-name mb-0">
              <a class="tile-link stretched-link" href="catalog/?category=${c.id}">${escapeHtml(c.name)}</a>
            </h3>
            <p class="text-body-secondary small mb-0">${count === 1 ? '1 product' : `${count} products`}</p>
          </div>
          <span class="text-body-secondary fs-4" aria-hidden="true">›</span>
        </div>
      </div>`;
  }).join('');
}

async function loadHome() {
  shelf.innerHTML = skeletonTile().repeat(4);

  const [productsRes, categoriesRes] = await Promise.all([
    apiFetch('/api/catalog/products'),
    apiFetch('/api/catalog/categories'),
  ]);
  if (!productsRes || !productsRes.ok) {
    shelf.innerHTML = '';
    updatePaddles();
    return;
  }

  const products = (await productsRes.json()).data;
  const categories = categoriesRes && categoriesRes.ok ? (await categoriesRes.json()).data : [];
  const categoryNames = {};
  categories.forEach((c) => { categoryNames[c.id] = c.name; });

  renderCategories(categories, products);

  // Newest first (highest id), up to 8 products.
  const latest = [...products].sort((a, b) => b.id - a.id).slice(0, 8);
  shelf.innerHTML = latest.map((p) =>
    productTile(p, categoryNames[p.category_id], `catalog/?product=${p.id}`)
  ).join('');
  updatePaddles();
}

prev.addEventListener('click', () => scrollShelf(-1));
next.addEventListener('click', () => scrollShelf(1));
shelf.addEventListener('scroll', updatePaddles, { passive: true });
window.addEventListener('resize', updatePaddles);

loadHome();
