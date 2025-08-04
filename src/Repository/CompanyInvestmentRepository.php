<?php

namespace App\Repository;

use App\Entity\CompanyInvestment;
use App\Entity\UserGroup;
use App\Repository\DocumentRepository;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CompanyInvestment>
 */
class CompanyInvestmentRepository extends ServiceEntityRepository
{
    private DocumentRepository $documentRepository;

    public function __construct(ManagerRegistry $registry, DocumentRepository $documentRepository)
    {
        parent::__construct($registry, CompanyInvestment::class);
        $this->documentRepository = $documentRepository;
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
     * @return int
     */
    public function countInvestedCompaniesByGroup(UserGroup $userGroup): int
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = '
            SELECT COUNT(DISTINCT ci.company_id) AS invested_companies
            FROM company_investment ci
            WHERE ci.user_group_id = :userGroupId
        ';

        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'userGroupId' => $userGroup->getId(),
        ])->fetchOne();

        return $result !== null ? (int) $result : 0;
    }

    /**
     * @param UserGroup $userGroup
     * @return float
     */
    public function getAverageInvestmentByGroup(UserGroup $userGroup): float
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = '
            SELECT 
                CASE 
                    WHEN COUNT(DISTINCT ci.company_id) = 0 THEN 0
                    ELSE SUM(ci.amount) / COUNT(DISTINCT ci.company_id)
                END AS average_investment
            FROM company_investment ci
            WHERE ci.user_group_id = :userGroupId
        ';

        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'userGroupId' => $userGroup->getId(),
        ])->fetchOne();

        return $result !== null ? (float) $result : 0.0;
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
     * @return float
     */
    public function getTotalInvestmentsByGroup(UserGroup $userGroup): float
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = '
            SELECT SUM(ci.amount) AS total
            FROM company_investment ci
            WHERE ci.user_group_id = :userGroupId
        ';

        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery([
            'userGroupId' => $userGroup->getId(),
        ])->fetchOne();

        return $result !== null ? (float) $result : 0.0;
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
                'name' => 'Revenus par période',
                'description' => 'Analyse des KPI de revenus (Revenu Annuel Récurrent) par période',
                'query' => 'monthly_revenue'
            ],
            [
                'id' => '2',
                'name' => 'Portefeuille par secteur',
                'description' => 'Répartition des entreprises du portefeuille par secteur d\'activité',
                'query' => 'clients_by_sector'
            ],
            [
                'id' => '3',
                'name' => 'Évolution Argent brûlé',
                'description' => 'Analyse de l\'évolution de l\'argent brûlé par période - métrique clé de performance',
                'query' => 'burn_rate_evolution'
            ],
            [
                'id' => '4',
                'name' => 'Top investissements',
                'description' => 'Classement des 10 entreprises avec les plus gros investissements',
                'query' => 'top_clients'
            ],
            [
                'id' => '5',
                'name' => 'Évolution nombre d\'employés',
                'description' => 'Suivi de l\'évolution du nombre d\'employés des entreprises du portefeuille',
                'query' => 'headcount'
            ],
            [
                'id' => '6',
                'name' => 'Investissements trimestriels',
                'description' => 'Montants investis par trimestre avec types de financement',
                'query' => 'quarterly_investments'
            ],
            [
                'id' => '7',
                'name' => 'Synthèse investissements',
                'description' => 'Vue d\'ensemble des montants totaux investis par type de financement',
                'query' => 'total_investment'
            ],
            [
                'id' => '8',
                'name' => 'Analyse KPI globale',
                'description' => 'Vue d\'ensemble de tous les KPI disponibles avec métriques par période',
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
                // Revenus par période - basés sur les KPI de revenus réels
                $sql = "
                    SELECT 
                        CONCAT(d.year, '-', k.period) as period,
                        k.name as kpi_name,
                        ROUND(k.value::numeric, 2) as revenue,
                        k.unit
                    FROM kpi k
                    INNER JOIN document d ON k.document_id = d.id
                    INNER JOIN company c ON d.company_id = c.id
                    WHERE c.id = :companyId
                    AND k.name IN ('Revenu Annuel Récurrent', 'EBITDA')
                    AND k.value IS NOT NULL
                    ORDER BY d.year DESC, k.period DESC, k.name
                    LIMIT 20;
                ";
                break;

            case 'clients_by_sector':
            case '2':
                // Clients par secteur - basé sur les entreprises dans le portefeuille
                $sql = "
                    SELECT 
                        COALESCE(c.sector, 'Non défini') as sector,
                        COUNT(DISTINCT c.id) as client_count,
                        SUM(ci.amount) as total_invested
                    FROM company c
                    INNER JOIN company_investment ci ON c.id = ci.company_id
                    WHERE ci.amount > 0
                    GROUP BY c.sector
                    HAVING COUNT(DISTINCT c.id) > 0
                    ORDER BY client_count DESC, total_invested DESC;
                ";
                break;

            case 'burn_rate_evolution':
            case '3':
                // Évolution Argent brûlé - basée sur les KPI réels
                $sql = "
                    SELECT 
                        d.year,
                        k.period,
                        CAST(AVG(k.value) AS DECIMAL(15,2)) as argent_brule,
                        k.unit,
                        COUNT(k.id) as nb_metrics
                    FROM kpi k
                    INNER JOIN document d ON k.document_id = d.id
                    INNER JOIN company c ON d.company_id = c.id
                    WHERE c.id = :companyId
                    AND k.name = 'Argent brûlé'
                    AND k.value IS NOT NULL
                    GROUP BY d.year, k.period, k.unit
                    HAVING COUNT(k.id) > 0
                    ORDER BY d.year DESC, k.period DESC
                    LIMIT 8;
                ";
                break;

            case 'top_clients':
            case '4':
                // Top 10 clients - basé sur les investissements réels
                $sql = "
                    SELECT 
                        c.denomination as client_name,
                        c.sector,
                        SUM(ci.amount) as total_investment,
                        COUNT(ci.id) as nb_investments,
                        MAX(ci.invested_at) as last_investment
                    FROM company c
                    INNER JOIN company_investment ci ON c.id = ci.company_id
                    WHERE ci.amount > 0
                    GROUP BY c.id, c.denomination, c.sector
                    HAVING SUM(ci.amount) > 0
                    ORDER BY total_investment DESC
                    LIMIT 10;
                ";
                break;

            case 'headcount':
            case '5':
                // Évolution du nombre d'employés - basée sur les KPI réels
                $sql = "
                    SELECT 
                        CONCAT(d.year, '-', k.period) as period,
                        k.name as kpi_name,
                        ROUND(k.value::numeric, 0) as nombre_employes,
                        k.unit
                    FROM kpi k
                    INNER JOIN document d ON k.document_id = d.id
                    INNER JOIN company c ON d.company_id = c.id
                    WHERE c.id = :companyId
                    AND k.name = 'Nombre d''employés'
                    AND k.value IS NOT NULL
                    ORDER BY d.year DESC, k.period DESC
                    LIMIT 15;
                ";
                break;

            case 'quarterly_investments':
            case '6':
                // Investissements trimestriels - données réelles d'investissement
                $sql = "
                    SELECT 
                        EXTRACT(YEAR FROM ci.invested_at)::INTEGER as year,
                        CONCAT('Q', EXTRACT(QUARTER FROM ci.invested_at)) as quarter,
                        SUM(ci.amount) as investment_value,
                        COUNT(ci.id) as nb_investments,
                        STRING_AGG(DISTINCT ci.funding_type, ', ') as funding_types
                    FROM company_investment ci
                    INNER JOIN company c ON ci.company_id = c.id
                    WHERE c.id = :companyId
                    AND ci.amount > 0
                    GROUP BY year, quarter
                    HAVING SUM(ci.amount) > 0
                    ORDER BY year DESC, quarter DESC
                    LIMIT 8;
                ";
                break;

            case 'total_investment':
            case '7':
                // Total investi - synthèse des investissements
                $sql = "
                    SELECT 
                        'Total Global' as category,
                        SUM(ci.amount) as total_amount,
                        COUNT(ci.id) as nb_investments,
                        MIN(ci.invested_at) as first_investment,
                        MAX(ci.invested_at) as last_investment,
                        STRING_AGG(DISTINCT ci.currency, ', ') as currencies
                    FROM company_investment ci
                    INNER JOIN company c ON ci.company_id = c.id
                    WHERE c.id = :companyId
                    
                    UNION ALL
                    
                    SELECT 
                        COALESCE(ci.funding_type, 'Non défini') as category,
                        SUM(ci.amount) as total_amount,
                        COUNT(ci.id) as nb_investments,
                        MIN(ci.invested_at) as first_investment,
                        MAX(ci.invested_at) as last_investment,
                        STRING_AGG(DISTINCT ci.currency, ', ') as currencies
                    FROM company_investment ci
                    INNER JOIN company c ON ci.company_id = c.id
                    WHERE c.id = :companyId
                    GROUP BY ci.funding_type
                    HAVING SUM(ci.amount) > 0
                    ORDER BY total_amount DESC;
                ";
                break;

            case 'kpi_analysis_by_period':
            case '8':
                // Analyse KPI par période - reproduit EXACTEMENT le format de "Tous les metrics"
                $sql = "
                    WITH kpi_data AS (
                        SELECT 
                            k.name as metric,
                            k.period,
                            k.value,
                            k.unit
                        FROM kpi k
                        INNER JOIN document d ON k.document_id = d.id
                        INNER JOIN company c ON d.company_id = c.id
                        WHERE c.id = :companyId
                        AND k.value IS NOT NULL
                    ),
                    pivoted_data AS (
                        SELECT 
                            metric,
                            unit,
                            -- Utiliser les vraies périodes Q1, Q2, Q3 de votre base
                            MAX(CASE WHEN period = 'Q1' THEN 
                                CASE 
                                    WHEN unit IS NOT NULL AND unit != '' THEN 
                                        REPLACE(TO_CHAR(value, 'FM999,999,999.00'), ',', ' ') || ' ' || unit
                                    ELSE 
                                        REPLACE(TO_CHAR(value, 'FM999,999,999.00'), ',', ' ')
                                END
                            END) as \"Q1\",
                            MAX(CASE WHEN period = 'Q2' THEN 
                                CASE 
                                    WHEN unit IS NOT NULL AND unit != '' THEN 
                                        REPLACE(TO_CHAR(value, 'FM999,999,999.00'), ',', ' ') || ' ' || unit
                                    ELSE 
                                        REPLACE(TO_CHAR(value, 'FM999,999,999.00'), ',', ' ')
                                END
                            END) as \"Q2\",
                            MAX(CASE WHEN period = 'Q3' THEN 
                                CASE 
                                    WHEN unit IS NOT NULL AND unit != '' THEN 
                                        REPLACE(TO_CHAR(value, 'FM999,999,999.00'), ',', ' ') || ' ' || unit
                                    ELSE 
                                        REPLACE(TO_CHAR(value, 'FM999,999,999.00'), ',', ' ')
                                END
                            END) as \"Q3\",
                            MAX(CASE WHEN period = 'Q4' THEN 
                                CASE 
                                    WHEN unit IS NOT NULL AND unit != '' THEN 
                                        REPLACE(TO_CHAR(value, 'FM999,999,999.00'), ',', ' ') || ' ' || unit
                                    ELSE 
                                        REPLACE(TO_CHAR(value, 'FM999,999,999.00'), ',', ' ')
                                END
                            END) as \"Q4\"
                        FROM kpi_data
                        GROUP BY metric, unit
                    )
                    SELECT * FROM pivoted_data
                    WHERE metric IS NOT NULL
                    
                    UNION ALL
                    
                    -- Fallback: si pas de données, retourner au moins un exemple
                    SELECT 
                        'Aucune donnée disponible' as metric,
                        '' as unit,
                        NULL as \"Q1\",
                        NULL as \"Q2\",
                        NULL as \"Q3\",
                        NULL as \"Q4\"
                    WHERE NOT EXISTS (SELECT 1 FROM pivoted_data WHERE metric IS NOT NULL)
                    
                    ORDER BY metric;
                ";
                break;

            default:
                // Requête par défaut - vue d'ensemble des données disponibles
                $sql = "
                    SELECT 
                        'Données disponibles' as category,
                        COUNT(DISTINCT k.id) as nb_kpis,
                        COUNT(DISTINCT d.id) as nb_documents,
                        COUNT(DISTINCT ci.id) as nb_investments,
                        MAX(d.year) as latest_year
                    FROM company c
                    LEFT JOIN document d ON c.id = d.company_id
                    LEFT JOIN kpi k ON d.id = k.document_id
                    LEFT JOIN company_investment ci ON c.id = ci.company_id
                    WHERE c.id = :companyId;
                ";
                break;
        }

        try {
            $result = $conn->executeQuery($sql, [
                'companyId' => $companyId,
                'userGroupId' => $userGroup->getId()
            ])->fetchAllAssociative();

            return $result;
        } catch (\Exception $e) {
            // En cas d'erreur, retourner un tableau vide avec un message d'erreur
            return [
                [
                    'error' => 'Erreur lors de l\'exécution de la requête',
                    'message' => $e->getMessage(),
                    'query_id' => $queryId
                ]
            ];
        }
    }

    /**
     * Récupère tous les investissements d'une entreprise spécifique pour un groupe donné
     *
     * @param int $companyId ID de l'entreprise
     * @param UserGroup $userGroup Groupe utilisateur
     * @return list<array<string, mixed>>
     */
    public function findInvestmentsByCompanyId(int $companyId, UserGroup $userGroup): array
    {
        $qb = $this->createQueryBuilder('ci')
            ->select('ci', 'u', 'c')
            ->leftJoin('ci.user', 'u')
            ->leftJoin('ci.company', 'c')
            ->where('ci.company = :companyId')
            ->andWhere('ci.userGroup = :userGroup')
            ->orderBy('ci.investedAt', 'DESC')
            ->setParameter('companyId', $companyId)
            ->setParameter('userGroup', $userGroup);

        $results = $qb->getQuery()->getResult();

        return array_values(array_map(function ($investment) {
            return [
                'id' => $investment->getId(),
                'amount' => $investment->getAmount(),
                'currency' => $investment->getCurrency(),
                'fundingType' => $investment->getFundingType(),
                'investedAt' => $investment->getInvestedAt()->format('Y-m-d H:i:s'),
                'investor' => [
                    'id' => $investment->getUser()->getId(),
                    'email' => $investment->getUser()->getEmail(),
                    'name' => $investment->getUser()->getName() ?: $investment->getUser()->getEmail()
                ]
            ];
        }, $results));
    }

    /**
     * Met à jour un investissement
     *
     * @param int $investmentId ID de l'investissement
     * @param array<string, mixed> $data Données à mettre à jour
     * @param UserGroup $userGroup Groupe utilisateur
     * @return array<string, mixed>
     */
    public function updateInvestment(int $investmentId, array $data, UserGroup $userGroup): array
    {
        $investment = $this->createQueryBuilder('ci')
            ->where('ci.id = :investmentId')
            ->andWhere('ci.userGroup = :userGroup')
            ->setParameter('investmentId', $investmentId)
            ->setParameter('userGroup', $userGroup)
            ->getQuery()
            ->getOneOrNullResult();

        if (!$investment) {
            throw new \Exception('Investissement non trouvé ou non autorisé');
        }

        $em = $this->getEntityManager();

        // Mise à jour des champs autorisés
        if (isset($data['amount'])) {
            $investment->setAmount((int)$data['amount']);
        }

        if (isset($data['currency'])) {
            $investment->setCurrency($data['currency']);
        }

        if (isset($data['fundingType'])) {
            $investment->setFundingType($data['fundingType']);
        }

        $em->flush();

        return [
            'id' => $investment->getId(),
            'amount' => $investment->getAmount(),
            'currency' => $investment->getCurrency(),
            'fundingType' => $investment->getFundingType(),
            'investedAt' => $investment->getInvestedAt()->format('Y-m-d H:i:s'),
            'investor' => [
                'id' => $investment->getUser()->getId(),
                'email' => $investment->getUser()->getEmail(),
                'name' => $investment->getUser()->getName() ?: $investment->getUser()->getEmail()
            ]
        ];
    }

    /**
     * Supprime un investissement par son ID et tous les documents liés à la compagnie pour le groupe
     *
     * @param int $id ID de l'investissement à supprimer
     * @return array<string, mixed> Résultat de la suppression avec nombre de documents supprimés
     */
    public function deleteInvestmentById(int $id): array
    {
        $investment = $this->find($id);

        if (!$investment) {
            return ['success' => false, 'documentsDeleted' => 0];
        }

        $company = $investment->getCompany();
        $userGroup = $investment->getUserGroup();

        $em = $this->getEntityManager();

        // Compter et supprimer les documents liés à cette compagnie pour ce groupe
        $documentsToDelete = $this->documentRepository->createQueryBuilder('d')
            ->where('d.company = :company')
            ->andWhere('d.userGroup = :userGroup')
            ->setParameter('company', $company)
            ->setParameter('userGroup', $userGroup)
            ->getQuery()
            ->getResult();

        $documentsDeletedCount = count($documentsToDelete);

        // Supprimer les documents
        foreach ($documentsToDelete as $document) {
            $em->remove($document);
        }

        // Supprimer l'investissement
        $em->remove($investment);
        $em->flush();

        return [
            'success' => true,
            'documentsDeleted' => $documentsDeletedCount,
            'companyName' => $company->getDenomination()
        ];
    }

    /**
     * @param UserGroup $userGroup
     * @param int $year
     * @return float
     */
    public function getGrowthRateByGroup(UserGroup $userGroup, int $year = null): float
    {
        $conn = $this->getEntityManager()->getConnection();

        if ($year === null) {
            $year = (int) (new \DateTime())->format('Y');
        }
        $lastYear = $year - 1;

        // Montant total investi année N
        $sqlCurrent = '
            SELECT SUM(ci.amount) 
            FROM company_investment ci
            WHERE ci.user_group_id = :userGroupId
            AND EXTRACT(YEAR FROM ci.invested_at) = :year
        ';
        $current = $conn->prepare($sqlCurrent)->executeQuery([
            'userGroupId' => $userGroup->getId(),
            'year' => $year,
        ])->fetchOne();
        $current = $current ? (float) $current : 0.0;

        // Montant total investi année N-1
        $sqlLast = '
            SELECT SUM(ci.amount) 
            FROM company_investment ci
            WHERE ci.user_group_id = :userGroupId
            AND EXTRACT(YEAR FROM ci.invested_at) = :year
        ';
        $previous = $conn->prepare($sqlLast)->executeQuery([
            'userGroupId' => $userGroup->getId(),
            'year' => $lastYear,
        ])->fetchOne();
        $previous = $previous ? (float) $previous : 0.0;

        if ($previous == 0) {
            return 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }
}
