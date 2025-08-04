<?php

namespace App\Tests\Repository;

use App\Entity\Kpi;
use App\Entity\Document;
use App\Repository\KpiRepository;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

class KpiRepositoryTest extends TestCase
{
    private KpiRepository $repository;

    protected function setUp(): void
    {
        // Créer un mock du ManagerRegistry pour éviter les problèmes de métadonnées
        $managerRegistry = $this->createMock(ManagerRegistry::class);
        
        // Créer le repository avec le mock
        $this->repository = new KpiRepository($managerRegistry);
    }

    public function testConstructor(): void
    {
        $this->assertInstanceOf(ServiceEntityRepository::class, $this->repository);
        $this->assertInstanceOf(KpiRepository::class, $this->repository);
    }

    public function testRepositoryInheritance(): void
    {
        $this->assertInstanceOf(ServiceEntityRepository::class, $this->repository);
        $this->assertInstanceOf(KpiRepository::class, $this->repository);
        
        // Vérifier que le repository hérite bien de ServiceEntityRepository
        $reflection = new \ReflectionClass($this->repository);
        $this->assertTrue($reflection->isSubclassOf(ServiceEntityRepository::class));
    }

    public function testRepositoryMethodsExist(): void
    {
        // Vérifier que toutes les méthodes publiques du repository existent
        $expectedMethods = [
            '__construct',
            'save',
            'remove',
            'findByDocument',
            'findByDocumentAndPeriod',
            'findOneByDocumentNameAndPeriod',
            'findByCompanyId',
            'findByCompanyIdAndYear',
            'findAvailableYearsByCompanyId'
        ];

        $reflection = new \ReflectionClass($this->repository);
        $actualMethods = array_map(
            fn($method) => $method->getName(),
            $reflection->getMethods(\ReflectionMethod::IS_PUBLIC)
        );

        foreach ($expectedMethods as $method) {
            $this->assertContains($method, $actualMethods, "Méthode '$method' manquante dans le repository");
        }
    }

    public function testSaveMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $saveMethod = $reflection->getMethod('save');
        
        $this->assertEquals(2, $saveMethod->getNumberOfParameters());
        $this->assertEquals('void', $saveMethod->getReturnType()->getName());
        
