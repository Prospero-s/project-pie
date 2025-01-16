<?php

namespace App\Service\Enterprise\Api;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Psr\Log\LoggerInterface;

class EnterpriseApiClient implements EnterpriseApiClientInterface
{
    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
        private readonly string $apiUsername,
        private readonly string $apiPassword
    ) {}

    public function fetchEnterpriseData(string $siren): array
    {
        $token = $this->getAuthToken();
        $apiUrl = "https://registre-national-entreprises.inpi.fr/api/companies/{$siren}";
        
        $this->logger->debug('Requête API entreprise', [
            'siren' => $siren,
            'url' => $apiUrl
        ]);

        $response = $this->httpClient->request('GET', $apiUrl, [
            'headers' => [
                'Authorization' => "Bearer {$token}"
            ]
        ]);

        $data = $response->toArray();
        $this->logger->info('Données API récupérées avec succès', ['siren' => $siren]);
        
        return $this->formatApiResponse($data);
    }

    public function getAuthToken(): string
    {
        $loginUrl = "https://registre-national-entreprises.inpi.fr/api/sso/login";
        
        if (!$this->apiUsername || !$this->apiPassword) {
            throw new \Exception('Credentials manquants dans les variables d\'environnement');
        }

        $credentials = [
            'username' => $this->apiUsername,
            'password' => $this->apiPassword
        ];

        $response = $this->httpClient->request('POST', $loginUrl, [
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language' => 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                'Origin' => 'https://registre-national-entreprises.inpi.fr',
                'Referer' => 'https://registre-national-entreprises.inpi.fr'
            ],
            'json' => $credentials,
            'verify_peer' => false,
            'timeout' => 30
        ]);

        $data = $response->toArray();
        if (!isset($data['token'])) {
            throw new \Exception("Token non trouvé dans la réponse");
        }

        return $data['token'];
    }

    private function formatApiResponse(array $data): array
    {
        // TODO: Implémenter le formatage des données
        return $data;
    }
} 