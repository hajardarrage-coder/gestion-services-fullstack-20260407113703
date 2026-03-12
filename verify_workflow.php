<?php
require 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Demande;
use App\Models\User;
use App\Models\Service;
use Illuminate\Support\Facades\Auth;

echo "--- WORKFLOW TEST START ---\n";

// 1. Setup users
$president = User::where('role', 'president')->first();
$admin = User::where('role', 'admin')->first();
$serviceUser = User::where('role', 'service')->first();
$service = Service::find($serviceUser->service_id) ?: Service::first();

if (!$president || !$admin || !$serviceUser || !$service) {
    echo "ERROR: Missing test data (users or services)\n";
    exit(1);
}

echo "President: {$president->email}\n";
echo "Admin: {$admin->email}\n";
echo "Service: {$service->name}\n";

// 2. President creates demande
Auth::login($president);
$demande = Demande::create([
    'titre' => 'Test Workflow ' . time(),
    'type_donnees' => 'Statistiques',
    'description' => 'Test description',
    'priorite' => 'moyenne',
    'statut' => 'pending',
    'user_id' => $president->id
]);
echo "1. Demande created by President (ID: {$demande->id}, Statut: {$demande->statut})\n";

// 3. Admin assigns to service
Auth::login($admin);
$demande->update([
    'service_id' => $service->id,
    'statut' => 'assigned'
]);
echo "2. Demande assigned by Admin to Service '{$service->name}' (Statut: {$demande->statut})\n";

// 4. Verify Service sees it
Auth::login($serviceUser);
$assignedDemandes = Demande::where('service_id', $service->id)->get();
$found = $assignedDemandes->contains('id', $demande->id);

if ($found) {
    echo "3. SUCCESS: Demande found in Service's assigned list!\n";
} else {
    echo "3. FAILURE: Demande NOT found in Service's assigned list!\n";
    exit(1);
}

echo "--- WORKFLOW TEST SUCCESS ---\n";
