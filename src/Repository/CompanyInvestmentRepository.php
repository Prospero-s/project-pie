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
        
        $sql = "
            WITH RECURSIVE months AS (
                SELECT generate_series(1, 12) AS month_number
            )
            SELECT 
                TRIM(TO_CHAR(TO_DATE(months.month_number::text, 'MM'), 'Month')) as month,
                COALESCE(SUM(ci.amount), 0) as investment
            FROM months
            LEFT JOIN company_investment ci ON 
                EXTRACT(MONTH FROM ci.invested_at) = months.month_number
                AND EXTRACT(YEAR FROM ci.invested_at) = :year
                AND ci.company_id = :companyId
            GROUP BY months.month_number
            ORDER BY months.month_number;
        ";

        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'companyId' => $companyId,
            'year' => $year,
        ]);

        return $result->fetchAllAssociative();
    }

    public function fetchGlobalInvestments(string $userId): array
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = '
            SELECT 
                c.id AS company_id,
                c.denomination AS company_name,
            COALESCE(SUM(ci.amount), 0) AS total_investment
            FROM company c
            LEFT JOIN company_investment ci 
            ON c.id = ci.company_id 
            AND ci.user_id = :userId
            GROUP BY c.id, c.denomination
            ORDER BY total_investment DESC;
        ';

        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'userId' => $userId,
        ]);

        return $result->fetchAllAssociative();
    }

    public function fetchGlobalFundingInvestments(string $userId): array
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = '
            SELECT 
                ci.funding_type,
            COALESCE(SUM(ci.amount), 0) AS total_investment
            FROM company_investment ci
            WHERE ci.user_id = :userId
            GROUP BY ci.funding_type
            ORDER BY total_investment DESC;
        ';

        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'userId' => $userId,
        ]);

        return $result->fetchAllAssociative();
    }

    public function fetchGlobalSectorInvestments(string $userId): array
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = '
            SELECT 
                c.sector,
            COALESCE(SUM(ci.amount), 0) AS total_investment
            FROM company c
            LEFT JOIN company_investment ci
            ON c.id = ci.company_id
            AND ci.user_id = :userId
            GROUP BY c.sector
            ORDER BY c.sector, total_investment DESC;
        ';

        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'userId' => $userId,
        ]);

        return $result->fetchAllAssociative();
    }

}