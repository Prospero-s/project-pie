<?php

namespace App\Service\Company;

use App\Service\Company\Scraper\CompanyScraperInterface;
use Psr\Log\LoggerInterface;

class CompanyDataAggregator
{
    /** @var list<CompanyScraperInterface> */
    private array $scrapers;

    /** @var LoggerInterface */
    private LoggerInterface $logger;

    /** @var array<string> */
    private array $requiredFields = ['denomination', 'siren', 'businessStructures'];

    /**
     * @param iterable<CompanyScraperInterface> $scrapers
     */
    public function __construct(iterable $scrapers, LoggerInterface $logger)
    {
        // Convertir l'iterable en array et trier par priorité
        $scrapersArray = iterator_to_array($scrapers);
        usort($scrapersArray, function ($a, $b) {
            return $b->getPriority() <=> $a->getPriority();
        });

        $this->scrapers = $scrapersArray;
        $this->logger = $logger;
    }

    /**
     * @param string $siren
     * @param bool $forceScraping
     * @return array<string, mixed>
     */
    public function getCompanyData(string $siren, bool $forceScraping = false): array
    {
        $errors = [];
        $data = [];

        // Essayer chaque scraper dans l'ordre jusqu'à ce qu'on ait des données complètes
        foreach ($this->scrapers as $scraper) {
            try {
                $this->logger->info('Tentative avec le scraper: ' . get_class($scraper), [
                    'siren' => $siren,
                    'forceScraping' => $forceScraping
                ]);

                $newData = $scraper->scrape($siren, $forceScraping);
                $data = $this->mergeData($data, $newData);

                if ($this->hasRequiredFields($data)) {
                    $this->logger->info('Données complètes obtenues', ['source' => get_class($scraper)]);
                    return $data;
                }
            } catch (\Exception $e) {
                $this->logger->error('Erreur avec le scraper: ' . get_class($scraper), [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                $errors[get_class($scraper)] = $e->getMessage();
            }
        }

        // Si on arrive ici avec des données partielles, on les retourne
        if (!empty($data)) {
            $this->logger->warning('Retour de données partielles', [
                'data' => $data,
                'missing' => array_diff($this->requiredFields, array_keys($data))
            ]);
            return $data;
        }

        // Si on n'a aucune donnée, on lance une exception
        $errorMessage = "Impossible de récupérer les données. Erreurs : " . json_encode($errors);
        $this->logger->error($errorMessage);
        throw new \Exception($errorMessage);
    }

    /**
     * @param array<string, mixed> $data
     * @return bool
     */
    private function hasRequiredFields(array $data): bool
    {
        foreach ($this->requiredFields as $field) {
            if (empty($data[$field])) {
                return false;
            }
        }
        return true;
    }

    /**
     * @param array<string, mixed> $existingData
     * @param array<string, mixed> $newData
     * @return array<string, mixed>
     */
    private function mergeData(array $existingData, array $newData): array
    {
        $merged = $existingData;
        foreach ($newData as $key => $value) {
            if (!isset($merged[$key]) || empty($merged[$key])) {
                $merged[$key] = $value;
            }
        }
        return $merged;
    }
}
