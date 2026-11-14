<?php
declare(strict_types=1);

/**
 * ITCS333 Project starter — m3_cart handler (module under construction).
 * Implement the endpoints in contracts/ for your module.
 * The routing context is in $GLOBALS['__route'] ('area', 'rest', 'uri').
 * Use db() from src/db.php and the helpers in src/http.php.
 */

$rest =$GLOBALS['__route']['rest']?? '';
$method= http_method();
$pdo = db(); 
if(empty($_SESSION['user_id'])){send_error(401, 'AUTH_REQUIRED');}
$user_id =(int) $_SESSION['user_id'];
if ($method==='GET' && $rest=== '') 
    {$stmt = $pdo->prepare('SELECT cart_items.id,
     cart_items.product_id,
        cart_items.qty,
         products.price
         FROM cart_items
         JOIN products ON cart_items.product_id = products.id
         WHERE cart_items.user_id = ?
         ORDER BY cart_items.id');
    $stmt->execute([$user_id]);
    $items= $stmt->fetchAll();
    $data=[]; $total =0;
foreach($items as $item) 
    {$price =(float) $item['price'];
    $qty= (int) $item['qty'];
    $subtotal =$price*$qty;
    $data[] =
        ['id' =>(int) $item['id'],
        'product_id'=> (int) $item['product_id'],
        'qty'=>$qty,
        'unit_price'=>$price,
        'subtotal' =>$subtotal];
    $total+= $subtotal;}
send_json(200, ['data'=> $data,'total'=> $total]);}if ($method === 'POST' && $rest === '') {
    $body =json_body();
    $product_id = (int)($body['product_id']?? 0);
    $qty = (int) ($body['qty'] ?? 0);
    if ($qty< 1) 
        {send_error(422, 'VALIDATION',[ 'fields'=>['qty' => 'must be >= 1']]); }
    $stmt = $pdo->prepare( 'SELECT id, price FROM products WHERE id = ?');
    $stmt->execute([$product_id]);
    $product = $stmt->fetch();
    if (!$product) { send_error(404, 'PRODUCT_NOT_FOUND');}
    $stmt=$pdo->prepare('INSERT INTO cart_items (user_id, product_id, qty)
         VALUES(?, ?, ?)');
    $stmt->execute([$user_id, $product_id, $qty]);
    $id =(int) $pdo->lastInsertId();
    $price=(float) $product['price'];
    send_json(201,['id' => $id,
        'product_id' => $product_id,'qty' => $qty,
        'unit_price' => $price, 'subtotal' => $price * $qty]);}
        if ($method === 'DELETE' &&
    preg_match('#^/([0-9]+)$#', $rest, $matches)) 
   { $id = (int) $matches[1];
    $stmt = $pdo->prepare( 'DELETE FROM cart_items
         WHERE id = ? AND user_id = ?' );
    $stmt->execute([$id, $user_id]);

    if ($stmt->rowCount()=== 0){send_error(404, 'NOT_FOUND'); } send_json(200, ['deleted' => true]);}
send_error(404, 'NOT_FOUND');
    

