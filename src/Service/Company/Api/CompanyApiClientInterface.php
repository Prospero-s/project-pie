<?php

namespace App\Service\Company\Api;

interface CompanyApiClientInterface
{
    /**
     * Récupère les données d'une entreprise via l'API
     * @param string $siren
     * @return array<string, mixed>
     */
    public function fetchCompanyData(string $siren): array;

    /**
     * Récupère un token d'authentification
     * @return string
     */
    public function getAuthToken(): string;
}
