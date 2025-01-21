<?php

namespace App\Service\Company;

interface CompanyServiceInterface
{
    /**
     * Récupère les données d'une entreprise par son SIREN
     */
    public function getCompanyData(string $siren, bool $forceScraping = false): array;
} 