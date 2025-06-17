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

    /**
     * Trouve tous les KPIs d'une entreprise donnée
     * @return array<int, Kpi>
     */
    public function findByCompanyId(int $companyId): array
    {
        return $this->createQueryBuilder('k')
            ->join('k.document', 'd')
            ->join('d.company', 'c')
            ->andWhere('c.id = :companyId')
            ->setParameter('companyId', $companyId)
            ->orderBy('k.name', 'ASC')
            ->addOrderBy('k.period', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve tous les KPIs d'une entreprise donnée pour une année spécifique
     * @return array<int, Kpi>
     */
    public function findByCompanyIdAndYear(int $companyId, int $year): array
    {
        return $this->createQueryBuilder('k')
            ->join('k.document', 'd')
            ->join('d.company', 'c')
            ->andWhere('c.id = :companyId')
            ->andWhere('d.year = :year')
            ->setParameter('companyId', $companyId)
            ->setParameter('year', $year)
            ->orderBy('k.name', 'ASC')
            ->addOrderBy('k.period', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve toutes les années disponibles pour les KPI d'une entreprise
     * @return array<int>
     */
    public function findAvailableYearsByCompanyId(int $companyId): array
    {
        $result = $this->createQueryBuilder('k')
            ->select('DISTINCT d.year')
            ->join('k.document', 'd')
            ->join('d.company', 'c')
            ->andWhere('c.id = :companyId')
            ->setParameter('companyId', $companyId)
            ->orderBy('d.year', 'DESC')
            ->getQuery()
            ->getResult();

        return array_map(fn($item) => $item['year'], $result);
    }
} 