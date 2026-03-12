<?php
require 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Service;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

echo "--- ROBUST SEEDING START ---\n";

try {
    DB::beginTransaction();

    echo "Creating Services...\n";
    $rh = Service::updateOrCreate(['name' => 'RH'], ['description' => 'Ressources Humaines']);
    $ped = Service::updateOrCreate(['name' => 'Pedagogique'], ['description' => 'Service Pédagogique']);
    $stat = Service::updateOrCreate(['name' => 'Statistique'], ['description' => 'Service Statistique']);
    echo "Services OK.\n";

    echo "Creating Admin...\n";
    User::updateOrCreate(
        ['email' => 'admin@gmail.com'],
        [
            'name' => 'Admin FLSH',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]
    );
    echo "Admin OK.\n";

    echo "Creating President...\n";
    User::updateOrCreate(
        ['email' => 'president@gmail.com'],
        [
            'name' => 'President FLSH',
            'password' => Hash::make('password'),
            'role' => 'president',
        ]
    );
    echo "President OK.\n";

    echo "Creating RH User...\n";
    User::updateOrCreate(
        ['email' => 'rh@gmail.com'],
        [
            'name' => 'Responsable RH',
            'password' => Hash::make('password'),
            'role' => 'service',
            'service_id' => $rh->id,
        ]
    );
    echo "RH User OK.\n";

    DB::commit();
    echo "--- SEEDING COMPLETE ---\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "ERROR DURING SEEDING: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " line " . $e->getLine() . "\n";
}
