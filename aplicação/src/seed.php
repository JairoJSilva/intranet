<?php
declare(strict_types=1);

/**
 * Portal Unificado Corporativo — Database Seed Script
 * Cria/atualiza usuários, grupos, painéis, vínculos RBAC e links reais da empresa.
 * Executar após o primeiro deploy: php src/seed.php
 */

require_once __DIR__ . '/bootstrap.php';

use App\Config\Database;
use App\Services\LocalAuthStrategy;

echo "🌱 Portal Unificado — Inicialização de Seed & Dados Reais\n";
echo str_repeat('═', 50) . "\n\n";

$db = Database::getInstance();
$auth = new LocalAuthStrategy();

// ============================================================
// 1. USUÁRIOS
// ============================================================
echo "👤 [1/5] Sincronizando Usuários...\n";
$users = [
    [
        'username'      => 'admin',
        'display_name'  => 'Administrador do Sistema',
        'email'         => 'admin@portal.local',
        'password'      => 'BHU*nji9',
        'is_admin'      => 1,
        'is_supervisor' => 0,
    ],
    [
        'username'      => 'suporte',
        'display_name'  => 'Suporte Técnico TIC',
        'email'         => 'suporte@portal.local',
        'password'      => 'Suporte@Portal2024',
        'is_admin'      => 0,
        'is_supervisor' => 1,
    ],
    [
        'username'      => 'usuario',
        'display_name'  => 'Usuário Colaborador',
        'email'         => 'usuario@portal.local',
        'password'      => 'Usuario@Portal2024',
        'is_admin'      => 0,
        'is_supervisor' => 0,
    ],
];

