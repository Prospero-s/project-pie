<?php

namespace App\Repository;

use App\Entity\Company;
use App\Entity\KpiData;
use App\Entity\UploadDocument;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<KpiData>
 */
class KpiDataRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $em;

    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, KpiData::class);
        $this->em = $em;
    }

    public function saveKpi(Company $company, array $data, User $user): KpiData
    {
        $kpiData = new KpiData();
        $kpiData->setCompany($company);
        $kpiData->setKpi($data['text']);
        $kpiData->setPdfUrl($data['pdfUrl'] ?? null);
        $kpiData->setStatus('processed'); 
        $kpiData->setUpdatedAt(new \DateTime());
        
        $uploadDocument = new UploadDocument();
        $uploadDocument->setKpiData($kpiData);
        $uploadDocument->setUser($user);
        
        $kpiData->addUploadDocument($uploadDocument);
        
        $this->em->persist($kpiData);
        $this->em->persist($uploadDocument);
        $this->em->flush();

        return $kpiData;
    }

    public function saveDraftKpi(Company $company, array $data, User $user): KpiData
    {
        $kpiData = new KpiData();
        $kpiData->setCompany($company);
        $kpiData->setKpi($data['text']);
        $kpiData->setPdfUrl($data['pdfUrl'] ?? null);
        $kpiData->setStatus('draft'); 
        $kpiData->setUpdatedAt(new \DateTime());

        $uploadDocument = new UploadDocument();
        $uploadDocument->setKpiData($kpiData);
        $uploadDocument->setUser($user);
        
        $kpiData->addUploadDocument($uploadDocument);
        
        $this->em->persist($kpiData);
        $this->em->persist($uploadDocument);
        $this->em->flush();

        return $kpiData;
    }

    public function changeStatus(KpiData $kpiData, array $kpiArray, string $status): void
    {
        $kpiData->setKpi($kpiArray);
        $kpiData->setStatus($status);
        $this->em->persist($kpiData);
        $this->em->flush();
    }

    public function deleteKpi(KpiData $kpiData): void
    {
        $kpiData->setDeletedAt(new \DateTimeImmutable());
        $this->em->persist($kpiData);
        $this->em->flush();
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
}
