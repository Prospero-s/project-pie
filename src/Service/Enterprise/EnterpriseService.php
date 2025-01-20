<?php

namespace App\Service\Company;

use App\Service\Company\CompanyDataAggregator;
class CompanyService implements CompanyServiceInterface
{
    public function __construct(
        private readonly CompanyDataAggregator $dataAggregator
    ) {}

    public function getCompanyData(string $siren, bool $forceScraping = false): array
    {
        return $this->dataAggregator->getCompanyData($siren, $forceScraping);
    }
} 