<?php

namespace App\Service\Enterprise\Api;

interface EnterpriseApiClientInterface
{
    /**
     * Récupère les données d'une entreprise via l'API
     */
    public function fetchEnterpriseData(string $siren): array;

    /**
     * Récupère un token d'authentification
     */
    public function getAuthToken(): string;
} 