<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\LinkRepository;
use App\Repositories\AuditLogRepository;
use App\Helpers\Validator;

/**
 * Serviço de negócio para gestão de Links.
 */
final class LinkService
{
    private LinkRepository $repo;
    private AuditLogRepository $auditRepo;

    public function __construct()
    {
        $this->repo      = new LinkRepository();
        $this->auditRepo = new AuditLogRepository();
    }

    public function getByPanelId(int $panelId): array
    {
        return $this->repo->findByPanelId($panelId);
    }

    public function getById(int $id): ?array
    {
        return $this->repo->findById($id);
    }

    public function create(array $data, int $currentUserId): array
    {
        if (!empty($data['url']) && is_string($data['url'])) {
            $data['url'] = trim($data['url']);
            if (!preg_match('#^[a-zA-Z][a-zA-Z0-9+\-.]*://#', $data['url'])) {
                $data['url'] = 'https://' . $data['url'];
            }
        }

        $validator = new Validator();
        $validator->required($data, ['panel_id', 'title', 'url'])
                  ->url($data, 'url')
                  ->positiveInt($data, 'panel_id');

        if ($validator->fails()) {
            throw new \InvalidArgumentException(
                json_encode($validator->getErrors(), JSON_UNESCAPED_UNICODE)
            );
        }

        $linkId = $this->repo->create($data);
        $this->auditRepo->log($currentUserId, 'create', 'link', $linkId);

        return $this->repo->findById($linkId);
    }

    public function update(int $id, array $data, int $currentUserId): array
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            throw new \RuntimeException('Link não encontrado.');
        }

        if (isset($data['url']) && is_string($data['url'])) {
            $data['url'] = trim($data['url']);
            if (!preg_match('#^[a-zA-Z][a-zA-Z0-9+\-.]*://#', $data['url'])) {
                $data['url'] = 'https://' . $data['url'];
            }

            $validator = new Validator();
            $validator->url($data, 'url');
            if ($validator->fails()) {
                throw new \InvalidArgumentException(
                    json_encode($validator->getErrors(), JSON_UNESCAPED_UNICODE)
                );
            }
        }

        $this->repo->update($id, $data);
        $this->auditRepo->log($currentUserId, 'update', 'link', $id);

        return $this->repo->findById($id);
    }

    public function delete(int $id, int $currentUserId): bool
    {
        $existing = $this->repo->findById($id);
        if (!$existing) {
            throw new \RuntimeException('Link não encontrado.');
        }

        $result = $this->repo->delete($id);
        $this->auditRepo->log($currentUserId, 'delete', 'link', $id, $existing);

        return $result;
    }

    /**
     * Retorna estatísticas de status dos links
     */
    public function getStatusStats(): array
    {
        return $this->repo->countByStatus();
    }

    /**
     * Importa links em lote a partir de conteúdo CSV para um painel específico.
     * Suporta delimitadores por vírgula (,) e ponto-e-vírgula (;).
     * Cabeçalhos suportados: title/titulo/nome, url/link/endereco, description/descricao, icon/icone
     */
    public function importFromCsv(int $panelId, string $csvContent, int $currentUserId): array
    {
        $panelRepo = new \App\Repositories\PanelRepository();
        $panel = $panelRepo->findById($panelId);
        if (!$panel) {
            throw new \RuntimeException('Painel de destino não encontrado.');
        }

        // Limpa BOM UTF-8 se houver
        $csvContent = preg_replace('/^\xEF\xBB\xBF/', '', trim($csvContent));
        if (empty($csvContent)) {
            throw new \InvalidArgumentException('O arquivo CSV está vazio.');
        }

        // Detecta quebra de linha
        $lines = preg_split('/\r\n|\r|\n/', $csvContent);
        if (empty($lines)) {
            throw new \InvalidArgumentException('Nenhuma linha encontrada no CSV.');
        }

        // Detecta delimitador (, ou ;)
        $firstLine = $lines[0];
        $delimiter = substr_count($firstLine, ';') > substr_count($firstLine, ',') ? ';' : ',';

        $handle = fopen('php://temp', 'r+');
        fwrite($handle, $csvContent);
        rewind($handle);

        $headers = fgetcsv($handle, 0, $delimiter);
        if (!$headers) {
            fclose($handle);
            throw new \InvalidArgumentException('Não foi possível ler os cabeçalhos do CSV.');
        }

        // Mapeia colunas normalizadas (minúsculas sem acentos)
        $headerMap = [];
        foreach ($headers as $idx => $header) {
            $normalized = strtolower(trim((string)$header));
            $normalized = str_replace(['á','à','ã','â'], 'a', $normalized);
            $normalized = str_replace(['é','ê'], 'e', $normalized);
            $normalized = str_replace(['í'], 'i', $normalized);
            $normalized = str_replace(['ó','ô','õ'], 'o', $normalized);
            $normalized = str_replace(['ú'], 'u', $normalized);
            $normalized = str_replace(['ç'], 'c', $normalized);

            if (in_array($normalized, ['title', 'titulo', 'nome', 'sistema', 'aplicacao', 'name'])) {
                $headerMap['title'] = $idx;
            } elseif (in_array($normalized, ['url', 'link', 'endereco', 'uri', 'endpoint'])) {
                $headerMap['url'] = $idx;
            } elseif (in_array($normalized, ['description', 'descricao', 'desc', 'observacao'])) {
                $headerMap['description'] = $idx;
            } elseif (in_array($normalized, ['icon', 'icone', 'icon_class'])) {
                $headerMap['icon'] = $idx;
            }
        }

        if (!isset($headerMap['title']) || !isset($headerMap['url'])) {
            fclose($handle);
            throw new \InvalidArgumentException("O CSV deve conter as colunas 'title' (ou 'titulo') e 'url' (ou 'link').");
        }

        $imported = [];
        $errors = [];
        $rowNumber = 1;

        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $rowNumber++;
            // Pula linhas vazias
            if (empty(array_filter($row, fn($v) => trim((string)$v) !== ''))) {
                continue;
            }

            $title = trim($row[$headerMap['title']] ?? '');
            $url = trim($row[$headerMap['url']] ?? '');
            $desc = isset($headerMap['description']) ? trim($row[$headerMap['description']] ?? '') : '';
            $icon = isset($headerMap['icon']) ? trim($row[$headerMap['icon']] ?? '') : '';

            if (empty($title) || empty($url)) {
                $errors[] = "Linha {$rowNumber}: Título e URL são obrigatórios.";
                continue;
            }

            if (!preg_match('#^[a-zA-Z][a-zA-Z0-9+\-.]*://#', $url)) {
                $url = 'https://' . $url;
            }

            try {
                $linkData = [
                    'panel_id'    => $panelId,
                    'title'       => $title,
                    'url'         => $url,
                    'description' => $desc,
                    'icon'        => !empty($icon) ? $icon : 'ri-global-line',
                ];
                $created = $this->create($linkData, $currentUserId);
                $imported[] = $created;
            } catch (\Throwable $e) {
                $errors[] = "Linha {$rowNumber} ('{$title}'): " . $e->getMessage();
            }
        }

        fclose($handle);

        return [
            'total_imported' => count($imported),
            'total_errors'   => count($errors),
            'imported'       => $imported,
            'errors'         => $errors,
        ];
    }
}
