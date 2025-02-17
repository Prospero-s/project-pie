<?php

namespace App\Service\Company\Data;

interface CompanyDataAggregatorInterface
{
    /**
     * Agrège les données d'une entreprise à partir de différentes sources
     * @param string $siren
     * @return array<string, mixed>
     */
    public function aggregate(string $siren): array;
}
