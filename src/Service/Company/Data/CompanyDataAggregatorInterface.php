<?php

namespace App\Service\Company\Data;

interface CompanyDataAggregatorInterface
{
    /**
     * Agrège les données d'une entreprise à partir de différentes sources
     */
    public function aggregate(string $siren): array;
} 