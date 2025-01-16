<?php

namespace App\Service\Enterprise;

use App\Service\Enterprise\EnterpriseDataAggregator;
class EnterpriseService implements EnterpriseServiceInterface
{
    public function __construct(
        private readonly EnterpriseDataAggregator $dataAggregator
    ) {}

    public function getEnterpriseData(string $siren, bool $forceScraping = false): array
    {
        return $this->dataAggregator->getEnterpriseData($siren, $forceScraping);
    }
} 