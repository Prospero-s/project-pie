<?php

namespace App\Repository;

use App\Entity\CompanyInvestment;
use App\Entity\UserGroup;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CompanyInvestment>
 */
class CompanyInvestmentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CompanyInvestment::class);
    }

    /**
     * @param int $companyId
     * @param int $year
     * @param UserGroup $userGroup
     * @return list<array<string, mixed>>
     */
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

    /**
     * @param UserGroup $userGroup
     * @return list<array<string, mixed>>
     */
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

    /**
     * @param UserGroup $userGroup
     * @return list<array<string, mixed>>
     */
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

    /**
     * @param UserGroup $userGroup
     * @return list<array<string, mixed>>
     */
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

    /**
     * Récupère la liste des requêtes prédéfinies disponibles pour l'explorateur de données
     * 
     * @return list<array<string, mixed>>
     */
    public function getPredefinedQueries(): array
    {
        return [
            [
                'id' => '1',
                'name' => 'Revenus mensuels',
                'description' => 'Évolution des revenus par mois',
                'query' => 'monthly_revenue'
            ],
            [
                'id' => '2', 
                'name' => 'Clients par secteur',
                'description' => 'Répartition des clients par secteur d\'activité',
                'query' => 'clients_by_sector'
            ],
            [
                'id' => '3',
                'name' => 'Croissance ARR',
                'description' => 'Évolution de l\'ARR (Annual Recurring Revenue) par trimestre',
                'query' => 'arr_growth'
            ],
            [
                'id' => '4',
                'name' => 'Top 10 clients',
                'description' => 'Liste des 10 plus grands clients par valeur',
                'query' => 'top_clients'
            ],
            [
                'id' => '5',
                'name' => 'Évolution des effectifs',
                'description' => 'Évolution du nombre d\'employés par trimestre',
                'query' => 'headcount'
            ],
            [
                'id' => '6',
                'name' => 'Investissements',
                'description' => 'Valeur des investissements par trimestre',
                'query' => 'quarterly_investments'
            ],
            [
                'id' => '7',
                'name' => 'Total investi',
                'description' => 'Montant total investi dans l\'entreprise',
                'query' => 'total_investment'
            ],
            [
                'id' => '8',
                'name' => 'Analyse KPI par période',
                'description' => 'Vue d\'ensemble des KPI principaux avec évolution période par période',
                'query' => 'kpi_analysis_by_period'
            ]
        ];
    }

    /**
     * Exécute une requête prédéfinie en fonction de son ID
     * 
     * @param string $queryId ID de la requête prédéfinie ou nom de la requête
     * @param int $companyId ID de l'entreprise
     * @param UserGroup $userGroup Groupe utilisateur
     * @return list<array<string, mixed>>
     */
    public function executeQueryById(string $queryId, int $companyId, UserGroup $userGroup): array
    {
        $conn = $this->getEntityManager()->getConnection();

        switch ($queryId) {
            case 'monthly_revenue':
            case '1':
                // Revenus mensuels
                $sql = "
                    WITH RECURSIVE months AS (
                        SELECT generate_series(1, 12) AS month_number,
                        to_char(NOW() - (INTERVAL '1 month' * generate_series(0, 11)), 'YYYY-MM') as month_year
                    )
                    SELECT 
                        months.month_year as month,
                        COALESCE(SUM((k.kpi->>'revenue')::numeric), 0) as revenue
                    FROM months
                    LEFT JOIN kpi_data k ON 
                        to_char(k.created_at, 'YYYY-MM') = months.month_year
                        AND k.company_id = :companyId
                        AND k.user_group_id = :userGroupId
                        AND k.deleted_at IS NULL
                    GROUP BY months.month_year, months.month_number
                    ORDER BY months.month_year DESC
                    LIMIT 12;
                ";
                break;
                
            case 'clients_by_sector':
            case '2':
                // Clients par secteur
                $sql = "
                    SELECT 
                        c.sector,
                        COUNT(*) as client_count
                    FROM company c
                    INNER JOIN company_investment ci ON c.id = ci.company_id
                    WHERE ci.company_id = :companyId
                    AND ci.user_group_id = :userGroupId
                    AND c.deleted_at IS NULL
                    GROUP BY c.sector
                    HAVING COUNT(*) > 0
                    ORDER BY client_count DESC;
                ";
                break;
                
            case 'arr_growth':
            case '3':
                // Croissance ARR
                $sql = "
                    SELECT 
                        CONCAT('Q', EXTRACT(QUARTER FROM k.created_at)) as quarter,
                        EXTRACT(YEAR FROM k.created_at)::INTEGER as year,
                        COALESCE(SUM((k.kpi->>'arr')::numeric), 0) as arr_value
                    FROM kpi_data k
                    WHERE k.company_id = :companyId
                    AND k.user_group_id = :userGroupId
                    AND k.deleted_at IS NULL
                    GROUP BY quarter, year
                    ORDER BY year DESC, quarter DESC
                    LIMIT 8;
                ";
                break;
                
            case 'top_clients':
            case '4':
                // Top 10 clients
                $sql = "
                    SELECT 
                        c.denomination as client_name,
                        SUM(ci.amount) as annual_value
                    FROM company c
                    INNER JOIN company_investment ci ON c.id = ci.company_id
                    WHERE ci.user_group_id = :userGroupId
                    AND c.deleted_at IS NULL
                    GROUP BY c.denomination
                    ORDER BY annual_value DESC
                    LIMIT 10;
                ";
                break;
                
            case 'headcount':
            case '5':
                // Évolution des effectifs
                $sql = "
                    SELECT 
                        CONCAT('Q', EXTRACT(QUARTER FROM k.created_at)) as quarter,
                        EXTRACT(YEAR FROM k.created_at)::INTEGER as year,
                        COALESCE((k.kpi->>'headcount')::INTEGER, 0) as headcount
                    FROM kpi_data k
                    WHERE k.company_id = :companyId
                    AND k.user_group_id = :userGroupId
                    AND k.deleted_at IS NULL
                    AND k.kpi ? 'headcount'
                    ORDER BY year DESC, quarter DESC
                    LIMIT 8;
                ";
                break;
                
            case 'quarterly_investments':
            case '6':
                // Investissements trimestriels
                $sql = "
                    SELECT 
                        CONCAT('Q', EXTRACT(QUARTER FROM ci.invested_at)) as quarter,
                        EXTRACT(YEAR FROM ci.invested_at)::INTEGER as year,
                        SUM(ci.amount) as investment_value
                    FROM company_investment ci
                    WHERE ci.company_id = :companyId
                    AND ci.user_group_id = :userGroupId
                    GROUP BY quarter, year
                    ORDER BY year DESC, quarter DESC
                    LIMIT 8;
                ";
                break;
                
            case 'total_investment':
            case '7':
                // Total investi
                $sql = "
                    SELECT 
                        'Total' as category,
                        SUM(ci.amount) as total_amount,
                        COUNT(ci.id) as nb_investments,
                        MIN(ci.invested_at) as first_investment,
                        MAX(ci.invested_at) as last_investment
                    FROM company_investment ci
                    WHERE ci.company_id = :companyId
                    AND ci.user_group_id = :userGroupId
                    
                    UNION ALL
                    
                    SELECT 
                        ci.funding_type as category,
                        SUM(ci.amount) as total_amount,
                        COUNT(ci.id) as nb_investments,
                        MIN(ci.invested_at) as first_investment,
                        MAX(ci.invested_at) as last_investment
                    FROM company_investment ci
                    WHERE ci.company_id = :companyId
                    AND ci.user_group_id = :userGroupId
                    GROUP BY ci.funding_type
                    HAVING SUM(ci.amount) > 0
                    ORDER BY total_amount DESC;
                ";
                break;
                
            case 'kpi_analysis_by_period':
            case '8':
                // Analyse KPI par période - basée sur les investissements pour avoir des données
                $sql = "
                    SELECT 
                        EXTRACT(YEAR FROM ci.invested_at)::INTEGER as year,
                        CONCAT('Q', EXTRACT(QUARTER FROM ci.invested_at)) as quarter,
                        COUNT(DISTINCT ci.id) as nb_investments,
                        COUNT(DISTINCT c.id) as nb_companies,
                        COALESCE(AVG(ci.amount), 0) as avg_investment_value,
                        COALESCE(SUM(ci.amount), 0) as total_investment_value,
                        COALESCE(MAX(ci.amount), 0) as max_investment_value,
                        COALESCE(MIN(ci.amount), 0) as min_investment_value,
                        STRING_AGG(DISTINCT ci.funding_type, ', ') as funding_types,
                        STRING_AGG(DISTINCT c.sector, ', ') as sectors
                    FROM company_investment ci
                    LEFT JOIN company c ON ci.company_id = c.id
                    WHERE ci.company_id = :companyId
                    AND ci.user_group_id = :userGroupId
                    AND EXTRACT(YEAR FROM ci.invested_at) >= EXTRACT(YEAR FROM NOW()) - 3
                    GROUP BY year, quarter
                    HAVING COUNT(DISTINCT ci.id) > 0
                    ORDER BY year DESC, quarter DESC
                    LIMIT 12;
                ";
                break;
                
            default:
                // Requête par défaut
                return [];
        }

        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'companyId' => $companyId,
            'userGroupId' => $userGroup->getId(),
        ]);

        return $result->fetchAllAssociative();
    }
}
