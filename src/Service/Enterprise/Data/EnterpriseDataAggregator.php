<?php

namespace App\Service\Enterprise\Data;

use App\Service\Enterprise\Scraper\EnterpriseScraperInterface;
use Psr\Log\LoggerInterface;

class EnterpriseDataAggregator implements EnterpriseDataAggregatorInterface
{
    /**
     * @param iterable<EnterpriseScraperInterface> $scrapers
     */
    public function __construct(
        private readonly iterable $scrapers,
        private readonly LoggerInterface $logger
    ) {}

    public function aggregate(string $siren): array
    {
        $aggregatedData = [];
        $errors = [];

        foreach ($this->scrapers as $scraper) {
            try {
                $this->logger->info('Tentative de scraping avec ' . get_class($scraper), [
                    'siren' => $siren
                ]);
                
                $data = $scraper->scrape($siren);
                $aggregatedData = array_merge($aggregatedData, $data);
                
                $this->logger->info('Scraping réussi avec ' . get_class($scraper), [
                    'siren' => $siren
                ]);
            } catch (\Exception $e) {
                $errors[] = [
                    'scraper' => get_class($scraper),
                    'error' => $e->getMessage()
                ];
                
                $this->logger->warning('Échec du scraping avec ' . get_class($scraper), [
                    'siren' => $siren,
                    'error' => $e->getMessage()
                ]);
            }
        }

        if (empty($aggregatedData) && !empty($errors)) {
            throw new \Exception('Aucune donnée n\'a pu être récupérée');
        }

        return $aggregatedData;
    }
} 