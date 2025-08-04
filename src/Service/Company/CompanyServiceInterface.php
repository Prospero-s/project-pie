<?php

namespace App\Service\Company;

interface CompanyServiceInterface
{
    /**
     * Récupère les données d'une entreprise par son SIREN
     * @param string $siren
     * @param bool $forceScraping
     * @return array<string, mixed>
     */
    public function getCompanyData(string $siren, bool $forceScraping = false): array;
}
