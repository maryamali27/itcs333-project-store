// Home page: "The latest" shelf of products with Apple-style arrow (paddle) buttons.
// Loaded as a module. Uses apiFetch() from app.js and the shared tile from the catalog module.
import { productTile, skeletonTile } from './catalog/tile.js';

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

async function loadLatest() {
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
  const categoryNames = {};
  if (categoriesRes && categoriesRes.ok) {
    (await categoriesRes.json()).data.forEach((c) => { categoryNames[c.id] = c.name; });
  }

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

loadLatest();
