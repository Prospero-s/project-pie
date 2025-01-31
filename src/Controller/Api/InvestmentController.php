<?php

namespace App\Controller\Api;

use App\Repository\CompanyRepository;
use App\Entity\CompanyInvestment;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\DBAL\Connection;

#[Route('/api', name: 'api_')]
class InvestmentController extends AbstractController
{
    private $companyRepository;
    private EntityManagerInterface $entityManager;
    private Connection $connection;

    public function __construct(
        CompanyRepository $companyRepository, 
        EntityManagerInterface $entityManager,
        Connection $connection
    ) {
        $this->companyRepository = $companyRepository;
        $this->entityManager = $entityManager;
        $this->connection = $connection;
    }

    #[Route('/investments/chart-data', name: 'chart_data', methods: ['GET'], priority: 2)]
    public function getChartData(Request $request): JsonResponse
    {
        try {
            $sql = "
                SELECT 
                    ci.amount,
                    ci.funding_type as fundingType,
                    ci.invested_at as investedAt,
                    ci.currency,
                    c.id as company_id,
                    c.denomination as company_name
                FROM company_investment ci
                JOIN company c ON ci.company_id = c.id
                WHERE ci.invested_at IS NOT NULL
                ORDER BY ci.invested_at ASC
            ";

            $stmt = $this->connection->executeQuery($sql);
            $investments = $stmt->fetchAllAssociative();

            if (empty($investments)) {
                return new JsonResponse([]);
            }

            $formattedInvestments = array_map(function($investment) {
                return [
                    'amount' => (int)$investment['amount'],
                    'fundingType' => $investment['fundingtype'],
                    'investedAt' => $investment['investedat'],
                    'currency' => $investment['currency'],
                    'companyId' => $investment['company_id'],
                    'companyName' => $investment['company_name']
                ];
            }, $investments);

            return new JsonResponse($formattedInvestments);
        } catch (\Exception $e) {
            // Log l'erreur pour le débogage
            error_log("Erreur dans getChartData: " . $e->getMessage());
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des données',
                'message' => $e->getMessage()
            ], 200);
        }
    }

    #[Route('/investments/{id}', name: 'get_investment', methods: ['GET'], priority: 1)]
    public function getInvestment(Request $request, int $id): JsonResponse
    {
        try {
            $sql = "
                SELECT 
                    ci.id,
                    ci.amount,
                    ci.funding_type,
                    ci.invested_at,
                    c.denomination,
                    c.id as company_id
                FROM company_investment ci
                JOIN company c ON ci.company_id = c.id
                WHERE ci.id = :id
            ";

            $result = $this->connection->executeQuery($sql, [
                'id' => $id
            ])->fetchAssociative();

            if (!$result) {
                return new JsonResponse(['error' => 'Investment not found'], 404);
            }

            $data = [
                'id' => $result['id'],
                'amount' => (int)$result['amount'],
                'company' => [
                    'id' => $result['company_id'],
                    'denomination' => $result['denomination']
                ],
                'investment' => [
                    'amount' => (int)$result['amount'],
                    'fundingType' => $result['funding_type'],
                    'investedAt' => $result['invested_at']
                ]
            ];

            return new JsonResponse($data);
        } catch (\Exception $e) {
            // Log l'erreur pour le débogage
            error_log("Erreur dans getInvestment: " . $e->getMessage());
            return new JsonResponse([
                'error' => 'Erreur lors de la récupération des données',
                'message' => $e->getMessage()
            ], 200);
        }
    }

    #[Route('/investments', name: 'get_investments', methods: ['GET'], priority: 1)]
    public function getInvestments(Request $request, CompanyRepository $companyRepository): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            if (!$cognitoId) {
                throw new \Exception('Utilisateur non authentifié');
            }

            // Récupérer les paramètres de pagination et tri
            $page = $request->query->getInt('page', 1);
            $limit = $request->query->getInt('limit', 10);
            $sortField = $request->query->get('sortField', 'updatedAt');
            $sortOrder = $request->query->get('sortOrder', 'desc');

            // Récupérer les filtres
            $filters = [];
            if ($request->query->has('sector')) {
                $filters['sector'] = explode(',', $request->query->get('sector'));
            }
            if ($request->query->has('fundingType')) {
                $filters['fundingType'] = explode(',', $request->query->get('fundingType'));
            }

            $result = $companyRepository->findByFiltersWithPagination(
                $filters,
                $cognitoId,
                $page,
                $limit,
                $sortField,
                $sortOrder
            );

            return new JsonResponse($result);
        } catch (\Exception $e) {
            // Log l'erreur pour le débogage
            error_log("Erreur dans getInvestments: " . $e->getMessage());
            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la récupération des investissements'
            ], 200);
        }
    }
} 