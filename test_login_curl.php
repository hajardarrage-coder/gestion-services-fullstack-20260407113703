<?php
$url = 'http://localhost:8000/api/login';
$data = [
    'email' => 'rh@flsh.com',
    'password' => 'password',
    'role' => 'service'
];

echo "Testing login to: $url\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "CURL ERROR: $error\n";
} else {
    echo "HTTP CODE: $httpCode\n";
    echo "RESPONSE: $response\n";
}
