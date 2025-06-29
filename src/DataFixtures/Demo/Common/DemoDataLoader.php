<?php

namespace App\DataFixtures\Demo\Common;

class DemoDataLoader
{
    private string $dataPath;

    public function __construct()
    {
        $this->dataPath = __DIR__ . '/..';
    }

    /**
     * Charge les données depuis un fichier JSON
     * @return array<string, mixed>
     */
    public function loadJsonData(string $category, string $filename): array
    {
        $filePath = $this->dataPath . "/{$category}/{$filename}";

        if (!file_exists($filePath)) {
            throw new \RuntimeException("Data file not found: {$filePath}");
        }

        $content = file_get_contents($filePath);
        if ($content === false) {
            throw new \RuntimeException("Cannot read file: {$filePath}");
        }

        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("Invalid JSON in file {$filePath}: " . json_last_error_msg());
        }

        return $data;
    }

    /**
     * Charge les données utilisateur
     * @return array<string, mixed>
     */
    public function loadUserData(): array
    {
        return $this->loadJsonData('User', 'demo-user.json');
    }

    /**
     * Charge les données des entreprises
     * @return array<string, mixed>
     */
    public function loadCompaniesData(): array
    {
        return $this->loadJsonData('Company', 'demo-companies.json');
    }

    /**
     * Charge la configuration des investissements
     * @return array<string, mixed>
     */
    public function loadInvestmentConfig(): array
    {
        return $this->loadJsonData('Investment', 'demo-investments.json');
    }
}
