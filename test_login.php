<?php
$url = 'http://localhost:8000/api/login';
$data = [
    'email' => 'admin@gmail.com',
    'password' => 123456,
    'role' => 'admin'
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "RESPONSE: " . $result . "\n";
