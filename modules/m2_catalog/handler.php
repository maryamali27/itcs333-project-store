<?php
declare(strict_types=1);

// m2_catalog — Catalog module (Maryam Ali Hasan). Contract: contracts/catalog.md

$rest = $GLOBALS['__route']['rest'] ?? '';   // e.g. "/products" or "/products/3"
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
    $sql = 'SELECT * FROM products WHERE 1=1';
    $params = [];

    if (!empty($_GET['category_id'])) {
        $sql .= ' AND category_id = ?';
        $params[] = (int) $_GET['category_id'];
    }
    if (!empty($_GET['q'])) {
        $sql .= ' AND name LIKE ?';
        $params[] = '%' . $_GET['q'] . '%';
    }

    $stmt = $pdo->prepare($sql . ' ORDER BY id');
    $stmt->execute($params);
    send_json(200, ['data' => array_map('product_json', $stmt->fetchAll())]);
}

// GET /api/catalog/products/{id}
if (preg_match('#^/products/(\d+)$#', $rest, $m)) {
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
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
