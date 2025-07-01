<?php

namespace App\Service\Company\Scraper;

interface CompanyScraperInterface
{
    /**
     * Vérifie si le scraper supporte une source donnée
     * @param string $source
     * @return bool
     */
    public function supports(string $source): bool;

    /**
     * Récupère les données d'une entreprise par son SIREN
     * @param string $siren
     * @param bool $forceScraping
     * @return array<string, mixed>
     */
    public function scrape(string $siren, bool $forceScraping = false): array;

    /**
     * Retourne la priorité du scraper
     * @return int
     */
    public function getPriority(): int;
}
