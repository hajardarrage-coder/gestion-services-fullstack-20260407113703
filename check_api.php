<?php
$ch = curl_init('http://localhost:8000/api/demandes');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP CODE: $http_code\n";
echo "RESPONSE: " . substr($response, 0, 100) . "...\n";
if ($http_code == 0) {
    echo "ERROR: Could not connect to backend. Is 'php artisan serve' running?\n";
}
