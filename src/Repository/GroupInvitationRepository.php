<?php

namespace App\Repository;

use App\Entity\GroupInvitation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class GroupInvitationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, GroupInvitation::class);
    }

    public function findValidInvitationsByEmail(string $email): array
    {
        return $this->createQueryBuilder('i')
            ->where('i.email = :email')
            ->andWhere('i.expiresAt > :now')
            ->setParameter('email', $email)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getResult();
    }

    public function findValidInvitationByToken(string $token): ?GroupInvitation
    {
        return $this->createQueryBuilder('i')
            ->where('i.token = :token')
            ->andWhere('i.expiresAt > :now')
            ->setParameter('token', $token)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function deleteExpiredInvitations(): int
    {
        return $this->createQueryBuilder('i')
            ->delete()
            ->where('i.expiresAt <= :now')
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->execute();
    }
} 