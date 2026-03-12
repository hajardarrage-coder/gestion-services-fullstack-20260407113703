<?php
require 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Service;
use App\Models\Demande;

echo "--- DB STATUS ---\n";
echo "Users: " . User::count() . "\n";
foreach(User::all() as $u) {
    echo "- {$u->email} ({$u->role})\n";
}
echo "Services: " . Service::count() . "\n";
foreach(Service::all() as $s) {
    echo "- {$s->name}\n";
}
echo "Demandes: " . Demande::count() . "\n";
echo "--- END ---\n";
