<?php

namespace App\Service\Enterprise\Scraper;

use Symfony\Component\DomCrawler\Crawler;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Psr\Log\LoggerInterface;

class PappersEnterpriseScraper implements EnterpriseScraperInterface
{
    private HttpClientInterface $client;
    private LoggerInterface $logger;

    public function __construct(HttpClientInterface $client, LoggerInterface $logger)
    {
        $this->client = $client;
        $this->logger = $logger;
    }

    public function supports(string $source): bool
    {
        return $source === 'pappers';
    }

    public function scrape(string $siren, bool $forceScraping = false): array
    {
        try {
            $this->logger->info('Début du scraping Pappers', ['siren' => $siren]);
            
            $response = $this->client->request('GET', "https://www.pappers.fr/entreprise/{$siren}");
            
            if ($response->getStatusCode() !== 200) {
                throw new \Exception('Page Pappers non accessible');
            }

            $html = $response->getContent();
            $crawler = new Crawler($html);

            $data = [
                'siren' => $siren,
                'denomination' => $this->extractDenomination($crawler),
                'formeJuridique' => $this->extractFormeJuridique($crawler),
                'adresse' => $this->extractAdresse($crawler),
                'siret' => $this->extractSiret($crawler),
                'capital' => $this->extractCapital($crawler),
            ];

            $this->logger->info('Données Pappers extraites avec succès', ['data' => $data]);
            return $data;

        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du scraping Pappers', [
                'siren' => $siren,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    private function extractDenomination(Crawler $crawler): string
    {
        try {
            return trim($crawler->filter('h1.big-text')->text());
        } catch (\Exception $e) {
            $this->logger->warning('Impossible d\'extraire la dénomination');
            return '';
        }
    }

    private function extractFormeJuridique(Crawler $crawler): string
    {
        try {
            return $crawler->filter('table tr')->filter(function(Crawler $node) {
                return str_contains($node->text(), 'Forme juridique');
            })->filter('td')->text('');
        } catch (\Exception $e) {
            $this->logger->warning('Impossible d\'extraire la forme juridique');
            return '';
        }
    }

    private function extractAdresse(Crawler $crawler): array
    {
        try {
            $adresseText = $crawler->filter('table tr')->filter(function(Crawler $node) {
                return str_contains($node->text(), 'Adresse');
            })->filter('td')->text('');

            // Extraction du code postal et de la ville
            preg_match('/(\d{5})\s+(.+)$/', $adresseText, $cpvilleMatches);

            return [
                'numVoie' => '',  // À extraire si disponible
                'typeVoie' => '', // À extraire si disponible
                'voie' => $adresseText,
                'codePostal' => $cpvilleMatches[1] ?? '',
                'commune' => $cpvilleMatches[2] ?? '',
                'pays' => 'FRANCE'
            ];
        } catch (\Exception $e) {
            $this->logger->warning('Impossible d\'extraire l\'adresse');
            return [];
        }
    }

    private function extractSiret(Crawler $crawler): string
    {
        try {
            return $crawler->filter('table tr')->filter(function(Crawler $node) {
                return str_contains($node->text(), 'SIRET');
            })->filter('td')->text('');
        } catch (\Exception $e) {
            $this->logger->warning('Impossible d\'extraire le SIRET');
            return '';
        }
    }

    private function extractCapital(Crawler $crawler): array
    {
        try {
            $capitalText = $crawler->filter('table tr')->filter(function(Crawler $node) {
                return str_contains($node->text(), 'Capital social');
            })->filter('td')->text('');

            preg_match('/(\d+(?:\s\d+)*(?:,\d+)?)\s*(€|EUR)?/', $capitalText, $matches);

            return [
                'montant' => str_replace(' ', '', $matches[1] ?? ''),
                'devise' => !empty($matches[2]) ? 'EUR' : ''
            ];
        } catch (\Exception $e) {
            $this->logger->warning('Impossible d\'extraire le capital');
            return ['montant' => '', 'devise' => ''];
        }
    }

    public function getPriority(): int
    {
        return 50;
    }
}