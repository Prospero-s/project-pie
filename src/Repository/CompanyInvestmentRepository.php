<?php

namespace App\Repository;

use App\Entity\CompanyInvestment;
use App\Entity\UserGroup;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CompanyInvestmentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CompanyInvestment::class);
    }

    public function findByCompanyIdAndYear(int $companyId, int $year, UserGroup $userGroup): array
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
                AND ci.user_group_id = :userGroupId
            GROUP BY months.month_number
            ORDER BY months.month_number;
        ";

        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'companyId' => $companyId,
            'year' => $year,
            'userGroupId' => $userGroup->getId(),
        ]);

        return $result->fetchAllAssociative();
    }

    public function fetchGlobalInvestments(UserGroup $userGroup): array
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = '
            SELECT 
                c.id AS company_id,
                c.denomination AS company_name,
                SUM(ci.amount) AS total_investment
            FROM company c
            INNER JOIN company_investment ci 
            ON c.id = ci.company_id 
            WHERE ci.user_group_id = :userGroupId
            GROUP BY c.id, c.denomination
            HAVING SUM(ci.amount) > 0
            ORDER BY total_investment DESC;
        ';

        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'userGroupId' => $userGroup->getId(),
        ]);

        return $result->fetchAllAssociative();
    }

    public function fetchGlobalFundingInvestments(UserGroup $userGroup): array
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = '
            SELECT 
                ci.funding_type,
                SUM(ci.amount) AS total_investment
            FROM company_investment ci
            WHERE ci.user_group_id = :userGroupId
            GROUP BY ci.funding_type
            HAVING SUM(ci.amount) > 0
            ORDER BY total_investment DESC;
        ';

        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'userGroupId' => $userGroup->getId(),
        ]);

        return $result->fetchAllAssociative();
    }

    public function fetchGlobalSectorInvestments(UserGroup $userGroup): array
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = '
            SELECT 
                c.sector,
                SUM(ci.amount) AS total_investment
            FROM company c
            INNER JOIN company_investment ci
            ON c.id = ci.company_id
            WHERE ci.user_group_id = :userGroupId
            GROUP BY c.sector
            HAVING SUM(ci.amount) > 0
            ORDER BY total_investment DESC;
        ';

        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'userGroupId' => $userGroup->getId(),
        ]);

        return $result->fetchAllAssociative();
    }

}