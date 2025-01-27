<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function findByCognitoId(string $cognitoId): ?User
    {
        return $this->findOneBy(['cognitoId' => $cognitoId]);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->findOneBy(['email' => $email]);
    }

    public function findGroupMembers(int $groupId): array
    {
        return $this->createQueryBuilder('u')
            ->where('u.userGroup = :groupId')
            ->setParameter('groupId', $groupId)
            ->getQuery()
            ->getResult();
    }
} 