<?php
declare(strict_types=1);

namespace App\Services;

final class FaviconService
{
    private string $storageDir;
    private string $publicUrlPrefix;

    public function __construct(?string $storageDir = null, string $publicUrlPrefix = '/uploads/favicons')
    {
        $this->storageDir = $storageDir ?? dirname(__DIR__, 2) . '/public/uploads/favicons';
        $this->publicUrlPrefix = $publicUrlPrefix;

        if (!is_dir($this->storageDir)) {
            @mkdir($this->storageDir, 0777, true);
        }
    }

    /**
     * Detecta e baixa o favicon de uma URL alvo.
     * Retorna array com status, caminho do ícone e/ou ícone sugerido.
     */
    public function detectAndDownload(string $targetUrl): array
    {
        $targetUrl = trim($targetUrl);
        if (empty($targetUrl)) {
            return [
                'found'          => false,
                'icon_url'       => null,
                'suggested_icon' => 'ri-global-line',
                'message'        => 'URL não fornecida.',
            ];
        }

        // Adiciona esquema caso omitido
        if (!preg_match('#^[a-zA-Z][a-zA-Z0-9+\-.]*://#', $targetUrl)) {
            $targetUrl = 'https://' . $targetUrl;
        }

        $parsed = parse_url($targetUrl);
        if (!$parsed || empty($parsed['host'])) {
            return [
                'found'          => false,
                'icon_url'       => null,
                'suggested_icon' => 'ri-global-line',
                'message'        => 'URL inválida.',
            ];
        }

        $scheme  = $parsed['scheme'] ?? 'https';
        $host    = $parsed['host'];
        $port    = isset($parsed['port']) ? ':' . $parsed['port'] : '';
        $baseUrl = "{$scheme}://{$host}{$port}";

        $candidates = [];

        // 1. Tenta baixar o HTML para localizar tags <link rel="*icon" ...>
        $html = $this->fetchUrlContent($targetUrl, 4);
        if (!empty($html)) {
            $extracted = $this->extractFaviconsFromHtml($html, $baseUrl, $targetUrl);
            foreach ($extracted as $candidate) {
                $candidates[] = $candidate;
            }
        }

        // 2. Fallbacks diretos no domínio raiz
        $candidates[] = "{$baseUrl}/favicon.ico";
        $candidates[] = "{$baseUrl}/favicon.png";
        $candidates[] = "{$baseUrl}/apple-touch-icon.png";
        $candidates[] = "{$baseUrl}/apple-touch-icon-precomposed.png";

        // 3. Fallback de serviço externo confiável (Google Favicons API) caso o host direto não responda
        if (filter_var($host, FILTER_VALIDATE_IP) === false && !str_contains($host, 'localhost') && !str_contains($host, '.internal') && !str_contains($host, '.local')) {
            $candidates[] = "https://www.google.com/s2/favicons?domain={$host}&sz=128";
        }

        $candidates = array_values(array_unique($candidates));

        // 4. Itera candidatos até encontrar um favicon válido
        foreach ($candidates as $candidateUrl) {
            $downloaded = $this->downloadFavicon($candidateUrl, $host);
            if ($downloaded !== null) {
                return [
                    'found'          => true,
                    'icon_url'       => $downloaded['public_url'],
                    'source_url'     => $candidateUrl,
                    'suggested_icon' => null,
                    'message'        => 'Favicon detectado e baixado com sucesso.',
                ];
            }
        }

        // 5. Se nenhum foi baixado, sugere RemixIcon inteligente baseado em palavras-chave da URL
        $suggestedIcon = $this->suggestRemixIcon($host, $targetUrl);

        return [
            'found'          => false,
            'icon_url'       => null,
            'source_url'     => null,
            'suggested_icon' => $suggestedIcon,
            'message'        => 'Nenhum favicon encontrado no destino. Ícone contextual sugerido.',
        ];
    }

    /**
     * Extrai URLs de favicons de um documento HTML
     * @return string[]
     */
    private function extractFaviconsFromHtml(string $html, string $baseUrl, string $pageUrl): array
    {
        $urls = [];

        // Captura tags <link ...>
        if (preg_match_all('/<link\b[^>]*>/i', $html, $matches)) {
            foreach ($matches[0] as $linkTag) {
                // Verifica se tem rel com icon
                if (preg_match('/\brel=["\']([^"\']*(?:shortcut\s+)?icon|apple-touch-icon[^"\']*)["\']/i', $linkTag)) {
                    if (preg_match('/\bhref=["\']([^"\']+)["\']/i', $linkTag, $hrefMatch)) {
                        $href = trim($hrefMatch[1]);
                        if (!empty($href) && !str_starts_with($href, 'data:')) {
                            $resolved = $this->resolveUrl($href, $baseUrl, $pageUrl);
                            if ($resolved) {
                                $urls[] = $resolved;
                            }
                        }
                    }
                }
            }
        }

        return $urls;
    }

    /**
     * Resolve caminhos relativos em URLs absolutas completas
     */
    private function resolveUrl(string $url, string $baseUrl, string $pageUrl): ?string
    {
        // Já é absoluta
        if (preg_match('#^https?://#i', $url)) {
            return $url;
        }

        // Começa com protocolo agnóstico //
        if (str_starts_with($url, '//')) {
            $scheme = parse_url($baseUrl, PHP_URL_SCHEME) ?? 'https';
            return "{$scheme}:{$url}";
        }

        // Relativa à raiz
        if (str_starts_with($url, '/')) {
            return rtrim($baseUrl, '/') . $url;
        }

        // Relativa ao diretório atual da página
        $pagePath = parse_url($pageUrl, PHP_URL_PATH) ?? '/';
        $pageDir  = dirname($pagePath);
        if ($pageDir === '\\' || $pageDir === '.') {
            $pageDir = '/';
        }
        $pageDir = rtrim($pageDir, '/');

        return rtrim($baseUrl, '/') . $pageDir . '/' . ltrim($url, '/');
    }

