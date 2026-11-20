<?php
declare(strict_types=1);

// m2_catalog — Catalog module (Maryam Ali Hasan). Contract: contracts/catalog.md

$rest = $GLOBALS['__route']['rest'] ?? '';   // e.g. "/products" or "/products/3"

// If the database fails, still answer with JSON (never an HTML error page).
set_exception_handler(function () {
    send_error(500, 'SERVER_ERROR');
});

// The catalog is read-only for shoppers (writes happen in m5_admin).
if (http_method() !== 'GET') {
    send_error(405, 'METHOD_NOT_ALLOWED');
}

$pdo = db();

// Return a product with the exact types the contract wants.
function product_json(array $p): array
{
    return [
        'id'          => (int) $p['id'],
        'category_id' => (int) $p['category_id'],
        'name'        => $p['name'],
        'price'       => (float) $p['price'],
        'stock'       => (int) $p['stock'],
    ];
}

// GET /api/catalog/products   (optional ?category_id=N and ?q=text)
if ($rest === '/products') {
    $sql = 'SELECT id, category_id, name, price, stock FROM products WHERE 1=1';
    $params = [];

    // filter_input() gives false/null for bad values like "abc" or q[]=x.
    $categoryId = filter_input(INPUT_GET, 'category_id', FILTER_VALIDATE_INT);
    $q = trim((string) filter_input(INPUT_GET, 'q'));

    if ($categoryId) {
        $sql .= ' AND category_id = ?';
        $params[] = $categoryId;
    }
    if ($q !== '') {
        // LOWER() on both sides = case-insensitive on SQLite, MySQL and PgSQL.
        $sql .= ' AND LOWER(name) LIKE LOWER(?)';
        $params[] = '%' . $q . '%';
    }

    $stmt = $pdo->prepare($sql . ' ORDER BY id');
    $stmt->execute($params);
    send_json(200, ['data' => array_map('product_json', $stmt->fetchAll())]);
}

// GET /api/catalog/products/{id}
if (preg_match('#^/products/(\d+)$#', $rest, $m)) {
    $stmt = $pdo->prepare('SELECT id, category_id, name, price, stock FROM products WHERE id = ?');
    $stmt->execute([(int) $m[1]]);
    $product = $stmt->fetch();

    if (!$product) {
        send_error(404, 'NOT_FOUND');
    }
    send_json(200, product_json($product));
}

// GET /api/catalog/categories
if ($rest === '/categories') {
    $categories = [];
    foreach ($pdo->query('SELECT id, name FROM categories ORDER BY id') as $c) {
        $categories[] = ['id' => (int) $c['id'], 'name' => $c['name']];
    }
    send_json(200, ['data' => $categories]);
}

// Any other URL under /api/catalog
send_error(404, 'NOT_FOUND');
