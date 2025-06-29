<?php

namespace App\Tests\Repository;

use App\Entity\Document;
use App\Entity\Company;
use App\Repository\DocumentRepository;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\Query;
use Doctrine\Persistence\ManagerRegistry;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;
use Symfony\Component\Uid\Uuid;

class DocumentRepositoryTest extends TestCase
{
    private DocumentRepository $repository;

    protected function setUp(): void
    {
        // Créer un mock du ManagerRegistry pour éviter les problèmes de métadonnées
        $managerRegistry = $this->createMock(ManagerRegistry::class);
        
        // Créer le repository avec le mock
        $this->repository = new DocumentRepository($managerRegistry);
    }

    public function testConstructor(): void
    {
        $this->assertInstanceOf(ServiceEntityRepository::class, $this->repository);
        $this->assertInstanceOf(DocumentRepository::class, $this->repository);
    }

    public function testRepositoryInheritance(): void
    {
        $this->assertInstanceOf(ServiceEntityRepository::class, $this->repository);
        $this->assertInstanceOf(DocumentRepository::class, $this->repository);
        
        // Vérifier que le repository hérite bien de ServiceEntityRepository
        $reflection = new \ReflectionClass($this->repository);
        $this->assertTrue($reflection->isSubclassOf(ServiceEntityRepository::class));
    }

    public function testRepositoryMethodsExist(): void
    {
        // Vérifier que toutes les méthodes publiques du repository existent
        $expectedMethods = [
            'save',
            'remove',
            'findByCompany',
            'findByCompanyAndYear',
            'findOneByUuid',
            'deleteDocumentByUuid'
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
        $this->assertEquals(Document::class, $parameters[0]->getType()->getName());
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
        $this->assertEquals(Document::class, $parameters[0]->getType()->getName());
        $this->assertEquals('bool', $parameters[1]->getType()->getName());
        $this->assertTrue($parameters[1]->isDefaultValueAvailable());
        $this->assertFalse($parameters[1]->getDefaultValue());
    }

    public function testFindByCompanyMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $findByCompanyMethod = $reflection->getMethod('findByCompany');
        
        $this->assertEquals(1, $findByCompanyMethod->getNumberOfParameters());
        $this->assertEquals('array', $findByCompanyMethod->getReturnType()->getName());
        
        $parameters = $findByCompanyMethod->getParameters();
        $this->assertEquals(Company::class, $parameters[0]->getType()->getName());
    }

    public function testFindByCompanyAndYearMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $findByCompanyAndYearMethod = $reflection->getMethod('findByCompanyAndYear');
        
        $this->assertEquals(2, $findByCompanyAndYearMethod->getNumberOfParameters());
        $this->assertEquals('array', $findByCompanyAndYearMethod->getReturnType()->getName());
        
        $parameters = $findByCompanyAndYearMethod->getParameters();
        $this->assertEquals(Company::class, $parameters[0]->getType()->getName());
        $this->assertEquals('int', $parameters[1]->getType()->getName());
    }

    public function testFindOneByUuidMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $findOneByUuidMethod = $reflection->getMethod('findOneByUuid');
        
        $this->assertEquals(1, $findOneByUuidMethod->getNumberOfParameters());
        $this->assertEquals('App\Entity\Document', $findOneByUuidMethod->getReturnType()->getName());
        
        $parameters = $findOneByUuidMethod->getParameters();
        $this->assertEquals('string', $parameters[0]->getType()->getName());
    }

    public function testDeleteDocumentByUuidMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        $deleteDocumentByUuidMethod = $reflection->getMethod('deleteDocumentByUuid');
        
        $this->assertEquals(1, $deleteDocumentByUuidMethod->getNumberOfParameters());
        $this->assertEquals('bool', $deleteDocumentByUuidMethod->getReturnType()->getName());
        
        $parameters = $deleteDocumentByUuidMethod->getParameters();
        $this->assertEquals('string', $parameters[0]->getType()->getName());
    }

    public function testRepositoryDocumentation(): void
    {
        $reflection = new \ReflectionClass($this->repository);
        
        // Vérifier que la classe a une documentation
        $this->assertNotEmpty($reflection->getDocComment(), 'La classe repository doit avoir une documentation PHPDoc');
        
        // Vérifier que les méthodes importantes ont une documentation
        $methodsWithDoc = [
            'findByCompany' => 'Trouve tous les documents pour une compagnie',
            'findByCompanyAndYear' => 'Trouve tous les documents pour une compagnie et une année spécifique',
            'findOneByUuid' => 'Trouve un document par son UUID',
            'deleteDocumentByUuid' => 'Supprime un document par son UUID'
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
            'save',
            'remove',
            'findByCompany',
            'findByCompanyAndYear',
            'findOneByUuid',
            'deleteDocumentByUuid'
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
            return $method->getDeclaringClass()->getName() === DocumentRepository::class;
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
        $this->assertEquals('DocumentRepository', $reflection->getShortName(), 'Le nom de la classe doit être DocumentRepository');
    }
} 