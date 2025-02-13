<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * @param string $cognitoId
     * @return User|null
     */
    public function findByCognitoId(string $cognitoId): ?User
    {
        return $this->findOneBy(['cognitoId' => $cognitoId]);
    }

    /**
     * @param string $email
     * @return User|null
     */
    public function findByEmail(string $email): ?User
    {
        return $this->findOneBy(['email' => $email]);
    }

    /**
     * @param int $groupId
     * @return list<User>
     */
    public function findGroupMembers(int $groupId): array
    {
        return $this->createQueryBuilder('u')
            ->where('u.userGroup = :groupId')
            ->setParameter('groupId', $groupId)
            ->getQuery()
            ->getResult();
    }
}
