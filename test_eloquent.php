<?php
require 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "--- ELOQUENT TEST ---\n";
try {
    echo "Counting users with Eloquent...\n";
    $count = User::count();
    echo "Count: $count\n";
    
    echo "Fetching all users...\n";
    $users = User::all();
    foreach($users as $user) {
        echo "- {$user->email}\n";
    }
    echo "Eloquent OK.\n";
} catch (\Exception $e) {
    echo "ELOQUENT ERROR: " . $e->getMessage() . "\n";
}
echo "--- END ---\n";
