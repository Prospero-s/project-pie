<?php

namespace App\Tests\Services;

use App\Entity\Notifications;
use App\Entity\User;
use App\Entity\UserNotifications;
use App\Entity\NotificationSettings;
use App\Repository\NotificationsRepository;
use App\Repository\UserNotificationsRepository;
use App\Repository\NotificationSettingsRepository;
use App\Enum\NotificationStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

class NotificationServiceTest extends TestCase
{
    private NotificationsRepository $notificationsRepository;
    private UserNotificationsRepository $userNotificationsRepository;
    private NotificationSettingsRepository $notificationSettingsRepository;
    private MockObject $entityManager;
    private MockObject $managerRegistry;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->managerRegistry = $this->createMock(ManagerRegistry::class);
        
        $this->notificationsRepository = new NotificationsRepository($this->managerRegistry, $this->entityManager);
        $this->userNotificationsRepository = new UserNotificationsRepository($this->managerRegistry, $this->entityManager);
        $this->notificationSettingsRepository = new NotificationSettingsRepository($this->managerRegistry, $this->entityManager);
    }

    public function testNotificationsRepositoryConstructor(): void
    {
        $this->assertInstanceOf(ServiceEntityRepository::class, $this->notificationsRepository);
        $this->assertInstanceOf(NotificationsRepository::class, $this->notificationsRepository);
    }

    public function testUserNotificationsRepositoryConstructor(): void
    {
        $this->assertInstanceOf(ServiceEntityRepository::class, $this->userNotificationsRepository);
        $this->assertInstanceOf(UserNotificationsRepository::class, $this->userNotificationsRepository);
    }

    public function testNotificationSettingsRepositoryConstructor(): void
    {
        $this->assertInstanceOf(ServiceEntityRepository::class, $this->notificationSettingsRepository);
        $this->assertInstanceOf(NotificationSettingsRepository::class, $this->notificationSettingsRepository);
    }

    public function testNotificationsRepositoryMethodsExist(): void
    {
        $reflection = new \ReflectionClass($this->notificationsRepository);
        $expectedMethods = ['__construct', 'add'];
        
        $actualMethods = array_map(
            fn($method) => $method->getName(),
            $reflection->getMethods(\ReflectionMethod::IS_PUBLIC)
        );

        foreach ($expectedMethods as $method) {
            $this->assertContains($method, $actualMethods, "Méthode '$method' manquante dans NotificationsRepository");
        }
    }

    public function testUserNotificationsRepositoryMethodsExist(): void
    {
        $reflection = new \ReflectionClass($this->userNotificationsRepository);
        $expectedMethods = ['__construct', 'send'];
        
        $actualMethods = array_map(
            fn($method) => $method->getName(),
            $reflection->getMethods(\ReflectionMethod::IS_PUBLIC)
        );

        foreach ($expectedMethods as $method) {
            $this->assertContains($method, $actualMethods, "Méthode '$method' manquante dans UserNotificationsRepository");
        }
    }

    public function testNotificationSettingsRepositoryMethodsExist(): void
    {
        $reflection = new \ReflectionClass($this->notificationSettingsRepository);
        $expectedMethods = ['__construct', 'resetNotificationSettings', 'changeNotificationsSettings'];
        
        $actualMethods = array_map(
            fn($method) => $method->getName(),
            $reflection->getMethods(\ReflectionMethod::IS_PUBLIC)
        );

        foreach ($expectedMethods as $method) {
            $this->assertContains($method, $actualMethods, "Méthode '$method' manquante dans NotificationSettingsRepository");
        }
    }

    public function testNotificationsRepositoryAddMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->notificationsRepository);
        $addMethod = $reflection->getMethod('add');
        
        $this->assertEquals(3, $addMethod->getNumberOfParameters());
        $this->assertEquals(Notifications::class, $addMethod->getReturnType()->getName());
        
        $parameters = $addMethod->getParameters();
        $this->assertEquals('string', $parameters[0]->getType()->getName());
        $this->assertEquals('string', $parameters[1]->getType()->getName());
        $this->assertEquals('string', $parameters[2]->getType()->getName());
    }

    public function testUserNotificationsRepositorySendMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->userNotificationsRepository);
        $sendMethod = $reflection->getMethod('send');
        
        $this->assertEquals(2, $sendMethod->getNumberOfParameters());
        $this->assertEquals('void', $sendMethod->getReturnType()->getName());
        
        $parameters = $sendMethod->getParameters();
        $this->assertEquals(User::class, $parameters[0]->getType()->getName());
        $this->assertEquals(Notifications::class, $parameters[1]->getType()->getName());
    }

    public function testNotificationSettingsRepositoryResetMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->notificationSettingsRepository);
        $resetMethod = $reflection->getMethod('resetNotificationSettings');
        
        $this->assertEquals(2, $resetMethod->getNumberOfParameters());
        
        // Vérifier le type de retour
        $returnType = $resetMethod->getReturnType();
        if ($returnType !== null) {
            $this->assertEquals('void', $returnType->getName());
        }
        
        $parameters = $resetMethod->getParameters();
        
        // Vérifier le premier paramètre
        $firstParamType = $parameters[0]->getType();
        if ($firstParamType !== null) {
            $this->assertEquals('App\Entity\NotificationSettings', $firstParamType->getName());
        }
        $this->assertTrue($parameters[0]->allowsNull());
        
        // Vérifier le deuxième paramètre
        $secondParamType = $parameters[1]->getType();
        if ($secondParamType !== null) {
            $this->assertEquals(User::class, $secondParamType->getName());
        }
    }

    public function testNotificationSettingsRepositoryChangeMethodSignature(): void
    {
        $reflection = new \ReflectionClass($this->notificationSettingsRepository);
        $changeMethod = $reflection->getMethod('changeNotificationsSettings');
        
        $this->assertEquals(2, $changeMethod->getNumberOfParameters());
        
        // Vérifier le type de retour
        $returnType = $changeMethod->getReturnType();
        if ($returnType !== null) {
            $this->assertEquals('void', $returnType->getName());
        }
        
        $parameters = $changeMethod->getParameters();
        
        // Vérifier le premier paramètre
        $firstParamType = $parameters[0]->getType();
        if ($firstParamType !== null) {
            $this->assertEquals(NotificationSettings::class, $firstParamType->getName());
        }
        
        // Vérifier le deuxième paramètre
        $secondParamType = $parameters[1]->getType();
        if ($secondParamType !== null) {
            $this->assertEquals('string', $secondParamType->getName());
        }
    }

    public function testNotificationsRepositoryDocumentation(): void
    {
        $reflection = new \ReflectionClass($this->notificationsRepository);
        $this->assertNotEmpty($reflection->getDocComment(), 'La classe NotificationsRepository doit avoir une documentation PHPDoc');
    }

    public function testUserNotificationsRepositoryDocumentation(): void
    {
        $reflection = new \ReflectionClass($this->userNotificationsRepository);
        $this->assertNotEmpty($reflection->getDocComment(), 'La classe UserNotificationsRepository doit avoir une documentation PHPDoc');
    }

    public function testNotificationSettingsRepositoryDocumentation(): void
    {
        $reflection = new \ReflectionClass($this->notificationSettingsRepository);
        $this->assertNotEmpty($reflection->getDocComment(), 'La classe NotificationSettingsRepository doit avoir une documentation PHPDoc');
        
        // Vérifier la documentation des méthodes
        $resetMethod = $reflection->getMethod('resetNotificationSettings');
        $this->assertNotEmpty($resetMethod->getDocComment(), 'La méthode resetNotificationSettings doit avoir une documentation PHPDoc');
        
        $changeMethod = $reflection->getMethod('changeNotificationsSettings');
        $this->assertNotEmpty($changeMethod->getDocComment(), 'La méthode changeNotificationsSettings doit avoir une documentation PHPDoc');
    }

    public function testRepositoryInheritance(): void
    {
        $this->assertInstanceOf(ServiceEntityRepository::class, $this->notificationsRepository);
        $this->assertInstanceOf(ServiceEntityRepository::class, $this->userNotificationsRepository);
        $this->assertInstanceOf(ServiceEntityRepository::class, $this->notificationSettingsRepository);
    }

    public function testRepositoryEntityManagerInjection(): void
    {
        $reflection = new \ReflectionClass($this->notificationsRepository);
        $constructor = $reflection->getConstructor();
        
        $this->assertNotNull($constructor, 'Le constructeur doit exister');
        $this->assertEquals(2, $constructor->getNumberOfParameters(), 'Le constructeur doit avoir 2 paramètres');
        
        $parameters = $constructor->getParameters();
        $this->assertEquals(ManagerRegistry::class, $parameters[0]->getType()->getName());
        $this->assertEquals(EntityManagerInterface::class, $parameters[1]->getType()->getName());
    }

    public function testRepositoryMethodsArePublic(): void
    {
        $repositories = [
            $this->notificationsRepository,
            $this->userNotificationsRepository,
            $this->notificationSettingsRepository
        ];
        
        foreach ($repositories as $repository) {
            $reflection = new \ReflectionClass($repository);
            $publicMethods = $reflection->getMethods(\ReflectionMethod::IS_PUBLIC);
            
            // Filtrer les méthodes propres à la classe (pas héritées)
            $ownMethods = array_filter($publicMethods, function($method) use ($reflection) {
                return $method->getDeclaringClass()->getName() === $reflection->getName();
            });
            
            foreach ($ownMethods as $method) {
                $this->assertTrue($method->isPublic(), "La méthode {$method->getName()} doit être publique");
            }
        }
    }

    public function testRepositoryNamespace(): void
    {
        $this->assertEquals('App\Repository', (new \ReflectionClass($this->notificationsRepository))->getNamespaceName());
        $this->assertEquals('App\Repository', (new \ReflectionClass($this->userNotificationsRepository))->getNamespaceName());
        $this->assertEquals('App\Repository', (new \ReflectionClass($this->notificationSettingsRepository))->getNamespaceName());
    }

    public function testRepositoryClassName(): void
    {
        $this->assertEquals('NotificationsRepository', (new \ReflectionClass($this->notificationsRepository))->getShortName());
        $this->assertEquals('UserNotificationsRepository', (new \ReflectionClass($this->userNotificationsRepository))->getShortName());
        $this->assertEquals('NotificationSettingsRepository', (new \ReflectionClass($this->notificationSettingsRepository))->getShortName());
    }

    public function testRepositoryHasNoStaticMethods(): void
    {
        $repositories = [
            $this->notificationsRepository,
            $this->userNotificationsRepository,
            $this->notificationSettingsRepository
        ];
        
        foreach ($repositories as $repository) {
            $reflection = new \ReflectionClass($repository);
            $staticMethods = $reflection->getMethods(\ReflectionMethod::IS_STATIC);
            
            // Filtrer les méthodes héritées de la classe parente
            $ownStaticMethods = array_filter($staticMethods, function($method) use ($reflection) {
                return $method->getDeclaringClass()->getName() === $reflection->getName();
            });
            
            $this->assertCount(0, $ownStaticMethods, 'Le repository ne doit pas avoir de méthodes statiques propres');
        }
    }

    public function testRepositoryHasNoAbstractMethods(): void
    {
        $repositories = [
            $this->notificationsRepository,
            $this->userNotificationsRepository,
            $this->notificationSettingsRepository
        ];
        
        foreach ($repositories as $repository) {
            $reflection = new \ReflectionClass($repository);
            $this->assertFalse($reflection->isAbstract(), 'Le repository ne doit pas être une classe abstraite');
            
            $abstractMethods = $reflection->getMethods(\ReflectionMethod::IS_ABSTRACT);
            $this->assertCount(0, $abstractMethods, 'Le repository ne doit pas avoir de méthodes abstraites');
        }
    }

    public function testRepositoryIsNotFinal(): void
    {
        $repositories = [
            $this->notificationsRepository,
            $this->userNotificationsRepository,
            $this->notificationSettingsRepository
        ];
        
        foreach ($repositories as $repository) {
            $reflection = new \ReflectionClass($repository);
            $this->assertFalse($reflection->isFinal(), 'Le repository ne doit pas être une classe finale pour permettre l\'héritage si nécessaire');
        }
    }

    public function testNotificationSettingsRepositoryMethodParameterNames(): void
    {
        $reflection = new \ReflectionClass($this->notificationSettingsRepository);
        
        $expectedParameters = [
            'resetNotificationSettings' => ['settings', 'user'],
            'changeNotificationsSettings' => ['settings', 'param']
        ];
        
        foreach ($expectedParameters as $methodName => $expectedParamNames) {
            $method = $reflection->getMethod($methodName);
            $actualParamNames = array_map(fn($param) => $param->getName(), $method->getParameters());
            $this->assertEquals($expectedParamNames, $actualParamNames, "Noms de paramètres incorrects pour la méthode '$methodName'");
        }
    }

    public function testNotificationsRepositoryMethodParameterNames(): void
    {
        $reflection = new \ReflectionClass($this->notificationsRepository);
        $addMethod = $reflection->getMethod('add');
        
        $expectedParamNames = ['title', 'message', 'type'];
        $actualParamNames = array_map(fn($param) => $param->getName(), $addMethod->getParameters());
        $this->assertEquals($expectedParamNames, $actualParamNames, 'Noms de paramètres incorrects pour la méthode add');
    }

    public function testUserNotificationsRepositoryMethodParameterNames(): void
    {
        $reflection = new \ReflectionClass($this->userNotificationsRepository);
        $sendMethod = $reflection->getMethod('send');
        
        $expectedParamNames = ['to', 'notification'];
        $actualParamNames = array_map(fn($param) => $param->getName(), $sendMethod->getParameters());
        $this->assertEquals($expectedParamNames, $actualParamNames, 'Noms de paramètres incorrects pour la méthode send');
    }

    public function testRepositoryMethodCount(): void
    {
        $expectedCounts = [
            'NotificationsRepository' => 2, // constructeur + add
            'UserNotificationsRepository' => 2, // constructeur + send
            'NotificationSettingsRepository' => 3 // constructeur + reset + change
        ];
        
        $repositories = [
            'NotificationsRepository' => $this->notificationsRepository,
            'UserNotificationsRepository' => $this->userNotificationsRepository,
            'NotificationSettingsRepository' => $this->notificationSettingsRepository
        ];
        
        foreach ($repositories as $name => $repository) {
            $reflection = new \ReflectionClass($repository);
            $publicMethods = $reflection->getMethods(\ReflectionMethod::IS_PUBLIC);
            
            // Compter seulement les méthodes propres à la classe (pas héritées)
            $ownMethods = array_filter($publicMethods, function($method) use ($reflection) {
                return $method->getDeclaringClass()->getName() === $reflection->getName();
            });
            
            $this->assertCount($expectedCounts[$name], $ownMethods, "Le repository $name doit avoir exactement {$expectedCounts[$name]} méthodes publiques propres");
        }
    }
}
