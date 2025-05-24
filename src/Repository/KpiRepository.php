<?php

namespace App\Repository;

use App\Entity\Kpi;
use App\Entity\Document;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Kpi>
 */
class KpiRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Kpi::class);
    }

    public function save(Kpi $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Kpi $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Trouve tous les KPIs associés à un document
     * @return array<int, Kpi>
     */
    public function findByDocument(Document $document): array
    {
        return $this->createQueryBuilder('k')
            ->andWhere('k.document = :document')
            ->setParameter('document', $document)
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve les KPIs par document et période
     * @return array<int, Kpi>
     */
    public function findByDocumentAndPeriod(Document $document, string $period): array
    {
        return $this->createQueryBuilder('k')
            ->andWhere('k.document = :document')
            ->andWhere('k.period = :period')
            ->setParameter('document', $document)
            ->setParameter('period', $period)
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve un KPI spécifique par document, nom et période
     */
    public function findOneByDocumentNameAndPeriod(Document $document, string $name, string $period): ?Kpi
    {
        return $this->createQueryBuilder('k')
            ->andWhere('k.document = :document')
            ->andWhere('k.name = :name')
            ->andWhere('k.period = :period')
            ->setParameter('document', $document)
            ->setParameter('name', $name)
            ->setParameter('period', $period)
            ->getQuery()
            ->getOneOrNullResult();
    }
} 