<?php

namespace App\Repository;

use App\Entity\Document;
use App\Entity\Company;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Uid\Uuid;

/**
 * @extends ServiceEntityRepository<Document>
 */
class DocumentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Document::class);
    }

    public function save(Document $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Document $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Trouve tous les documents pour une compagnie
     * @return array<int, Document>
     */
    public function findByCompany(Company $company): array
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.company = :company')
            ->setParameter('company', $company)
            ->orderBy('d.addDate', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve tous les documents pour une compagnie et une année spécifique
     * @return array<int, Document>
     */
    public function findByCompanyAndYear(Company $company, int $year): array
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.company = :company')
            ->andWhere('d.year = :year')
            ->setParameter('company', $company)
            ->setParameter('year', $year)
            ->orderBy('d.addDate', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve un document par son UUID
     */
    public function findOneByUuid(string $uuid): ?Document
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.id = :uuid')
            ->setParameter('uuid', Uuid::fromString($uuid))
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Supprime un document par son UUID
     *
     * @param string $uuid UUID du document à supprimer
     * @return bool True si le document a été supprimé, false sinon
     */
    public function deleteDocumentByUuid(string $uuid): bool
    {
        $document = $this->findOneByUuid($uuid);

        if (!$document) {
            return false;
        }

        $em = $this->getEntityManager();
        $em->remove($document);
        $em->flush();

        return true;
    }
}
