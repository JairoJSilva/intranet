<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\LinkRepository;

/**
 * Serviço de Health Check de Links.
 * Utiliza cURL multi para verificar múltiplos links em paralelo.
 * Timeout estrito de 2000ms conforme regra de negócio.
 */
final class HealthCheckService
{
    private const TIMEOUT_MS = 2000;
    private const WARNING_THRESHOLD_MS = 1000;

    private LinkRepository $linkRepo;

    public function __construct()
    {
        $this->linkRepo = new LinkRepository();
    }

    /**
     * Verifica a saúde de todos os links ativos em paralelo via cURL multi.
     * 
     * @return array Resultado com status atualizado de cada link
     */
    public function checkAll(): array
    {
        $links = $this->linkRepo->findAllActive();

        if (empty($links)) {
            return [];
        }

        $multiHandle = curl_multi_init();
        $handles = [];

        // Cria handles cURL para cada link
        foreach ($links as $link) {
            $ch = curl_init();

            curl_setopt_array($ch, [
                CURLOPT_URL            => $link['url'],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_NOBODY         => true,       // Apenas HEAD request
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS      => 3,
                CURLOPT_TIMEOUT_MS     => self::TIMEOUT_MS,
                CURLOPT_CONNECTTIMEOUT_MS => self::TIMEOUT_MS,
                CURLOPT_SSL_VERIFYPEER => false,      // Aceita certificados autoassinados (intranet)
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_USERAGENT      => 'IntranetFlowti-HealthCheck/1.0',
            ]);

            curl_multi_add_handle($multiHandle, $ch);
            $handles[(int)$link['id']] = [
                'handle' => $ch,
                'link'   => $link,
            ];
        }

        // Executa todas as requisições em paralelo
        $running = null;
        do {
            $status = curl_multi_exec($multiHandle, $running);
            if ($running) {
                curl_multi_select($multiHandle, 0.1);
            }
        } while ($running > 0 && $status === CURLM_OK);

        // Processa resultados
        $results = [];

        foreach ($handles as $linkId => $item) {
            $ch   = $item['handle'];
            $link = $item['link'];

            $httpCode     = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $totalTime    = (int)(curl_getinfo($ch, CURLINFO_TOTAL_TIME) * 1000); // ms
            $curlError    = curl_errno($ch);

            // Determina o status
            if ($curlError !== 0 || $httpCode === 0) {
                $status = 'offline';
                $totalTime = null;
            } elseif ($httpCode >= 200 && $httpCode < 400) {
                $status = $totalTime > self::WARNING_THRESHOLD_MS ? 'warning' : 'online';
            } elseif ($httpCode >= 400 && $httpCode < 500) {
                // 4xx pode ser normal para algumas apps que exigem auth
                $status = 'online';
            } else {
                $status = 'offline';
            }

            // Atualiza no banco
            $this->linkRepo->updateHealthStatus($linkId, $status, $totalTime);

            $results[] = [
                'id'               => $linkId,
                'title'            => $link['title'],
                'url'              => $link['url'],
                'health_status'    => $status,
                'response_time_ms' => $totalTime,
                'http_code'        => $httpCode,
            ];

            curl_multi_remove_handle($multiHandle, $ch);
            curl_close($ch);
        }

        curl_multi_close($multiHandle);

        return $results;
    }

    /**
     * Verifica um único link
     */
    public function checkSingle(int $linkId): ?array
    {
        $link = $this->linkRepo->findById($linkId);

        if (!$link) {
            return null;
        }

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $link['url'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_NOBODY         => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS      => 3,
            CURLOPT_TIMEOUT_MS     => self::TIMEOUT_MS,
            CURLOPT_CONNECTTIMEOUT_MS => self::TIMEOUT_MS,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_USERAGENT      => 'IntranetFlowti-HealthCheck/1.0',
        ]);

        curl_exec($ch);
        $httpCode  = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $totalTime = (int)(curl_getinfo($ch, CURLINFO_TOTAL_TIME) * 1000);
        $curlError = curl_errno($ch);
        curl_close($ch);

        if ($curlError !== 0 || $httpCode === 0) {
            $status = 'offline';
            $totalTime = null;
        } elseif ($httpCode >= 200 && $httpCode < 400) {
            $status = $totalTime > self::WARNING_THRESHOLD_MS ? 'warning' : 'online';
        } elseif ($httpCode >= 400 && $httpCode < 500) {
            $status = 'online';
        } else {
            $status = 'offline';
        }

        $this->linkRepo->updateHealthStatus($linkId, $status, $totalTime);

        return [
            'id'               => $linkId,
            'title'            => $link['title'],
            'url'              => $link['url'],
            'health_status'    => $status,
            'response_time_ms' => $totalTime,
            'http_code'        => $httpCode,
        ];
    }
}
