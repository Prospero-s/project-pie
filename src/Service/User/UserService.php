<?php

namespace App\Service\User;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

class UserService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository
    ) {}

    public function getOrCreateUser(string $cognitoId, string $email, string $name = null): User
    {
        // Chercher d'abord l'utilisateur par cognitoId
        $user = $this->userRepository->findByCognitoId($cognitoId);
        
        if (!$user) {
            // Si l'utilisateur n'existe pas, le créer
            $user = new User();
            $user->setCognitoId($cognitoId);
            $user->setEmail($email);
            $user->setName($name);
            $this->entityManager->persist($user);
            $this->entityManager->flush();
        }

        return $user;
    }

    public function findUserByEmail(string $email): ?User
    {
        return $this->userRepository->findByEmail($email);
    }

    public function findUserByCognitoId(string $cognitoId): ?User
    {
        return $this->userRepository->findByCognitoId($cognitoId);
    }

    public function getUserGroupByCognitoId(string $cognitoId): ?\App\Entity\UserGroup
    {
        $user = $this->userRepository->findByCognitoId($cognitoId);
        
        return $user?->getUserGroup();
    }
} 