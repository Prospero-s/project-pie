<?php

namespace App\Service\Enterprise\Scraper;

interface EnterpriseScraperInterface
{
    /**
     * Vérifie si le scraper supporte une source donnée
     */
    public function supports(string $source): bool;

    /**
     * Récupère les données d'une entreprise par son SIREN
     */
    public function scrape(string $siren, bool $forceScraping = false): array;

    /**
     * Retourne la priorité du scraper
     */
    public function getPriority(): int;
} 