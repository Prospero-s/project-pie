<?php

namespace App\Tests\Repository;

use App\Entity\CompanyInvestment;
use App\Entity\Company;
use App\Entity\User;
use App\Entity\UserGroup;
use App\Repository\CompanyInvestmentRepository;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Result;
use Doctrine\DBAL\Statement;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

class CompanyInvestmentRepositoryTest extends TestCase
{
    private CompanyInvestmentRepository $repository;

    protected function setUp(): void
    {
        // Créer un mock du ManagerRegistry pour éviter les problèmes de métadonnées
        $managerRegistry = $this->createMock(ManagerRegistry::class);
        
        // Créer le repository avec le mock
        $this->repository = new CompanyInvestmentRepository($managerRegistry);
    }

    public function testConstructor(): void
    {
        $this->assertInstanceOf(ServiceEntityRepository::class, $this->repository);
        $this->assertInstanceOf(CompanyInvestmentRepository::class, $this->repository);
    }

    public function testGetPredefinedQueries(): void
    {
        $queries = $this->repository->getPredefinedQueries();

        $this->assertIsArray($queries);
        $this->assertCount(8, $queries);

        // Vérifier la structure de chaque requête
        foreach ($queries as $query) {
            $this->assertArrayHasKey('id', $query);
            $this->assertArrayHasKey('name', $query);
            $this->assertArrayHasKey('description', $query);
            $this->assertArrayHasKey('query', $query);
        }

        // Vérifier des requêtes spécifiques
        $this->assertEquals('1', $queries[0]['id']);
        $this->assertEquals('Revenus par période', $queries[0]['name']);
        $this->assertEquals('monthly_revenue', $queries[0]['query']);

        $this->assertEquals('2', $queries[1]['id']);
        $this->assertEquals('Portefeuille par secteur', $queries[1]['name']);
        $this->assertEquals('clients_by_sector', $queries[1]['query']);
    }

    public function testAllPredefinedQueriesHaveValidStructure(): void
    {
        $queries = $this->repository->getPredefinedQueries();

        foreach ($queries as $index => $query) {
            $this->assertArrayHasKey('id', $query, "Query $index missing 'id'");
            $this->assertArrayHasKey('name', $query, "Query $index missing 'name'");
            $this->assertArrayHasKey('description', $query, "Query $index missing 'description'");
            $this->assertArrayHasKey('query', $query, "Query $index missing 'query'");

            $this->assertIsString($query['id'], "Query $index 'id' must be string");
            $this->assertIsString($query['name'], "Query $index 'name' must be string");
            $this->assertIsString($query['description'], "Query $index 'description' must be string");
            $this->assertIsString($query['query'], "Query $index 'query' must be string");

            $this->assertNotEmpty($query['name'], "Query $index 'name' cannot be empty");
            $this->assertNotEmpty($query['description'], "Query $index 'description' cannot be empty");
            $this->assertNotEmpty($query['query'], "Query $index 'query' cannot be empty");
        }
    }

    public function testPredefinedQueriesIdsAreUnique(): void
    {
        $queries = $this->repository->getPredefinedQueries();
        $ids = array_column($queries, 'id');
        $uniqueIds = array_unique($ids);

        $this->assertCount(count($ids), $uniqueIds, 'Tous les IDs de requêtes doivent être uniques');
    }

    public function testPredefinedQueriesNamesAreUnique(): void
    {
        $queries = $this->repository->getPredefinedQueries();
        $names = array_column($queries, 'name');
        $uniqueNames = array_unique($names);

        $this->assertCount(count($names), $uniqueNames, 'Tous les noms de requêtes doivent être uniques');
    }

    public function testPredefinedQueriesQueryIdentifiersAreUnique(): void
    {
        $queries = $this->repository->getPredefinedQueries();
        $queryIdentifiers = array_column($queries, 'query');
        $uniqueQueryIdentifiers = array_unique($queryIdentifiers);

        $this->assertCount(count($queryIdentifiers), $uniqueQueryIdentifiers, 'Tous les identifiants de requêtes doivent être uniques');
    }

    public function testPredefinedQueriesContent(): void
    {
        $queries = $this->repository->getPredefinedQueries();

        // Vérifier que toutes les requêtes prédéfinies sont présentes
        $expectedQueries = [
            'monthly_revenue' => 'Revenus par période',
            'clients_by_sector' => 'Portefeuille par secteur',
            'burn_rate_evolution' => 'Évolution Argent brûlé',
            'top_clients' => 'Top investissements',
            'headcount' => 'Évolution nombre d\'employés',
            'quarterly_investments' => 'Investissements trimestriels',
            'total_investment' => 'Synthèse investissements',
            'kpi_analysis_by_period' => 'Analyse KPI globale'
        ];

        $actualQueries = [];
        foreach ($queries as $query) {
            $actualQueries[$query['query']] = $query['name'];
        }

        foreach ($expectedQueries as $queryId => $expectedName) {
            $this->assertArrayHasKey($queryId, $actualQueries, "Query $queryId manquante");
            $this->assertEquals($expectedName, $actualQueries[$queryId], "Nom incorrect pour $queryId");
        }
    }

    public function testPredefinedQueriesDescriptionsAreNotEmpty(): void
    {
        $queries = $this->repository->getPredefinedQueries();

        foreach ($queries as $index => $query) {
            $this->assertNotEmpty($query['description'], "Description vide pour la requête $index");
            $this->assertGreaterThan(10, strlen($query['description']), "Description trop courte pour la requête $index");
        }
    }

    public function testPredefinedQueriesIdsAreSequential(): void
    {
        $queries = $this->repository->getPredefinedQueries();

        foreach ($queries as $index => $query) {
            $expectedId = (string)($index + 1);
            $this->assertEquals($expectedId, $query['id'], "ID non séquentiel pour la requête $index");
        }
    }

    public function testPredefinedQueriesHaveValidQueryIdentifiers(): void
    {
        $queries = $this->repository->getPredefinedQueries();

        $validIdentifiers = [
            'monthly_revenue',
            'clients_by_sector',
            'burn_rate_evolution',
            'top_clients',
            'headcount',
            'quarterly_investments',
            'total_investment',
            'kpi_analysis_by_period'
        ];

        foreach ($queries as $query) {
            $this->assertContains($query['query'], $validIdentifiers, "Identifiant de requête invalide: {$query['query']}");
        }
    }

    public function testPredefinedQueriesNamesAreDescriptive(): void
    {
        $queries = $this->repository->getPredefinedQueries();

        foreach ($queries as $index => $query) {
            $name = $query['name'];
            
            // Vérifier que le nom contient des mots-clés descriptifs
            $this->assertTrue(
                strlen($name) >= 3,
                "Nom trop court pour la requête $index: $name"
            );
            
            // Vérifier que le nom n'est pas vide ou composé uniquement d'espaces
            $this->assertNotEquals('', trim($name), "Nom vide pour la requête $index");
        }
    }

    public function testPredefinedQueriesStructureConsistency(): void
    {
        $queries = $this->repository->getPredefinedQueries();

        $firstQuery = $queries[0];
        $expectedKeys = ['id', 'name', 'description', 'query'];

        foreach ($queries as $index => $query) {
            // Vérifier que toutes les requêtes ont la même structure
            $this->assertEquals(
                array_keys($firstQuery),
                array_keys($query),
                "Structure incohérente pour la requête $index"
            );

            // Vérifier que toutes les clés attendues sont présentes
            foreach ($expectedKeys as $key) {
                $this->assertArrayHasKey($key, $query, "Clé manquante '$key' pour la requête $index");
            }
        }
    }
} 