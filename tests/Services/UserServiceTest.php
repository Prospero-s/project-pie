<?php

namespace App\Tests\Unit\Service\User;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\User\UserService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

class UserServiceTest extends TestCase
{
    private UserService $userService;
    private EntityManagerInterface $entityManager;
    private UserRepository $userRepository;

    protected function setUp(): void
    {
        // Créer les mocks
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->userRepository = $this->createMock(UserRepository::class);

        // Créer l'instance de UserService avec les mocks
        $this->userService = new UserService($this->entityManager, $this->userRepository);
    }

    public function testGetOrCreateUserReturnsExistingUser(): void
    {
        // Arrange
        $cognitoId = 'test-cognito-id';
        $email = 'test@example.com';
        $existingUser = new User();
        $existingUser->setCognitoId($cognitoId);
        $existingUser->setEmail($email);

        $this->userRepository
            ->expects($this->once())
            ->method('findByCognitoId')
            ->with($cognitoId)
            ->willReturn($existingUser);

        // Act
        $result = $this->userService->getOrCreateUser($cognitoId, $email);

        // Assert
        $this->assertSame($existingUser, $result);
        $this->assertEquals($cognitoId, $result->getCognitoId());
        $this->assertEquals($email, $result->getEmail());
    }

    public function testGetOrCreateUserCreatesNewUser(): void
    {
        // Arrange
        $cognitoId = 'test-cognito-id';
        $email = 'test@example.com';
        $name = 'John Doe';

        $this->userRepository
            ->expects($this->once())
            ->method('findByCognitoId')
            ->with($cognitoId)
            ->willReturn(null);

        $this->entityManager
            ->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (User $user) use ($cognitoId, $email, $name) {
                return $user->getCognitoId() === $cognitoId
                    && $user->getEmail() === $email
                    && $user->getName() === $name;
            }));

        $this->entityManager
            ->expects($this->once())
            ->method('flush');

        // Act
        $result = $this->userService->getOrCreateUser($cognitoId, $email, $name);

        // Assert
        $this->assertInstanceOf(User::class, $result);
        $this->assertEquals($cognitoId, $result->getCognitoId());
        $this->assertEquals($email, $result->getEmail());
        $this->assertEquals($name, $result->getName());
    }

    public function testFindUserByEmail(): void
    {
        // Arrange
        $email = 'test@example.com';
        $user = new User();
        $user->setEmail($email);

        $this->userRepository
            ->expects($this->once())
            ->method('findByEmail')
            ->with($email)
            ->willReturn($user);

        // Act
        $result = $this->userService->findUserByEmail($email);

        // Assert
        $this->assertSame($user, $result);
    }

    public function testFindUserByCognitoId(): void
    {
        // Arrange
        $cognitoId = 'test-cognito-id';
        $user = new User();
        $user->setCognitoId($cognitoId);

        $this->userRepository
            ->expects($this->once())
            ->method('findByCognitoId')
            ->with($cognitoId)
            ->willReturn($user);

        // Act
        $result = $this->userService->findUserByCognitoId($cognitoId);

        // Assert
        $this->assertSame($user, $result);
    }
}
