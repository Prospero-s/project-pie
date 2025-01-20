<?php

namespace App\Service\Company\Api;

interface CompanyApiClientInterface
{
    /**
     * Récupère les données d'une entreprise via l'API
     */
    public function fetchCompanyData(string $siren): array;

    /**
     * Récupère un token d'authentification
     */
    public function getAuthToken(): string;
} 