    /**
     * Baixa os bytes do favicon e salva localmente
     */
    private function downloadFavicon(string $url, string $host): ?array
    {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS      => 3,
            CURLOPT_TIMEOUT        => 4,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ]);

        $content = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: '';
        curl_close($ch);

        if ($content === false || $httpCode < 200 || $httpCode >= 400 || strlen($content) < 30) {
            return null;
        }

        // Valida se não é uma página HTML de erro 404 disfarçada de 200
        $prefix = strtolower(substr(trim($content), 0, 60));
        if (str_starts_with($prefix, '<!doctype html') || str_starts_with($prefix, '<html') || str_starts_with($prefix, '<?xml') && !str_contains($prefix, '<svg')) {
            return null;
        }

        $ext = $this->determineExtension($contentType, $content, $url);
        $cleanHost = preg_replace('/[^a-zA-Z0-9_\-.]/', '_', $host);
        $hash = substr(md5($cleanHost . '_' . $url), 0, 16);
        $filename = "fav_{$cleanHost}_{$hash}.{$ext}";
        $filepath = $this->storageDir . '/' . $filename;

        if (@file_put_contents($filepath, $content) === false) {
            return null;
        }

        return [
            'filename'   => $filename,
            'public_url' => rtrim($this->publicUrlPrefix, '/') . '/' . $filename,
        ];
    }

    /**
     * Determina a extensão do arquivo a partir do Content-Type ou cabeçalho do arquivo
     */
    private function determineExtension(string $contentType, string $content, string $url): string
    {
        $ct = strtolower($contentType);
        if (str_contains($ct, 'svg') || str_contains($content, '<svg')) {
            return 'svg';
        }
        if (str_contains($ct, 'png') || str_starts_with($content, "\x89PNG")) {
            return 'png';
        }
        if (str_contains($ct, 'webp') || str_contains(substr($content, 0, 16), 'WEBP')) {
            return 'webp';
        }
        if (str_contains($ct, 'jpeg') || str_contains($ct, 'jpg') || str_starts_with($content, "\xFF\xD8\xFF")) {
            return 'jpg';
        }
        if (str_contains($ct, 'icon') || str_contains($ct, 'ico') || str_starts_with($content, "\x00\x00\x01\x00")) {
            return 'ico';
        }

        // Checa extensão na própria URL
        $path = parse_url($url, PHP_URL_PATH) ?? '';
        $urlExt = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (in_array($urlExt, ['ico', 'png', 'svg', 'webp', 'jpg', 'gif'])) {
            return $urlExt;
        }

        return 'ico';
    }

    /**
     * Busca o conteúdo de texto de uma URL com cURL
     */
    private function fetchUrlContent(string $url, int $timeoutSeconds): ?string
    {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS      => 3,
            CURLOPT_TIMEOUT        => $timeoutSeconds,
            CURLOPT_CONNECTTIMEOUT => 2,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ]);

        $content = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($content === false || $httpCode < 200 || $httpCode >= 400) {
            return null;
        }

        return (string)$content;
    }

    /**
     * Sugere um RemixIcon inteligente caso o favicon não esteja disponível
     */
    private function suggestRemixIcon(string $host, string $url): string
    {
        $text = strtolower("{$host} {$url}");

        $iconMap = [
            'grafana'     => 'ri-line-chart-line',
            'zabbix'      => 'ri-pulse-line',
            'prometheus'  => 'ri-fire-line',
            'kibana'      => 'ri-pie-chart-2-line',
            'elastic'     => 'ri-search-eye-line',
            'gitlab'      => 'ri-gitlab-line',
            'github'      => 'ri-github-line',
            'bitbucket'   => 'ri-git-branch-line',
            'jira'        => 'ri-task-line',
            'confluence'  => 'ri-book-read-line',
            'wiki'        => 'ri-book-open-line',
            'docs'        => 'ri-article-line',
            'jenkins'     => 'ri-hammer-line',
            'argocd'      => 'ri-ship-line',
            'kubernetes'  => 'ri-steering-2-line',
            'docker'      => 'ri-apps-2-line',
            'mail'        => 'ri-mail-line',
            'webmail'     => 'ri-mail-send-line',
            'outlook'     => 'ri-mail-line',
            'sso'         => 'ri-shield-keyhole-line',
            'auth'        => 'ri-lock-password-line',
            'keycloak'    => 'ri-key-2-line',
            'ldap'        => 'ri-user-shared-line',
            'postgres'    => 'ri-database-2-line',
            'mysql'       => 'ri-database-line',
            'oracle'      => 'ri-database-2-line',
            'redis'       => 'ri-stack-line',
            'db'          => 'ri-database-line',
            'vpn'         => 'ri-shield-check-line',
            'telecom'     => 'ri-router-line',
            'cisco'       => 'ri-router-line',
            'fortinet'    => 'ri-shield-cross-line',
            'glpi'        => 'ri-customer-service-2-line',
            'chamados'    => 'ri-customer-service-line',
            'suporte'     => 'ri-headphone-line',
            'cloud'       => 'ri-cloud-line',
            'aws'         => 'ri-cloud-line',
            'azure'       => 'ri-cloud-line',
            'drive'       => 'ri-folder-shared-line',
            'nextcloud'   => 'ri-cloud-line',
            'sharepoint'  => 'ri-folder-user-line',
        ];

        foreach ($iconMap as $keyword => $icon) {
            if (str_contains($text, $keyword)) {
                return $icon;
            }
        }

        return 'ri-global-line';
    }
}
