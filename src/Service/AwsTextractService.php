<?php

namespace App\Service;

use Aws\Textract\TextractClient;
use Aws\Exception\AwsException;

class AwsTextractService
{
    private TextractClient $client;

    public function __construct()
    {
        $this->client = new TextractClient([
            'region' => $_ENV['AWS_REGION'],
            'version' => 'latest',
            'credentials' => [
                'key' => $_ENV['AWS_ACCESS_KEY_ID'],
                'secret' => $_ENV['AWS_SECRET_ACCESS_KEY'],
            ],
        ]);
    }

    public function analyzeDocument(string $filePath): array
    {
        try {
            $result = $this->client->analyzeDocument([
                'Document' => [
                    'Bytes' => file_get_contents($filePath),
                ],
                'FeatureTypes' => ['TABLES', 'FORMS'],
            ]);

            return $this->structureData($result->toArray());
        } catch (AwsException $e) {
            throw new \RuntimeException('Erreur Textract : ' . $e->getMessage());
        }
    }

    private function structureData(array $data): array
    {
        $blocks = $data['Blocks'] ?? [];

        $structuredData = [
            'text' => [],
            'tables' => [],
            'forms' => []
        ];

        foreach ($blocks as $block) {
            switch ($block['BlockType']) {
                case 'LINE':
                    $structuredData['text'][] = $block['Text'];
                    break;

                case 'TABLE':
                    $table = $this->extractTable($blocks, $block);
                    if (!empty($table)) {
                        $structuredData['tables'][] = $table;
                    }
                    break;

                case 'KEY_VALUE_SET':
                    if (isset($block['EntityTypes']) && in_array('KEY', $block['EntityTypes'])) {
                        $form = $this->extractKeyValue($blocks, $block);
                        if (!empty($form['key']) || !empty($form['value'])) {
                            $structuredData['forms'][] = $form;
                        }
                    }
                    break;
            }
        }

        // Supprime les sections vides pour un rendu propre
        return array_filter($structuredData, function ($section) {
            return !empty($section);
        });
    }

    private function extractTable(array $blocks, array $tableBlock): array
    {
        $table = [];
        foreach ($tableBlock['Relationships'] ?? [] as $relationship) {
            if ($relationship['Type'] === 'CHILD') {
                foreach ($relationship['Ids'] as $childId) {
                    $cellBlock = $this->findBlockById($blocks, $childId);
                    if ($cellBlock && $cellBlock['BlockType'] === 'CELL') {
                        $table[$cellBlock['RowIndex']][$cellBlock['ColumnIndex']] = $cellBlock['Text'] ?? '';
                    }
                }
            }
        }

        return $table;
    }

    private function extractKeyValue(array $blocks, array $keyBlock): array
    {
        $valueBlock = null;
        foreach ($keyBlock['Relationships'] ?? [] as $relationship) {
            if ($relationship['Type'] === 'VALUE') {
                $valueBlock = $this->findBlockById($blocks, $relationship['Ids'][0]);
                break;
            }
        }

        return [
            'key' => $keyBlock['Text'] ?? '',
            'value' => $valueBlock['Text'] ?? ''
        ];
    }

    private function findBlockById(array $blocks, string $id): ?array
    {
        foreach ($blocks as $block) {
            if ($block['Id'] === $id) {
                return $block;
            }
        }

        return null;
    }
}