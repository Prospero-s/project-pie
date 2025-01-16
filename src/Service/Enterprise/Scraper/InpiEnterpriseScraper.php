<?php

namespace App\Service\Enterprise\Scraper;

use Symfony\Component\DomCrawler\Crawler;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Psr\Log\LoggerInterface;

class InpiEnterpriseScraper implements EnterpriseScraperInterface
{
    private array $cache = [];
    private const CACHE_TTL = 3600; // 1 heure
    private const BASE_URL = 'https://data.inpi.fr/entreprises/';  // URL INPI

    public function __construct(
        private readonly HttpClientInterface $client,
        private readonly LoggerInterface $logger
    ) {}

    public function supports(string $source): bool
    {
        return $source === 'inpi';
    }

    public function scrape(string $siren, bool $forceScraping = false): array
    {
        // Vérifier le cache si le scraping n'est pas forcé
        if (!$forceScraping && $this->hasValidCache($siren)) {
            return $this->cache[$siren]['data'];
        }

        try {
            $html = $this->fetchHtmlWithRetry($siren);
            $crawler = new Crawler($html);
            
            // Extraire toutes les données en une seule passe
            $data = $this->extractAllData($crawler, $siren);
            
            // Mettre en cache
            $this->cache[$siren] = [
                'timestamp' => time(),
                'data' => $data
            ];

            return $data;
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du scraping', [
                'siren' => $siren,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    private function hasValidCache(string $siren): bool
    {
        return isset($this->cache[$siren]) && 
               (time() - $this->cache[$siren]['timestamp']) < self::CACHE_TTL;
    }

    private function fetchHtmlWithRetry(string $siren, int $maxRetries = 3): string
    {
        $attempt = 0;
        while ($attempt < $maxRetries) {
            try {
                $response = $this->client->request('GET', self::BASE_URL . $siren, [
                    'timeout' => 5,
                    'max_duration' => 10,
                    'headers' => [
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language' => 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
                    ]
                ]);
                return $response->getContent();
            } catch (\Exception $e) {
                $this->logger->error('Erreur lors de la requête INPI', [
                    'siren' => $siren,
                    'attempt' => $attempt + 1,
                    'error' => $e->getMessage()
                ]);
                $attempt++;
                if ($attempt === $maxRetries) {
                    throw $e;
                }
                usleep(500000); // 500ms entre les tentatives
            }
        }
        throw new \Exception('Impossible de récupérer les données après ' . $maxRetries . ' tentatives');
    }

    private function extractAllData(Crawler $crawler, string $siren): array
    {
        // Extraire toutes les données nécessaires en une seule passe
        $data = [
            'siren' => $siren,
            'siret' => null,
            'denomination' => '',
            'formeJuridique' => '',
            'codeApe' => '',
            'updatedAt' => '',
            'adresse' => [],
            'representants' => [],
            'devise' => null
        ];

        // Utiliser filter() une seule fois et stocker le résultat
        $blocDetails = $crawler->filter('.bloc-detail-notice');
        
        // Extraire les données en parallèle si possible
        $data['denomination'] = $this->extractDenomination($blocDetails);
        $data['formeJuridique'] = $this->extractFormeJuridique($blocDetails);
        $data['adresse'] = $this->extractAdresse($blocDetails);
        $data['representants'] = $this->extractRepresentants($crawler);

        // Extraire le SIRET
        $siretNode = $blocDetails->filter('.bloc-detail-notice')->reduce(function (Crawler $node) {
            return str_contains($node->text(), 'Siret');
        });
        if ($siretNode->count() > 0) {
            $data['siret'] = trim($siretNode->filter('.highlight-text.siret-selector-error-form')->text());
        }

        // Extraire le code APE
        $apeNode = $blocDetails->filter('.bloc-detail-notice')->reduce(function (Crawler $node) {
            return str_contains($node->text(), 'Code APE');
        });
        if ($apeNode->count() > 0) {
            $data['codeApe'] = trim($apeNode->filter('.highlight-text')->text());
        }

        // Extraire la date de mise à jour
        $updateNode = $crawler->filter('.last-update-titles');
        if ($updateNode->count() > 0) {
            $updateText = $updateNode->text();
            if (preg_match('/Date de mise à jour de l\'entreprise : (.+)/', $updateText, $matches)) {
                $data['updatedAt'] = trim($matches[1]);
            }
        }

        // Extraire le capital social
        $capitalNode = $blocDetails->filter('.bloc-detail-notice')->reduce(function (Crawler $node) {
            return str_contains($node->text(), 'Capital social');
        });
        if ($capitalNode->count() > 0) {
            $capitalText = $capitalNode->filter('p.font-size-0-9-rem')->text();
            if (preg_match('/(\d+)\s*([A-Z]{3})/', $capitalText, $matches)) {
                $data['capital'] = (int)$matches[1];
                $data['devise'] = $matches[2];
            }
        }

        return $data;
    }

    private function extractDenomination(Crawler $blocDetails): string
    {
        // Extraction des données de base avec les bons sélecteurs
        $denomination = $blocDetails->reduce(function (Crawler $node) {
            return str_contains($node->text(), 'Dénomination');
        })->filter('.highlight-text')->text('');

        return trim($denomination);
    }

    private function extractFormeJuridique(Crawler $blocDetails): string
    {
        $formeJuridique = $blocDetails->reduce(function (Crawler $node) {
            return str_contains($node->text(), 'Forme juridique');
        })->filter('.highlight-text')->text('');

        return trim($formeJuridique);
    }

    private function extractAdresse(Crawler $blocDetails): array
    {
        // Extraction améliorée de l'adresse
        $adresseNode = $blocDetails->reduce(function (Crawler $node) {
            return str_contains($node->text(), 'Adresse du siège');
        })->filter('.highlight-text');

        $adresse = [];
        if ($adresseNode->count() > 0) {
            $adresseText = $adresseNode->text();
            // Nettoyer les espaces multiples et les retours à la ligne
            $adresseText = preg_replace('/\s+/', ' ', trim($adresseText));
            $parts = array_values(array_filter(explode(' ', $adresseText)));
            
            $typesVoie = [
                'RUE' => 'RUE',
                'R' => 'RUE',
                'AV' => 'AVENUE',
                'AVE' => 'AVENUE',
                'AVENUE' => 'AVENUE',
                'BD' => 'BOULEVARD',
                'BLVD' => 'BOULEVARD',
                'BOULEVARD' => 'BOULEVARD',
                'PL' => 'PLACE',
                'PLACE' => 'PLACE',
                'ALL' => 'ALLEE',
                'ALLEE' => 'ALLEE',
                'IMP' => 'IMPASSE',
                'IMPASSE' => 'IMPASSE',
                'RTE' => 'ROUTE',
                'ROUTE' => 'ROUTE',
                'CHE' => 'CHEMIN',
                'CHEMIN' => 'CHEMIN',
                'QUAI' => 'QUAI',
                'Q' => 'QUAI',
                'SQ' => 'SQUARE',
                'SQUARE' => 'SQUARE',
                'CRS' => 'COURS',
                'COURS' => 'COURS',
                'AV.' => 'AVENUE',
                'BD.' => 'BOULEVARD',
                'PL.' => 'PLACE'
            ];

            $numVoie = null;
            $typeVoie = null;
            $voie = [];
            $codePostal = null;
            $commune = null;
            $voieFound = false;

            foreach ($parts as $index => $part) {
                // Vérifier d'abord si c'est un code postal (5 chiffres)
                if (preg_match('/^(\d{5})$/', $part)) {
                    $codePostal = $part;
                    // Récupérer la commune qui suit le code postal
                    // Collecter tous les mots jusqu'à "FRANCE" pour la commune
                    $communeParts = [];
                    for ($i = $index + 1; $i < count($parts); $i++) {
                        if ($parts[$i] === 'FRANCE') break;
                        $communeParts[] = $parts[$i];
                    }
                    $commune = implode(' ', $communeParts);
                    break;
                }

                // Vérifier si c'est un numéro de rue (1-4 chiffres)
                if (!$numVoie && preg_match('/^(\d{1,4})$/', $part)) {
                    $numVoie = $part;
                    continue;
                }

                // Vérifier si c'est un type de voie
                if (!$voieFound) {
                    $partUpper = strtoupper(rtrim($part, '.'));
                    if (isset($typesVoie[$partUpper])) {
                        $typeVoie = $typesVoie[$partUpper];
                        $voieFound = true;
                        continue;
                    }
                }

                // Collecter le nom de la voie
                if ($voieFound && !$codePostal) {
                    $voie[] = $part;
                }
            }

            // Nettoyer le nom de la voie
            $voieStr = implode(' ', $voie);
            $voieStr = str_replace(['FRANCE', $commune], '', $voieStr);
            $voieStr = trim($voieStr);

            $adresse = [
                'pays' => 'FRANCE',
                'commune' => $commune,
                'codePostal' => $codePostal,
                'voie' => $voieStr,
                'typeVoie' => $typeVoie,
                'numVoie' => $numVoie,
            ];
        }

        return $adresse;
    }

    private function extractRepresentants(Crawler $crawler): array
    {
        $representants = [];
        $crawler->filter('.row')->each(function (Crawler $node) use (&$representants) {
            if ($node->filter('h3')->count() && str_contains($node->filter('h3')->text(), 'Représentants')) {
                $currentRepresentant = [];
                
                $node->children('.col-12.col-md-2, .col-12.col-md-4')->each(function (Crawler $col) use (&$currentRepresentant, &$representants) {
                    // Vérifier s'il y a un bloc dirigeant
                    if ($col->filter('.bloc-dirigeant')->count() > 0) {
                        $label = $col->filter('.inpi-light')->text();
                        
                        // Cas d'un nom/prénom
                        if (str_contains($label, 'Nom, Prénom')) {
                            if (!empty($currentRepresentant)) {
                                $representants[] = $currentRepresentant;
                            }
                            $currentRepresentant = [
                                'nom' => trim($col->filter('.highlight-text')->text()),
                                'qualite' => null
                            ];
                        }
                        // Cas d'une dénomination
                        elseif (str_contains($label, 'Dénomination')) {
                            if (!empty($currentRepresentant)) {
                                $representants[] = $currentRepresentant;
                            }
                            $currentRepresentant = [
                                'nom' => trim($col->filter('.font-size-0-9-rem')->last()->text()),
                                'qualite' => null
                            ];
                        }
                        // Cas de la qualité
                        elseif (str_contains($label, 'Qualité')) {
                            if (!empty($currentRepresentant)) {
                                $currentRepresentant['qualite'] = trim($col->filter('.font-size-0-9-rem.m-0')->text());
                            }
                        }
                    }
                });
                
                // Ajouter le dernier représentant s'il existe et a une qualité
                if (!empty($currentRepresentant) && $currentRepresentant['qualite']) {
                    $representants[] = $currentRepresentant;
                }
            }
        });

        return $representants;
    }

    public function getPriority(): int
    {
        return 100;
    }
} 