<?php
declare(strict_types=1);

/**
 * Intranet Flowti — Seed Script
 * Regenera hashes de senha dos usuários de seed com algoritmo seguro.
 * Executar após o primeiro deploy: php src/seed.php
 */

require_once __DIR__ . '/bootstrap.php';

use App\Config\Database;
use App\Services\LocalAuthStrategy;

echo "🌱 Intranet Flowti — Seed de Senhas\n";
echo str_repeat('─', 40) . "\n\n";

$db = Database::getInstance();
$auth = new LocalAuthStrategy();

$users = [
    ['username' => 'admin',   'password' => 'Admin@Flowti2024'],
    ['username' => 'suporte', 'password' => 'Suporte@Flowti2024'],
    ['username' => 'usuario', 'password' => 'Usuario@Flowti2024'],
];

foreach ($users as $userData) {
    $hash = $auth->hashPassword($userData['password']);

    $stmt = $db->prepare("UPDATE users SET password_hash = :hash WHERE username = :username");
    $stmt->execute([
        ':hash'     => $hash,
        ':username' => $userData['username'],
    ]);

    $updated = $stmt->rowCount();
    $icon = $updated > 0 ? '✅' : '⚠️';
    echo "{$icon} {$userData['username']}: " . ($updated > 0 ? 'Senha atualizada' : 'Usuário não encontrado') . "\n";
}

echo "\n" . str_repeat('─', 40) . "\n";
echo "✨ Seed concluído! Senhas regeneradas com " . (defined('PASSWORD_ARGON2ID') ? 'Argon2id' : 'Bcrypt') . "\n\n";

echo "Credenciais:\n";
foreach ($users as $u) {
    echo "  📧 {$u['username']} → {$u['password']}\n";
}
echo "\n";
