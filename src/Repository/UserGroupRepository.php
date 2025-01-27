<?php

namespace App\Repository;

use App\Entity\UserGroup;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserGroupRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserGroup::class);
    }

    public function findByMemberCognitoId(string $cognitoId): array
    {
        return $this->createQueryBuilder('ug')
            ->join('ug.users', 'u')
            ->join('ug.owner', 'o')
            ->where('u.cognitoId = :cognitoId')
            ->orWhere('o.cognitoId = :cognitoId')
            ->setParameter('cognitoId', $cognitoId)
            ->getQuery()
            ->getResult();
    }

    public function findByOwnerCognitoId(string $cognitoId): array
    {
        return $this->findBy(['ownerCognitoId' => $cognitoId]);
    }
}