$userIds = [];
foreach ($users as $u) {
    $hash = $auth->hashPassword($u['password']);

    $stmt = $db->prepare("
        INSERT INTO users (username, display_name, email, password_hash, auth_provider, is_admin, is_supervisor, is_active)
        VALUES (:username, :display_name, :email, :password_hash, 'local', :is_admin, :is_supervisor, 1)
        ON DUPLICATE KEY UPDATE
            display_name  = VALUES(display_name),
            email         = VALUES(email),
            password_hash = VALUES(password_hash),
            is_admin      = VALUES(is_admin),
            is_supervisor = VALUES(is_supervisor),
            is_active     = 1
    ");

    $stmt->execute([
        ':username'      => $u['username'],
        ':display_name'  => $u['display_name'],
        ':email'         => $u['email'],
        ':password_hash' => $hash,
        ':is_admin'      => $u['is_admin'],
        ':is_supervisor' => $u['is_supervisor'],
    ]);

    $idStmt = $db->prepare("SELECT id FROM users WHERE username = :username");
    $idStmt->execute([':username' => $u['username']]);
    $userIds[$u['username']] = (int)$idStmt->fetchColumn();

    echo "  ✅ {$u['username']} (ID: {$userIds[$u['username']]}) sincronizado.\n";
}

// ============================================================
// 2. GRUPOS
// ============================================================
echo "\n👥 [2/5] Sincronizando Grupos...\n";
$groups = [
    'tic' => [
        'name'        => 'TIC',
        'slug'        => 'tic',
        'description' => 'Tecnologia da Informação e Comunicação',
        'icon'        => 'ri-computer-line',
        'color'       => '#0165aa',
    ],
    'financeiro' => [
        'name'        => 'Financeiro',
        'slug'        => 'financeiro',
        'description' => 'Setor Financeiro e Contabilidade',
        'icon'        => 'ri-money-dollar-circle-line',
        'color'       => '#10b981',
    ],
    'recursos-humanos' => [
        'name'        => 'Recursos Humanos',
        'slug'        => 'recursos-humanos',
        'description' => 'Gestão de Pessoas e Departamento Pessoal',
        'icon'        => 'ri-team-line',
        'color'       => '#8b5cf6',
    ],
    'diretoria' => [
        'name'        => 'Diretoria',
        'slug'        => 'diretoria',
        'description' => 'Diretoria Executiva e Estratégica',
        'icon'        => 'ri-building-2-line',
        'color'       => '#f67f1d',
    ],
];

$groupIds = [];
foreach ($groups as $key => $g) {
    $stmt = $db->prepare("
        INSERT INTO `groups` (name, slug, description, icon, color)
        VALUES (:name, :slug, :description, :icon, :color)
        ON DUPLICATE KEY UPDATE
            description = VALUES(description),
            icon        = VALUES(icon),
            color       = VALUES(color)
    ");
    $stmt->execute([
        ':name'        => $g['name'],
        ':slug'        => $g['slug'],
        ':description' => $g['description'],
        ':icon'        => $g['icon'],
        ':color'       => $g['color'],
    ]);

    $idStmt = $db->prepare("SELECT id FROM `groups` WHERE slug = :slug");
    $idStmt->execute([':slug' => $g['slug']]);
    $groupIds[$key] = (int)$idStmt->fetchColumn();

    echo "  ✅ Grupo '{$g['name']}' (ID: {$groupIds[$key]})\n";
}

// ============================================================
// 3. ASSOCIAÇÃO USUÁRIOS ↔ GRUPOS
// ============================================================
echo "\n🔗 [3/5] Vinculando Usuários a Grupos...\n";
$userGroupMap = [
    'admin'   => ['tic', 'diretoria'],
    'suporte' => ['tic'],
    'usuario' => ['financeiro'],
];

foreach ($userGroupMap as $username => $groupSlugs) {
    $uid = $userIds[$username] ?? null;
    if (!$uid) continue;

    foreach ($groupSlugs as $slug) {
        $gid = $groupIds[$slug] ?? null;
        if (!$gid) continue;

        $db->exec("INSERT IGNORE INTO user_groups (user_id, group_id) VALUES ({$uid}, {$gid})");
    }
    echo "  ✅ {$username} associado a [" . implode(', ', $groupSlugs) . "]\n";
}

// ============================================================
// 4. PAINÉIS (PASTAS)
// ============================================================
echo "\n📁 [4/5] Sincronizando Painéis (Pastas)...\n";
$panels = [
    'corporate_systems' => [
        'title'       => 'Sistemas Corporativos',
        'description' => 'Aplicações e agentes internos de automação',
        'icon'        => 'ri-cpu-line',
        'sort_order'  => 1,
    ],
    'portal_oci' => [
        'title'       => 'Portal-OCI',
        'description' => 'Oracle Cloud Infrastructure — Ambientes e Tenants',
        'icon'        => 'ri-cloud-line',
        'sort_order'  => 2,
    ],
    'portal_azure' => [
        'title'       => 'Portal-Azure',
        'description' => 'Microsoft Azure — Portal de Gestão Cloud',
        'icon'        => 'ri-microsoft-line',
        'sort_order'  => 3,
    ],
    'portal_aws' => [
        'title'       => 'Portal-AWS',
        'description' => 'Amazon Web Services — Console de Gestão Cloud',
        'icon'        => 'ri-amazon-line',
        'sort_order'  => 4,
    ],
    'vaults' => [
        'title'       => 'Cofres de Senhas',
        'description' => 'Cofres e gerenciadores corporativos de senhas',
        'icon'        => 'ri-shield-keyhole-line',
        'sort_order'  => 5,
    ],
    'devops' => [
        'title'       => 'DevOps & Monitoramento',
        'description' => 'Operações, observabilidade e gestão de chamados',
        'icon'        => 'ri-pulse-line',
        'sort_order'  => 6,
    ],
    'financeiro' => [
        'title'       => 'Financeiro',
        'description' => 'Sistemas de faturamento e notas fiscais',
        'icon'        => 'ri-bill-line',
        'sort_order'  => 7,
    ],
    'rh' => [
        'title'       => 'Recursos Humanos',
        'description' => 'Sistemas de gestão de pessoas e benefícios',
        'icon'        => 'ri-user-heart-line',
        'sort_order'  => 8,
    ],
];

$panelIds = [];
foreach ($panels as $key => $p) {
    $checkStmt = $db->prepare("SELECT id FROM panels WHERE title = :title");
    $checkStmt->execute([':title' => $p['title']]);
    $existingId = $checkStmt->fetchColumn();

    if ($existingId) {
        $panelIds[$key] = (int)$existingId;
        $db->prepare("UPDATE panels SET description = :desc, icon = :icon, sort_order = :sort WHERE id = :id")
           ->execute([
               ':desc' => $p['description'],
               ':icon' => $p['icon'],
               ':sort' => $p['sort_order'],
               ':id'   => $existingId,
           ]);
    } else {
        $insStmt = $db->prepare("INSERT INTO panels (title, description, icon, sort_order, is_active) VALUES (:title, :desc, :icon, :sort, 1)");
        $insStmt->execute([
            ':title' => $p['title'],
            ':desc'  => $p['description'],
            ':icon'  => $p['icon'],
            ':sort'  => $p['sort_order'],
        ]);
        $panelIds[$key] = (int)$db->lastInsertId();
    }
    echo "  ✅ Painel '{$p['title']}' (ID: {$panelIds[$key]})\n";
}

// Vincula painéis a grupos
$groupPanelMap = [
    'tic'        => ['corporate_systems', 'portal_oci', 'portal_azure', 'portal_aws', 'vaults', 'devops'],
    'financeiro' => ['financeiro'],
    'recursos-humanos' => ['rh'],
    'diretoria'  => ['corporate_systems', 'portal_oci', 'portal_azure', 'portal_aws', 'devops', 'financeiro'],
];

foreach ($groupPanelMap as $gSlug => $pKeys) {
    $gid = $groupIds[$gSlug] ?? null;
    if (!$gid) continue;

    foreach ($pKeys as $pKey) {
        $pid = $panelIds[$pKey] ?? null;
        if (!$pid) continue;
        $db->exec("INSERT IGNORE INTO group_panels (group_id, panel_id) VALUES ({$gid}, {$pid})");
    }
}

// ============================================================
// 5. LINKS REAIS (A partir de links corporativos genéricos)
// ============================================================
echo "\n🔗 [5/5] Sincronizando Links Reais...\n";
$realLinks = [
    // Sistemas Corporativos
    [
        'panel_key'   => 'corporate_systems',
        'title'       => 'Agent-Interno',
        'url'         => 'https://agent.empresa.local/index.php',
        'description' => 'Agente de monitoramento e automação interno',
        'icon'        => 'ri-robot-line',
        'sort_order'  => 1,
    ],
    [
        'panel_key'   => 'corporate_systems',
        'title'       => 'Cloud-Inventory',
        'url'         => 'https://inventario.empresa.local/index.php',
        'description' => 'Inventário de recursos e infraestrutura cloud',
        'icon'        => 'ri-server-line',
        'sort_order'  => 2,
    ],

    // Portal-OCI
    [
        'panel_key'   => 'portal_oci',
        'title'       => 'OCI-Frankfurt',
        'url'         => 'https://cloud.oracle.com/?region=eu-frankfurt-1',
        'description' => 'Oracle Cloud — Tenant Frankfurt (eu-frankfurt-1)',
        'icon'        => 'ri-cloud-line',
        'sort_order'  => 1,
    ],
    [
        'panel_key'   => 'portal_oci',
        'title'       => 'OCI-SaoPaulo',
        'url'         => 'https://cloud.oracle.com/?region=sa-saopaulo-1',
        'description' => 'Oracle Cloud — Tenant São Paulo (sa-saopaulo-1)',
        'icon'        => 'ri-cloud-line',
        'sort_order'  => 2,
    ],

    // Portal-Azure
    [
        'panel_key'   => 'portal_azure',
        'title'       => 'Portal Azure',
        'url'         => 'https://portal.azure.com',
        'description' => 'Console de administração Microsoft Azure',
        'icon'        => 'ri-microsoft-line',
        'sort_order'  => 1,
    ],

    // Portal-AWS
    [
        'panel_key'   => 'portal_aws',
        'title'       => 'Portal AWS',
        'url'         => 'https://console.aws.amazon.com',
        'description' => 'AWS Management Console — Acesso global aos serviços',
        'icon'        => 'ri-amazon-line',
        'sort_order'  => 1,
    ],

    // Cofres de Senhas
    [
        'panel_key'   => 'vaults',
        'title'       => 'Passbolt',
        'url'         => 'https://passbolt.empresa.local/app/passwords',
        'description' => 'Cofre de senhas corporativo compartilhado',
        'icon'        => 'ri-key-2-line',
        'sort_order'  => 1,
    ],
    [
        'panel_key'   => 'vaults',
        'title'       => 'Keeper',
        'url'         => 'https://keepersecurity.com/vault/#',
        'description' => 'Keeper Security Vault — Cofre seguro de senhas',
        'icon'        => 'ri-safe-2-line',
        'sort_order'  => 2,
    ],

    // DevOps & Monitoramento
    [
        'panel_key'   => 'devops',
        'title'       => 'Grafana',
        'url'         => 'https://dash.empresa.local/login',
        'description' => 'Dashboards de telemetria e monitoramento',
        'icon'        => 'ri-dashboard-3-line',
        'sort_order'  => 1,
    ],
    [
        'panel_key'   => 'devops',
        'title'       => 'Jira-Operações',
        'url'         => 'https://jira.empresa.local/projects/OPS',
        'description' => 'Gestão de demandas e chamados de Operações',
        'icon'        => 'ri-task-line',
        'sort_order'  => 2,
    ],

    // Financeiro
    [
        'panel_key'   => 'financeiro',
        'title'       => 'Sistema NFe',
        'url'         => 'https://nfe.empresa.local',
        'description' => 'Emissão de notas fiscais eletrônicas',
        'icon'        => 'ri-file-text-line',
        'sort_order'  => 1,
    ],
    [
        'panel_key'   => 'financeiro',
        'title'       => 'ERP Financeiro',
        'url'         => 'https://erp.empresa.local/financeiro',
        'description' => 'Módulo financeiro do ERP',
        'icon'        => 'ri-funds-line',
        'sort_order'  => 2,
    ],

    // Recursos Humanos
    [
        'panel_key'   => 'rh',
        'title'       => 'Ponto Eletrônico',
        'url'         => 'https://ponto.empresa.local',
        'description' => 'Sistema de ponto e frequência',
        'icon'        => 'ri-time-line',
        'sort_order'  => 1,
    ],
    [
        'panel_key'   => 'rh',
        'title'       => 'Portal Colaborador',
        'url'         => 'https://rh.empresa.local',
        'description' => 'Holerites, férias e benefícios',
        'icon'        => 'ri-user-smile-line',
        'sort_order'  => 2,
    ],
];

foreach ($realLinks as $lnk) {
    $pid = $panelIds[$lnk['panel_key']] ?? null;
    if (!$pid) continue;

    $checkLink = $db->prepare("SELECT id FROM links WHERE panel_id = :pid AND title = :title");
    $checkLink->execute([':pid' => $pid, ':title' => $lnk['title']]);
    $linkId = $checkLink->fetchColumn();

    if ($linkId) {
        $db->prepare("
            UPDATE links 
            SET url = :url, description = :desc, icon = :icon, sort_order = :sort, is_active = 1
            WHERE id = :id
        ")->execute([
            ':url'  => $lnk['url'],
            ':desc' => $lnk['description'],
            ':icon' => $lnk['icon'],
            ':sort' => $lnk['sort_order'],
            ':id'   => $linkId,
        ]);
        echo "  🔄 Atualizado: {$lnk['title']} ({$lnk['url']})\n";
    } else {
        $db->prepare("
            INSERT INTO links (panel_id, title, url, description, icon, sort_order, is_active)
            VALUES (:pid, :title, :url, :desc, :icon, :sort, 1)
        ")->execute([
            ':pid'   => $pid,
            ':title' => $lnk['title'],
            ':url'   => $lnk['url'],
            ':desc'  => $lnk['description'],
            ':icon'  => $lnk['icon'],
            ':sort'  => $lnk['sort_order'],
        ]);
        echo "  ✨ Cadastrado: {$lnk['title']} ({$lnk['url']})\n";
    }
}

echo "\n" . str_repeat('═', 50) . "\n";
echo "🎉 Seed finalizado com sucesso no Portal Unificado!\n\n";
echo "Credenciais de Acesso:\n";
foreach ($users as $u) {
    echo "  🔑 {$u['username']} → {$u['password']} ({$u['display_name']})\n";
}
echo "\n";
