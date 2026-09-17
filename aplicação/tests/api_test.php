<?php
declare(strict_types=1);

/**
 * Omniflowti — Test Suite Automatizada (QA Engineer & Tester)
 * Executa a pirâmide de testes de API, RBAC, Autenticação e Integridade.
 * Uso: php tests/api_test.php (ou docker exec flowti-app php tests/api_test.php)
 */

$baseUrl = getenv('TEST_BASE_URL') 
    ?: (file_exists('/.dockerenv') ? 'http://127.0.0.1' : 'http://localhost:8080');
$cookieJar = tempnam(sys_get_temp_dir(), 'omniflowti_cookie_');

$totalTests = 0;
$passedTests = 0;
$failedTests = 0;

function assertTest(string $name, bool $condition, string $details = ''): void {
    global $totalTests, $passedTests, $failedTests;
    $totalTests++;
    if ($condition) {
        $passedTests++;
        echo "  \033[32m✔ PASS\033[0m: {$name}\n";
    } else {
        $failedTests++;
        echo "  \033[31m✖ FAIL\033[0m: {$name}" . ($details ? " — {$details}" : '') . "\n";
    }
}

function apiRequest(string $method, string $path, ?array $body = null, ?string $cookieFile = null): array {
    global $baseUrl;
    $ch = curl_init($baseUrl . $path);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($body !== null) {
        $payload = json_encode($body);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($cookieFile) {
        curl_setopt($ch, CURLOPT_COOKIEJAR, $cookieFile);
        curl_setopt($ch, CURLOPT_COOKIEFILE, $cookieFile);
    }

    $response = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $json = json_decode((string)$response, true);
    return ['code' => $httpCode, 'body' => $json, 'raw' => $response];
}

echo "\n\033[1;36m============================================================\033[0m\n";
echo "\033[1;36m🧪 Omniflowti — Suíte de Testes Automatizados (QA Tester)\033[0m\n";
echo "\033[1;36m============================================================\033[0m\n\n";

// ============================================================
// 1. TESTES DE AUTENTICAÇÃO
// ============================================================
echo "\033[1;33m[1/4] Suíte de Autenticação & Segurança de Sessão\033[0m\n";

// 1.1 Login com campos vazios (422)
$res = apiRequest('POST', '/api/auth/login', []);
assertTest('Rejeita login sem credenciais (422)', $res['code'] === 422);

// 1.2 Login com senha incorreta (401)
$res = apiRequest('POST', '/api/auth/login', ['username' => 'admin', 'password' => 'SenhaErrada123']);
assertTest('Rejeita senha incorreta (401)', $res['code'] === 401 && ($res['body']['success'] ?? null) === false);

// 1.3 Login com usuário inexistente (401)
$res = apiRequest('POST', '/api/auth/login', ['username' => 'naoexiste', 'password' => 'Qualquer123']);
assertTest('Rejeita usuário inexistente (401)', $res['code'] === 401);

// 1.4 Login Admin com sucesso (200)
$adminCookies = tempnam(sys_get_temp_dir(), 'admin_cookie_');
$res = apiRequest('POST', '/api/auth/login', ['username' => 'admin', 'password' => 'Admin@Flowti2024'], $adminCookies);
assertTest('Login Admin válido (200)', $res['code'] === 200 && ($res['body']['data']['username'] ?? '') === 'admin');
assertTest('Admin possui flag is_admin = true', ($res['body']['data']['is_admin'] ?? false) === true);

// 1.5 Login Suporte com sucesso (200)
$suporteCookies = tempnam(sys_get_temp_dir(), 'suporte_cookie_');
$res = apiRequest('POST', '/api/auth/login', ['username' => 'suporte', 'password' => 'Suporte@Flowti2024'], $suporteCookies);
assertTest('Login Suporte válido (200)', $res['code'] === 200 && ($res['body']['data']['username'] ?? '') === 'suporte');
assertTest('Suporte possui flag is_supervisor = true', ($res['body']['data']['is_supervisor'] ?? false) === true);

// 1.6 Login Usuário Colaborador com sucesso (200)
$usuarioCookies = tempnam(sys_get_temp_dir(), 'usuario_cookie_');
$res = apiRequest('POST', '/api/auth/login', ['username' => 'usuario', 'password' => 'Usuario@Flowti2024'], $usuarioCookies);
assertTest('Login Colaborador válido (200)', $res['code'] === 200 && ($res['body']['data']['username'] ?? '') === 'usuario');
assertTest('Colaborador is_admin = false e is_supervisor = false', 
    ($res['body']['data']['is_admin'] ?? true) === false && ($res['body']['data']['is_supervisor'] ?? true) === false);

// ============================================================
// 2. TESTES DE AUTORIZAÇÃO & RBAC (CONTROLE DE ACESSO)
// ============================================================
echo "\n\033[1;33m[2/4] Suíte de Controle de Acesso & RBAC\033[0m\n";

// 2.1 Acesso sem autenticação em rotas protegidas (401)
$res = apiRequest('GET', '/api/panels');
assertTest('Bloqueia GET /api/panels sem sessão (401)', $res['code'] === 401);

$res = apiRequest('GET', '/api/users');
assertTest('Bloqueia GET /api/users sem sessão (401)', $res['code'] === 401);

$res = apiRequest('GET', '/api/groups');
assertTest('Bloqueia GET /api/groups sem sessão (401)', $res['code'] === 401);

// 2.2 Usuário comum acessando rota restrita de Admin (403)
$res = apiRequest('GET', '/api/users', null, $usuarioCookies);
assertTest('Bloqueia Colaborador em GET /api/users (403 Forbidden)', $res['code'] === 403);

$res = apiRequest('POST', '/api/groups', ['name' => 'Teste Hacker'], $usuarioCookies);
assertTest('Bloqueia Colaborador criando grupo (403 Forbidden)', $res['code'] === 403);

// 2.3 Supervisor acessando rota exclusiva de Admin (403)
$res = apiRequest('GET', '/api/users', null, $suporteCookies);
assertTest('Bloqueia Supervisor em GET /api/users (403 Forbidden)', $res['code'] === 403);

// 2.4 Admin acessando rotas de gestão (200)
$res = apiRequest('GET', '/api/users', null, $adminCookies);
assertTest('Permite Admin listar usuários (200)', $res['code'] === 200 && is_array($res['body']['data'] ?? null));

$res = apiRequest('GET', '/api/groups', null, $adminCookies);
assertTest('Permite Admin listar grupos (200)', $res['code'] === 200 && count($res['body']['data'] ?? []) >= 4);

// 2.5 Validação de filtragem RBAC de painéis
$resUsuario = apiRequest('GET', '/api/panels', null, $usuarioCookies);
$usuarioPanels = $resUsuario['body']['data'] ?? [];
$resAdmin = apiRequest('GET', '/api/panels', null, $adminCookies);
$adminPanels = $resAdmin['body']['data'] ?? [];

assertTest('Admin visualiza todos os painéis cadastrados (>= 8 painéis)', count($adminPanels) >= 8);
assertTest('Colaborador visualiza apenas painéis do seu grupo (Financeiro)', 
    count($usuarioPanels) < count($adminPanels) && count($usuarioPanels) >= 1);

// ============================================================
// 3. TESTES DE INTEGRIDADE DE DADOS & LINKS CADASTRADOS
// ============================================================
echo "\n\033[1;33m[3/4] Suíte de Integridade dos Links e Pastas Cadastradas\033[0m\n";

$panelTitles = array_column($adminPanels, 'title');
assertTest('Painel "Sistemas Flowti" existe', in_array('Sistemas Flowti', $panelTitles, true));
assertTest('Painel "Portal-OCI" existe', in_array('Portal-OCI', $panelTitles, true));
assertTest('Painel "Portal-Azure" existe', in_array('Portal-Azure', $panelTitles, true));
assertTest('Painel "Portal-AWS" existe', in_array('Portal-AWS', $panelTitles, true));
assertTest('Painel "Cofres de Senhas" existe', in_array('Cofres de Senhas', $panelTitles, true));
assertTest('Painel "DevOps" existe', in_array('DevOps & Monitoramento', $panelTitles, true) || in_array('DevOps', $panelTitles, true));

// Coleta todos os links retornados para o admin
$allLinks = [];
foreach ($adminPanels as $p) {
    foreach ($p['links'] ?? [] as $lnk) {
        $allLinks[$lnk['title']] = $lnk['url'];
    }
}

assertTest('Link "Flowti-agent" cadastrado', isset($allLinks['Flowti-agent']));
assertTest('Link "Cloud-Inventory" cadastrado', isset($allLinks['Cloud-Inventory']));
assertTest('Link "cloudmvoracle" (OCI) cadastrado', isset($allLinks['cloudmvoracle']));
assertTest('Link "mvcliensaas" (OCI) cadastrado', isset($allLinks['mvcliensaas']));
assertTest('Link "Portal Azure" cadastrado', isset($allLinks['Portal Azure']));
assertTest('Link "Portal AWS" cadastrado', isset($allLinks['Portal AWS']));
assertTest('Link "Passbolt" cadastrado', isset($allLinks['Passbolt']));
assertTest('Link "Keeper" cadastrado', isset($allLinks['Keeper']));
assertTest('Link de monitoramento/cloud cadastrado (Grafana ou Maida-GCP)', isset($allLinks['Grafana']) || isset($allLinks['Maida-GCP']));

// ============================================================
// 4. TESTE DO SISTEMA DE HEALTH CHECK
// ============================================================
echo "\n\033[1;33m[4/4] Suíte de Monitoramento & Health Check\033[0m\n";

$healthRes = apiRequest('POST', '/api/health/check', null, $adminCookies);
assertTest('Endpoint POST /api/health/check responde com sucesso (200)', $healthRes['code'] === 200);
assertTest('Health check retorna estrutura de estatísticas (total e online)', 
    isset($healthRes['body']['data']['stats']['total']) && isset($healthRes['body']['data']['stats']['online']));

$statsRes = apiRequest('GET', '/api/dashboard/stats', null, $adminCookies);
assertTest('Endpoint GET /api/dashboard/stats responde com sucesso (200)', $statsRes['code'] === 200);
assertTest('Stats retorna total_links e links_online', 
    isset($statsRes['body']['data']['total_links']) && isset($statsRes['body']['data']['links_online']));

// ============================================================
// 5. TESTE DE PERMISSÕES DO USUÁRIO NO GRUPO (RBAC PER-GROUP)
// ============================================================
echo "\n\033[1;33m[5/5] Suíte de Permissões Granulares por Grupo (RBAC Per-Group)\033[0m\n";

// 5.1 Busca membros do grupo 1 (TIC)
$membersRes = apiRequest('GET', '/api/groups/1/members', null, $adminCookies);
assertTest('GET /api/groups/1/members responde com 200', $membersRes['code'] === 200);
$members = $membersRes['body']['data'] ?? [];
assertTest('Grupo 1 possui membros cadastrados', count($members) > 0);
$firstMember = $members[0] ?? [];
assertTest('Membro possui campos role, can_manage_links e can_manage_members', 
    array_key_exists('role', $firstMember) && 
    array_key_exists('can_manage_links', $firstMember) && 
    array_key_exists('can_manage_members', $firstMember));

// 5.2 Bloqueia usuário comum de alterar permissões de membro no grupo (403)
$updatePermForbidden = apiRequest('PUT', '/api/groups/1/members/3', [
    'role' => 'admin',
    'can_manage_links' => 1
], $usuarioCookies);
assertTest('Colaborador bloqueado ao tentar alterar permissão no grupo (403 Forbidden)', $updatePermForbidden['code'] === 403);

// 5.3 Admin atualiza permissão do usuário 3 no grupo 1
$updatePermRes = apiRequest('PUT', '/api/groups/1/members/3', [
    'role' => 'supervisor',
    'can_manage_links' => 1,
    'can_manage_members' => 0
], $adminCookies);
assertTest('Admin atualiza papel do usuário no grupo para supervisor (200)', $updatePermRes['code'] === 200);

// 5.4 Verifica se usuário 3 agora possui o grupo com role supervisor
$user3Res = apiRequest('GET', '/api/users/3', null, $adminCookies);
$user3Groups = $user3Res['body']['data']['groups'] ?? [];
$group1Match = array_filter($user3Groups, fn($g) => (int)$g['id'] === 1);
$group1Data = reset($group1Match);
assertTest('Usuário 3 reflete novo papel no grupo (supervisor)', ($group1Data['role'] ?? '') === 'supervisor');
assertTest('Usuário 3 reflete can_manage_links = true no grupo', ($group1Data['can_manage_links'] ?? false) === true);

// 5.5 Atualização de grupos via PUT /api/users/{id} com payload detalhado
$updateUserGroupsRes = apiRequest('PUT', '/api/users/3', [
    'display_name' => 'Colaborador Teste',
    'email' => 'usuario@flowti.com.br',
    'groups' => [
        ['group_id' => 2, 'role' => 'member', 'can_manage_links' => 0, 'can_manage_members' => 0]
    ]
], $adminCookies);
assertTest('PUT /api/users/{id} aceita array de grupos com permissões (200)', $updateUserGroupsRes['code'] === 200);

$user3Reloaded = apiRequest('GET', '/api/users/3', null, $adminCookies);
$u3Groups = $user3Reloaded['body']['data']['groups'] ?? [];
$hasFinanceiro = false;
foreach ($u3Groups as $ug) {
    if ((int)$ug['id'] === 2) {
        $hasFinanceiro = true;
        break;
    }
}
assertTest('Usuário 3 atualizado no grupo Financeiro', $hasFinanceiro);

// ============================================================
// 6. IMPORTAÇÃO EM MASSA VIA .CSV
// ============================================================
echo "\n\033[1;33m📋 Testes de Importação em Massa de Links via CSV\033[0m\n";

// 6.1 Tentativa sem autenticação (deve rejeitar 401)
$unauthCsv = apiRequest('POST', '/api/links/import-csv', [
    'panel_id' => 1,
    'csv_content' => "titulo;url\nTeste;https://teste.com"
]);
assertTest('POST /api/links/import-csv rejeita requisição não autenticada (401)', $unauthCsv['code'] === 401);

// 6.2 Tentativa com dados inválidos (sem panel_id ou sem csv_content)
$invalidCsv = apiRequest('POST', '/api/links/import-csv', [
    'panel_id' => 1,
    'csv_content' => ''
], $adminCookies);
assertTest('POST /api/links/import-csv valida conteúdo vazio (422)', $invalidCsv['code'] === 422);

// 6.3 Importação com sucesso de múltiplos links com delimitador ';'
$csvSample = "titulo;url;descricao;icone\n" .
             "CSV Teste Link Alpha;https://alpha.flowti.internal;Aplicação importada via teste;ri-rocket-line\n" .
             "CSV Teste Link Beta;beta.flowti.internal;Segunda aplicação com auto https;ri-database-line";

$importRes = apiRequest('POST', '/api/links/import-csv', [
    'panel_id' => 1,
    'csv_content' => $csvSample
], $adminCookies);

assertTest('POST /api/links/import-csv importa links com sucesso (201)', $importRes['code'] === 201);
assertTest('Resposta contém total_imported = 2', ($importRes['body']['data']['total_imported'] ?? 0) === 2);
assertTest('Auto-correção de URL adiciona https://', ($importRes['body']['data']['imported'][1]['url'] ?? '') === 'https://beta.flowti.internal');

// Limpeza dos links de teste criados
if (!empty($importRes['body']['data']['imported'])) {
    foreach ($importRes['body']['data']['imported'] as $imp) {
        if (!empty($imp['id'])) {
            apiRequest('DELETE', '/api/links/' . $imp['id'], null, $adminCookies);
        }
    }
}

// Limpeza de cookies de teste
@unlink($adminCookies);
@unlink($suporteCookies);
@unlink($usuarioCookies);

// ============================================================
// RELATÓRIO FINAL
// ============================================================
echo "\n\033[1;36m============================================================\033[0m\n";
echo "\033[1;36m📊 Resumo da Execução de Testes:\033[0m\n";
echo "  Total de Casos de Teste: {$totalTests}\n";
echo "  \033[32mAprovados (Passed):\033[0m    {$passedTests}\n";
if ($failedTests > 0) {
    echo "  \033[31mFalhas (Failed):\033[0m       {$failedTests}\n";
} else {
    echo "  \033[32mFalhas (Failed):\033[0m       0 (100% de sucesso!)\n";
}
echo "\033[1;36m============================================================\033[0m\n\n";

exit($failedTests > 0 ? 1 : 0);
