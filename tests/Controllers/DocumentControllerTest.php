<?php

namespace App\Tests\Unit\Controller\Api;

use App\Controller\Api\DocumentController;
use App\Repository\DocumentRepository;
use App\Repository\CompanyRepository;
use App\Service\User\UserService;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\ORM\EntityManagerInterface;

class DocumentControllerTest extends TestCase
{
    private DocumentController $controller;
    private EntityManagerInterface $entityManager;
    private DocumentRepository $documentRepository;
    private CompanyRepository $companyRepository;
    private UserService $userService;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->documentRepository = $this->createMock(DocumentRepository::class);
        $this->companyRepository = $this->createMock(CompanyRepository::class);
        $this->userService = $this->createMock(UserService::class);

        $this->controller = new DocumentController(
            $this->entityManager,
            $this->documentRepository,
            $this->companyRepository,
            $this->userService
        );
    }

    public function testControllerConstructor(): void
    {
        $this->assertInstanceOf(DocumentController::class, $this->controller);
    }

    public function testControllerDependencies(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $constructor = $reflection->getConstructor();
        
        $this->assertNotNull($constructor, 'Le contrôleur doit avoir un constructeur');
        $this->assertEquals(4, $constructor->getNumberOfParameters(), 'Le constructeur doit avoir 4 paramètres');
        
        $parameters = $constructor->getParameters();
        $this->assertEquals(EntityManagerInterface::class, $parameters[0]->getType()->getName());
        $this->assertEquals(DocumentRepository::class, $parameters[1]->getType()->getName());
        $this->assertEquals(CompanyRepository::class, $parameters[2]->getType()->getName());
        $this->assertEquals(UserService::class, $parameters[3]->getType()->getName());
    }

    public function testControllerMethodsExist(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $expectedMethods = [
            'list',
            'show',
            'deleteDocument',
            'save',
            'viewPdf'
        ];
        
        $actualMethods = array_map(
            fn($method) => $method->getName(),
            $reflection->getMethods(\ReflectionMethod::IS_PUBLIC)
        );

        foreach ($expectedMethods as $method) {
            $this->assertContains($method, $actualMethods, "Méthode '$method' manquante dans le contrôleur");
        }
    }

    public function testControllerInheritance(): void
    {
        $this->assertInstanceOf(\Symfony\Bundle\FrameworkBundle\Controller\AbstractController::class, $this->controller);
    }

    public function testControllerNamespace(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $this->assertEquals('App\Controller\Api', $reflection->getNamespaceName());
    }

    public function testControllerClassName(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $this->assertEquals('DocumentController', $reflection->getShortName());
    }

    public function testControllerHasNoStaticMethods(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $staticMethods = $reflection->getMethods(\ReflectionMethod::IS_STATIC);
        
        // Filtrer les méthodes héritées de la classe parente
        $ownStaticMethods = array_filter($staticMethods, function($method) use ($reflection) {
            return $method->getDeclaringClass()->getName() === $reflection->getName();
        });
        
        $this->assertCount(0, $ownStaticMethods, 'Le contrôleur ne doit pas avoir de méthodes statiques propres');
    }

    public function testControllerHasNoAbstractMethods(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $this->assertFalse($reflection->isAbstract(), 'Le contrôleur ne doit pas être une classe abstraite');
        
        $abstractMethods = $reflection->getMethods(\ReflectionMethod::IS_ABSTRACT);
        $this->assertCount(0, $abstractMethods, 'Le contrôleur ne doit pas avoir de méthodes abstraites');
    }

    public function testControllerIsNotFinal(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $this->assertFalse($reflection->isFinal(), 'Le contrôleur ne doit pas être une classe finale pour permettre l\'héritage si nécessaire');
    }

    public function testControllerMethodsArePublic(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $publicMethods = $reflection->getMethods(\ReflectionMethod::IS_PUBLIC);
        
        // Filtrer les méthodes propres à la classe (pas héritées)
        $ownMethods = array_filter($publicMethods, function($method) use ($reflection) {
            return $method->getDeclaringClass()->getName() === $reflection->getName();
        });
        
        foreach ($ownMethods as $method) {
            $this->assertTrue($method->isPublic(), "La méthode {$method->getName()} doit être publique");
        }
    }

    public function testControllerMethodSignatures(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        
        $expectedSignatures = [
            'list' => ['Request'],
            'show' => ['string', 'Request'],
            'deleteDocument' => ['string', 'Request'],
            'save' => ['Request'],
            'viewPdf' => ['string', 'Request']
        ];
        
        foreach ($expectedSignatures as $methodName => $expectedParams) {
            $method = $reflection->getMethod($methodName);
            $this->assertEquals(count($expectedParams), $method->getNumberOfParameters(), "Méthode $methodName doit avoir " . count($expectedParams) . " paramètres");
            
            $this->assertEquals(Response::class, $method->getReturnType()->getName(), "Méthode $methodName doit retourner Response");
        }
    }

    public function testControllerPrivateMethods(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $privateMethods = $reflection->getMethods(\ReflectionMethod::IS_PRIVATE);
        
        $expectedPrivateMethods = ['extractNumericValue', 'validateUnit'];
        
        $actualPrivateMethodNames = array_map(fn($method) => $method->getName(), $privateMethods);
        
        foreach ($expectedPrivateMethods as $methodName) {
            $this->assertContains($methodName, $actualPrivateMethodNames, "Méthode privée '$methodName' manquante");
        }
    }

    public function testControllerRouteAnnotation(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $attributes = $reflection->getAttributes(\Symfony\Component\Routing\Annotation\Route::class);
        
        $this->assertNotEmpty($attributes, 'Le contrôleur doit avoir une annotation Route');
        
        $routeAttribute = $attributes[0];
        $this->assertEquals('/api/documents', $routeAttribute->newInstance()->getPath());
        $this->assertEquals('api_documents_', $routeAttribute->newInstance()->getName());
    }

    public function testControllerMethodCount(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        $publicMethods = $reflection->getMethods(\ReflectionMethod::IS_PUBLIC);
        
        // Compter seulement les méthodes propres à la classe (pas héritées)
        $ownMethods = array_filter($publicMethods, function($method) use ($reflection) {
            return $method->getDeclaringClass()->getName() === $reflection->getName();
        });
        
        $this->assertCount(6, $ownMethods, 'Le contrôleur doit avoir exactement 6 méthodes publiques propres (incluant le constructeur)');
    }

    public function testControllerMethodParameterNames(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        
        $expectedParameters = [
            'list' => ['request'],
            'show' => ['id', 'request'],
            'deleteDocument' => ['id', 'request'],
            'save' => ['request'],
            'viewPdf' => ['id', 'request']
        ];
        
        foreach ($expectedParameters as $methodName => $expectedParamNames) {
            $method = $reflection->getMethod($methodName);
            $actualParamNames = array_map(fn($param) => $param->getName(), $method->getParameters());
            $this->assertEquals($expectedParamNames, $actualParamNames, "Noms de paramètres incorrects pour la méthode '$methodName'");
        }
    }

    public function testControllerMethodReturnTypes(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        
        $methods = ['list', 'show', 'deleteDocument', 'save', 'viewPdf'];
        
        foreach ($methods as $methodName) {
            $method = $reflection->getMethod($methodName);
            $returnType = $method->getReturnType();
            
            $this->assertNotNull($returnType, "La méthode '$methodName' doit avoir un type de retour");
            $this->assertEquals(Response::class, $returnType->getName(), "La méthode '$methodName' doit retourner Response");
        }
    }

    public function testControllerMethodVisibility(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        
        $publicMethods = ['list', 'show', 'deleteDocument', 'save', 'viewPdf'];
        
        foreach ($publicMethods as $methodName) {
            $method = $reflection->getMethod($methodName);
            $this->assertTrue($method->isPublic(), "La méthode '$methodName' doit être publique");
        }
    }

    public function testControllerPrivateMethodVisibility(): void
    {
        $reflection = new \ReflectionClass($this->controller);
        
        $privateMethods = ['extractNumericValue', 'validateUnit'];
        
        foreach ($privateMethods as $methodName) {
            $method = $reflection->getMethod($methodName);
            $this->assertTrue($method->isPrivate(), "La méthode '$methodName' doit être privée");
        }
    }
}