        $parameters = $saveMethod->getParameters();
        $this->assertEquals(Kpi::class, $parameters[0]->getType()->getName());
        $this->assertEquals('bool', $parameters[1]->getType()->getName());
        $this->assertTrue($parameters[1]->isDefaultValueAvailable());
        $this->assertFalse($parameters[1]->getDefaultValue());
    }

    public function testRemoveMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $removeMethod = $reflection->getMethod('remove');
        
        $this->assertEquals(2, $removeMethod->getNumberOfParameters());
        $this->assertEquals('void', $removeMethod->getReturnType()->getName());
        
        $parameters = $removeMethod->getParameters();
        $this->assertEquals(Kpi::class, $parameters[0]->getType()->getName());
        $this->assertEquals('bool', $parameters[1]->getType()->getName());
        $this->assertTrue($parameters[1]->isDefaultValueAvailable());
        $this->assertFalse($parameters[1]->getDefaultValue());
    }

    public function testFindByDocumentMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $findByDocumentMethod = $reflection->getMethod('findByDocument');
        
        $this->assertEquals(1, $findByDocumentMethod->getNumberOfParameters());
        $this->assertEquals('array', $findByDocumentMethod->getReturnType()->getName());
        
        $parameters = $findByDocumentMethod->getParameters();
        $this->assertEquals(Document::class, $parameters[0]->getType()->getName());
    }

    public function testFindByDocumentAndPeriodMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $findByDocumentAndPeriodMethod = $reflection->getMethod('findByDocumentAndPeriod');
        
        $this->assertEquals(2, $findByDocumentAndPeriodMethod->getNumberOfParameters());
        $this->assertEquals('array', $findByDocumentAndPeriodMethod->getReturnType()->getName());
        
        $parameters = $findByDocumentAndPeriodMethod->getParameters();
        $this->assertEquals(Document::class, $parameters[0]->getType()->getName());
        $this->assertEquals('string', $parameters[1]->getType()->getName());
    }

    public function testFindOneByDocumentNameAndPeriodMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $findOneByDocumentNameAndPeriodMethod = $reflection->getMethod('findOneByDocumentNameAndPeriod');
        
        $this->assertEquals(3, $findOneByDocumentNameAndPeriodMethod->getNumberOfParameters());
        $this->assertEquals('App\Entity\Kpi', $findOneByDocumentNameAndPeriodMethod->getReturnType()->getName());
        
        $parameters = $findOneByDocumentNameAndPeriodMethod->getParameters();
        $this->assertEquals(Document::class, $parameters[0]->getType()->getName());
        $this->assertEquals('string', $parameters[1]->getType()->getName());
        $this->assertEquals('string', $parameters[2]->getType()->getName());
    }

    public function testFindByCompanyIdMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $findByCompanyIdMethod = $reflection->getMethod('findByCompanyId');
        
        $this->assertEquals(1, $findByCompanyIdMethod->getNumberOfParameters());
        $this->assertEquals('array', $findByCompanyIdMethod->getReturnType()->getName());
        
        $parameters = $findByCompanyIdMethod->getParameters();
        $this->assertEquals('int', $parameters[0]->getType()->getName());
    }

    public function testFindByCompanyIdAndYearMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $findByCompanyIdAndYearMethod = $reflection->getMethod('findByCompanyIdAndYear');
        
        $this->assertEquals(2, $findByCompanyIdAndYearMethod->getNumberOfParameters());
        $this->assertEquals('array', $findByCompanyIdAndYearMethod->getReturnType()->getName());
        
        $parameters = $findByCompanyIdAndYearMethod->getParameters();
        $this->assertEquals('int', $parameters[0]->getType()->getName());
        $this->assertEquals('int', $parameters[1]->getType()->getName());
    }

    public function testFindAvailableYearsByCompanyIdMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $findAvailableYearsByCompanyIdMethod = $reflection->getMethod('findAvailableYearsByCompanyId');
        
        $this->assertEquals(1, $findAvailableYearsByCompanyIdMethod->getNumberOfParameters());
        $this->assertEquals('array', $findAvailableYearsByCompanyIdMethod->getReturnType()->getName());
        
        $parameters = $findAvailableYearsByCompanyIdMethod->getParameters();
        $this->assertEquals('int', $parameters[0]->getType()->getName());
    }

    public function testRepositoryDocumentation(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        
        // Vérifier que la classe a une documentation
        $this->assertNotEmpty($reflection->getDocComment(), 'La classe repository doit avoir une documentation PHPDoc');
        
        // Vérifier que les méthodes importantes ont une documentation
        $methodsWithDoc = [
            'findByDocument' => 'Trouve tous les KPIs associés à un document',
            'findByDocumentAndPeriod' => 'Trouve les KPIs par document et période',
            'findOneByDocumentNameAndPeriod' => 'Trouve un KPI spécifique par document, nom et période',
            'findByCompanyId' => 'Trouve tous les KPIs d\'une entreprise donnée',
            'findByCompanyIdAndYear' => 'Trouve tous les KPIs d\'une entreprise donnée pour une année spécifique',
            'findAvailableYearsByCompanyId' => 'Trouve toutes les années disponibles pour les KPI d\'une entreprise'
        ];
        
        foreach ($methodsWithDoc as $methodName => $expectedDoc) {
            $method = $reflection->getMethod($methodName);
            $docComment = $method->getDocComment();
            $this->assertNotEmpty($docComment, "La méthode '$methodName' doit avoir une documentation PHPDoc");
        }
    }

    public function testRepositoryExtendsServiceEntityRepository(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $parentClass = $reflection->getParentClass();
        
        $this->assertNotNull($parentClass, 'Le repository doit hériter d\'une classe parente');
        $this->assertEquals(ServiceEntityRepository::class, $parentClass->getName());
    }

    public function testRepositoryHasCorrectEntityClass(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $constructor = $reflection->getConstructor();
        
        $this->assertNotNull($constructor, 'Le repository doit avoir un constructeur');
        $this->assertEquals(1, $constructor->getNumberOfParameters(), 'Le constructeur doit avoir un seul paramètre');
        
        $parameter = $constructor->getParameters()[0];
        $this->assertEquals(ManagerRegistry::class, $parameter->getType()->getName());
    }

    public function testRepositoryMethodsArePublic(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $publicMethods = $reflection->getMethods(\ReflectionMethod::IS_PUBLIC);
        
        $expectedPublicMethods = [
            '__construct',
            'save',
            'remove',
            'findByDocument',
            'findByDocumentAndPeriod',
            'findOneByDocumentNameAndPeriod',
            'findByCompanyId',
            'findByCompanyIdAndYear',
            'findAvailableYearsByCompanyId'
        ];
        
        $actualPublicMethodNames = array_map(fn($method) => $method->getName(), $publicMethods);
        
        foreach ($expectedPublicMethods as $methodName) {
            $this->assertContains($methodName, $actualPublicMethodNames, "La méthode '$methodName' doit être publique");
        }
    }

    public function testRepositoryHasNoStaticMethods(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $staticMethods = $reflection->getMethods(\ReflectionMethod::IS_STATIC);
        
        // Filtrer les méthodes héritées de la classe parente
        $ownStaticMethods = array_filter($staticMethods, function($method) {
            return $method->getDeclaringClass()->getName() === KpiRepository::class;
        });
        
        $this->assertCount(0, $ownStaticMethods, 'Le repository ne doit pas avoir de méthodes statiques propres');
    }

    public function testRepositoryHasNoAbstractMethods(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $this->assertFalse($reflection->isAbstract(), 'Le repository ne doit pas être une classe abstraite');
        
        $abstractMethods = $reflection->getMethods(\ReflectionMethod::IS_ABSTRACT);
        $this->assertCount(0, $abstractMethods, 'Le repository ne doit pas avoir de méthodes abstraites');
    }

    public function testRepositoryIsFinal(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $this->assertFalse($reflection->isFinal(), 'Le repository ne doit pas être une classe finale pour permettre l\'héritage si nécessaire');
    }

    public function testRepositoryNamespace(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $this->assertEquals('App\Repository', $reflection->getNamespaceName(), 'Le repository doit être dans le namespace App\Repository');
    }

    public function testRepositoryClassName(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $this->assertEquals('KpiRepository', $reflection->getShortName(), 'Le nom de la classe doit être KpiRepository');
    }

    public function testSaveWithDefaultParameters(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $saveMethod = $reflection->getMethod('save');
        
        $parameters = $saveMethod->getParameters();
        $this->assertTrue($parameters[1]->isDefaultValueAvailable(), 'Le paramètre flush doit avoir une valeur par défaut');
        $this->assertFalse($parameters[1]->getDefaultValue(), 'La valeur par défaut de flush doit être false');
    }

    public function testRemoveWithDefaultParameters(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $removeMethod = $reflection->getMethod('remove');
        
        $parameters = $removeMethod->getParameters();
        $this->assertTrue($parameters[1]->isDefaultValueAvailable(), 'Le paramètre flush doit avoir une valeur par défaut');
        $this->assertFalse($parameters[1]->getDefaultValue(), 'La valeur par défaut de flush doit être false');
    }

    public function testMethodParameterNames(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        
        $expectedParameters = [
            'save' => ['entity', 'flush'],
            'remove' => ['entity', 'flush'],
            'findByDocument' => ['document'],
            'findByDocumentAndPeriod' => ['document', 'period'],
            'findOneByDocumentNameAndPeriod' => ['document', 'name', 'period'],
            'findByCompanyId' => ['companyId'],
            'findByCompanyIdAndYear' => ['companyId', 'year'],
            'findAvailableYearsByCompanyId' => ['companyId']
        ];
        
        foreach ($expectedParameters as $methodName => $expectedParamNames) {
            $method = $reflection->getMethod($methodName);
            $actualParamNames = array_map(fn($param) => $param->getName(), $method->getParameters());
            $this->assertEquals($expectedParamNames, $actualParamNames, "Noms de paramètres incorrects pour la méthode '$methodName'");
        }
    }

    public function testRepositoryMethodCount(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $publicMethods = $reflection->getMethods(\ReflectionMethod::IS_PUBLIC);
        
        // Compter seulement les méthodes propres à la classe (pas héritées)
        $ownMethods = array_filter($publicMethods, function($method) {
            return $method->getDeclaringClass()->getName() === KpiRepository::class;
        });
        
        $this->assertCount(9, $ownMethods, 'Le repository doit avoir exactement 9 méthodes publiques propres (incluant le constructeur)');
    }
}
