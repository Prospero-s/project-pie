<?php

namespace App\Service\Enterprise\Data;

interface EnterpriseDataAggregatorInterface
{
    /**
     * Agrège les données d'une entreprise à partir de différentes sources
     */
    public function aggregate(string $siren): array;
} 