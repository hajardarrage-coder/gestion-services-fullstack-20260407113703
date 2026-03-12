<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db   = 'flsh_stats';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "TABLE: services\n";
    $stmt = $pdo->query("SELECT * FROM services");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        print_r($row);
    }

    echo "\nTABLE: users (Structure)\n";
    $stmt = $pdo->query("DESCRIBE users");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        print_r($row);
    }

} catch (Exception $e) {
    echo "PDO ERROR: " . $e->getMessage() . "\n";
}
