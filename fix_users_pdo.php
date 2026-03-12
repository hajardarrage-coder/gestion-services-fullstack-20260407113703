<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db   = 'flsh_stats';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $users = [
        ['Admin Gmail', 'admin@gmail.com', password_hash('123456', PASSWORD_BCRYPT), 'admin', null, null],
        ['Admin FLSH', 'admin@gmail.com', password_hash('password', PASSWORD_BCRYPT), 'admin', null, null],
        ['President FLSH', 'president@gmail.com', password_hash('password', PASSWORD_BCRYPT), 'president', null, null],
        ['Responsable RH', 'rh@gmail.com', password_hash('password', PASSWORD_BCRYPT), 'service', 1, 'RH'],
        ['Responsable Pedagogique', 'pedagogique@gmail.com', password_hash('password', PASSWORD_BCRYPT), 'service', 2, 'Pedagogique'],
        ['Responsable Statistique', 'statistique@gmail.com', password_hash('password', PASSWORD_BCRYPT), 'service', 3, 'Statistique'],
    ];

    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, service_id, service_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password), role=VALUES(role), service_id=VALUES(service_id), service_type=VALUES(service_type), updated_at=NOW()");

    foreach ($users as $u) {
        $stmt->execute($u);
        echo "User {$u[1]} ensured.\n";
    }

} catch (Exception $e) {
    echo "PDO ERROR: " . $e->getMessage() . "\n";
}
