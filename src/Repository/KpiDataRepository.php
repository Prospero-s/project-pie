<?php

namespace App\Repository;

use App\Entity\KpiData;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<KpiData>
 */
class KpiDataRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, KpiData::class);
    }

    public function saveKpiData(array $kpiData, Company $company, ?string $pdfUrl = null, string $status = 'draft'): KpiData
    {
        $kpi = new KpiData();
        $kpi->setCompany($company);
        $kpi->setKpi($kpiData);
        $kpi->setPdfUrl($pdfUrl);
        $kpi->setStatus($status);
        $kpi->setCreatedAt(new \DateTimeImmutable());

        $this->getEntityManager()->persist($kpi);
        $this->getEntityManager()->flush();

        return $kpi;
    }

    public function findKpiByCompany(Company $company): array
    {
        return $this->createQueryBuilder('k')
            ->where('k.company = :company')
            ->setParameter('company', $company)
            ->orderBy('k.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findKpiByStatus(string $status): array
    {
        return $this->createQueryBuilder('k')
            ->where('k.status = :status')
            ->setParameter('status', $status)
            ->orderBy('k.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
    //    /**
    //     * @return KpiData[] Returns an array of KpiData objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('k')
    //            ->andWhere('k.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('k.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?KpiData
    //    {
    //        return $this->createQueryBuilder('k')
    //            ->andWhere('k.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
