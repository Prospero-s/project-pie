<?php

namespace App\Repository;

use App\Entity\VerificationCode;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<VerificationCode>
 */
class VerificationCodeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, VerificationCode::class);
    }

    public function save(VerificationCode $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(VerificationCode $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findValidCode(string $email, string $code, string $type = 'SIGNUP'): ?VerificationCode
    {
        return $this->createQueryBuilder('v')
            ->where('v.email = :email')
            ->andWhere('v.code = :code')
            ->andWhere('v.type = :type')
            ->andWhere('v.isUsed = :isUsed')
            ->andWhere('v.expiresAt > :now')
            ->setParameter('email', $email)
            ->setParameter('code', $code)
            ->setParameter('type', $type)
            ->setParameter('isUsed', false)
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function markAsUsed(VerificationCode $code): void
    {
        $code->setIsUsed(true);
        $this->save($code, true);
    }

    /**
     * Supprime tous les codes de vérification précédents pour un email donné et un type donné
     */
    public function removeAllPreviousCodes(string $email, string $type = 'SIGNUP'): void
    {
        $qb = $this->createQueryBuilder('v')
            ->delete()
            ->where('v.email = :email')
            ->andWhere('v.type = :type')
            ->setParameter('email', $email)
            ->setParameter('type', $type);
        
        $qb->getQuery()->execute();
    }

    public function createVerificationCode(string $email, string $fullName, string $type = 'SIGNUP'): VerificationCode
    {
        // Supprime les codes précédents pour cet email
        $this->removeAllPreviousCodes($email, $type);
        
        // Génère un code à 6 chiffres
        $code = sprintf('%06d', random_int(0, 999999));
        
        $verificationCode = new VerificationCode();
        $verificationCode->setEmail($email);
        $verificationCode->setFullName($fullName);
        $verificationCode->setCode($code);
        $verificationCode->setType($type);
        
        $this->save($verificationCode, true);
        
        return $verificationCode;
    }

    /**
     * Supprime tous les codes de vérification expirés
     * 
     * @return int Le nombre de codes supprimés
     */
    public function removeExpiredCodes(): int
    {
        $qb = $this->createQueryBuilder('v')
            ->delete()
            ->where('v.expiresAt < :now')
            ->setParameter('now', new \DateTimeImmutable());
        
        $result = $qb->getQuery()->execute();
        
        return $result;
    }

    /**
     * Vérifie si un code de vérification valide existe pour un email donné
     */
    public function hasValidCode(string $email, string $type = 'SIGNUP'): bool
    {
        $result = $this->createQueryBuilder('v')
            ->select('COUNT(v.id)')
            ->where('v.email = :email')
            ->andWhere('v.type = :type')
            ->andWhere('v.isUsed = :isUsed')
            ->andWhere('v.expiresAt > :now')
            ->setParameter('email', $email)
            ->setParameter('type', $type)
            ->setParameter('isUsed', false)
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->getSingleScalarResult();
        
        return $result > 0;
    }
} 