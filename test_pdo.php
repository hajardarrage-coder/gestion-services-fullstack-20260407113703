<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db   = 'flsh_stats';

echo "--- RAW PDO TEST ---\n";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Inserting test user via PDO...\n";
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())");
    $stmt->execute(['Test User', 'test@example.com', 'password_hash', 'admin']);
    echo "PDO Insert OK.\n";
    
    echo "Checking user count...\n";
    $count = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    echo "Total users: $count\n";

} catch (Exception $e) {
    echo "PDO ERROR: " . $e->getMessage() . "\n";
}
echo "--- END --- \n";
