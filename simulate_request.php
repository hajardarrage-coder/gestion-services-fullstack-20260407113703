<?php
require 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';

use Illuminate\Http\Request;

$request = Request::create('/api/demandes', 'GET');
$request->headers->set('Accept', 'application/json');

$response = $app->handle($request);

echo "STATUS: " . $response->getStatusCode() . "\n";
echo "CONTENT: " . substr($response->getContent(), 0, 500) . "...\n";
if ($response->getStatusCode() == 500) {
    echo "ERROR DETECTED.\n";
}
