<?php

namespace App\Repository;

use App\Entity\CompanyInvestment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CompanyInvestmentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CompanyInvestment::class);
    }

    public function findByCompanyIdAndYear(int $companyId, int $year): array
    {
        $conn = $this->getEntityManager()->getConnection();
        
        $sql = '
            WITH RECURSIVE months AS (
                SELECT generate_series(1, 12) AS month_number
            )
            SELECT 
                TO_CHAR(TO_DATE(months.month_number::text, \'MM\'), \'Month\') as month,
                COALESCE(SUM(ci.amount), 0) as investment
            FROM months
            LEFT JOIN company_investment ci ON 
                EXTRACT(MONTH FROM ci.invested_at) = months.month_number
                AND EXTRACT(YEAR FROM ci.invested_at) = :year
                AND ci.company_id = :companyId
            GROUP BY months.month_number
            ORDER BY months.month_number
        ';

        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'companyId' => $companyId,
            'year' => $year,
        ]);

        return $result->fetchAllAssociative();
    }
}