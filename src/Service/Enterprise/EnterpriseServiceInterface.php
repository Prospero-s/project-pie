<?php

namespace App\Service\Enterprise;

interface EnterpriseServiceInterface
{
    /**
     * Récupère les données d'une entreprise par son SIREN
     */
    public function getEnterpriseData(string $siren, bool $forceScraping = false): array;
} 