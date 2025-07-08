<?php

namespace App\Controller\Api;

use App\Repository\CompanyInvestmentRepository;
use App\Repository\CompanyRepository;
use App\Repository\UserRepository;
use App\Repository\EventLogRepository;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class CompanyInvestmentController extends AbstractController
{
    public function __construct(
        private readonly CompanyInvestmentRepository $companyInvestmentRepository,
        private readonly UserRepository $userRepository,
        private readonly EventLogRepository $eventLogRepository,
    ) {
    }

    #[Route('/investments', name: 'get_investments', methods: ['GET'])]
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
            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la récupération des investissements'
            ], 400);
        }
    }

    #[Route('/investments/global', methods: ['GET'])]
    public function getGlobalInvestments(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
            if (!$cognitoId || !$user) {
                throw new \Exception('Utilisateur non authentifié ou non trouvé');
            }

            $globalInvestments = $this->companyInvestmentRepository->fetchGlobalInvestments($user->getUserGroup());

            return new JsonResponse($globalInvestments);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la récupération des investissements globaux'
            ], 400);
        }
    }

    #[Route('/investments/global/funding', methods: ['GET'])]
    public function getGlobalFundingInvestments(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
            if (!$cognitoId || !$user) {
                throw new \Exception('Utilisateur non authentifié ou non trouvé');
            }

            $fundingInvestments = $this->companyInvestmentRepository->fetchGlobalFundingInvestments(
                $user->getUserGroup()
            );

            return new JsonResponse($fundingInvestments);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la récupération des investissements par type'
            ], 400);
        }
    }

    #[Route('/investments/global/sector', methods: ['GET'])]
    public function getGlobalSectorInvestments(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
            if (!$cognitoId || !$user) {
                throw new \Exception('Utilisateur non authentifié ou non trouvé');
            }

            $sectorInvestments = $this->companyInvestmentRepository->fetchGlobalSectorInvestments(
                $user->getUserGroup()
            );

            return new JsonResponse($sectorInvestments);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la récupération des investissements par secteur'
            ], 400);
        }
    }

    #[Route('/investments/{id}/{year}', methods: ['GET'])]
    public function findByCompanyIdAndYear(Request $request, int $id, int $year): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
            if (!$cognitoId || !$user) {
                throw new \Exception('Utilisateur non authentifié ou non trouvé');
            }

            $investments = $this->companyInvestmentRepository->findByCompanyIdAndYear(
                $id,
                $year,
                $user->getUserGroup()
            );

            if (empty($investments)) {
                return new JsonResponse([
                    'error' => 'Investment not found',
                    'details' => 'Aucun investissement trouvé pour cette entreprise et cette année'
                ], 404);
            }

            return new JsonResponse($investments);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la récupération des investissements'
            ], 400);
        }
    }

    /**
     * Récupère la liste des requêtes prédéfinies pour l'explorateur de données
     */
    #[Route('/query/predefined', name: 'get_predefined_queries', methods: ['GET'])]
    public function getPredefinedQueries(Request $request): JsonResponse
    {
        try {
            // Récupérer l'ID Cognito depuis les headers
            $cognitoId = $request->headers->get('x-cognito-id');

            // Log pour le débogage
            if (!$cognitoId) {
                return new JsonResponse([
                    'error' => 'Utilisateur non authentifié',
                    'details' => 'L\'en-tête x-cognito-id est manquant ou vide'
                ], 401);
            }

            // Chercher l'utilisateur par son ID Cognito
            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
            if (!$user) {
                return new JsonResponse([
                    'error' => 'Utilisateur non trouvé',
                    'details' => 'Aucun utilisateur trouvé avec cet identifiant Cognito'
                ], 401);
            }

            $queries = $this->companyInvestmentRepository->getPredefinedQueries();

            return new JsonResponse([
                'queries' => $queries
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la récupération des requêtes prédéfinies'
            ], 400);
        }
    }

    /**
     * Exécute une requête prédéfinie en fonction de son ID
     */
    #[Route('/query/execute', name: 'execute_query', methods: ['POST'])]
    public function executeQuery(Request $request): JsonResponse
    {
        try {
            // Récupérer l'ID Cognito depuis les headers
            $cognitoId = $request->headers->get('x-cognito-id');

            // Log pour le débogage
            if (!$cognitoId) {
                return new JsonResponse([
                    'error' => 'Utilisateur non authentifié',
                    'details' => 'L\'en-tête x-cognito-id est manquant ou vide'
                ], 401);
            }

            // Chercher l'utilisateur par son ID Cognito
            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
            if (!$user) {
                return new JsonResponse([
                    'error' => 'Utilisateur non trouvé',
                    'details' => 'Aucun utilisateur trouvé avec cet identifiant Cognito'
                ], 401);
            }

            $data = json_decode($request->getContent(), true);

            if (!isset($data['queryId'])) {
                return new JsonResponse([
                    'error' => 'Identifiant de requête manquant',
                    'details' => 'Le paramètre queryId est requis'
                ], 400);
            }

            if (!isset($data['companyId'])) {
                return new JsonResponse([
                    'error' => 'Identifiant d\'entreprise manquant',
                    'details' => 'Le paramètre companyId est requis'
                ], 400);
            }

            $queryId = $data['queryId'];
            $companyId = (int)$data['companyId'];

            $results = $this->companyInvestmentRepository->executeQueryById(
                $queryId,
                $companyId,
                $user->getUserGroup()
            );

            return new JsonResponse([
                'results' => $results
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de l\'exécution de la requête'
            ], 400);
        }
    }

    #[Route('/investments/delete/{id}', methods: ['DELETE'])]
    public function deleteInvestment(Request $request, int $id): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
            if (!$cognitoId || !$user) {
                throw new \Exception('Utilisateur non authentifié ou non trouvé');
            }

            // Récupérer les informations de l'investissement avant suppression
            $investment = $this->companyInvestmentRepository->find($id);
            if (!$investment) {
                return new JsonResponse([
                    'error' => 'Investissement non trouvé',
                    'details' => 'Aucun investissement trouvé avec cet identifiant'
                ], 404);
            }

            $investmentDetails = [
                'company_name' => $investment->getCompany()->getDenomination(),
                'amount' => $investment->getAmount(),
                'currency' => $investment->getCurrency(),
                'funding_type' => $investment->getFundingType()
            ];

            $result = $this->companyInvestmentRepository->deleteInvestmentById($id);

            if (!$result['success']) {
                return new JsonResponse([
                    'error' => 'Investissement non trouvé',
                    'details' => 'Aucun investissement trouvé avec cet identifiant'
                ], 404);
            }

            // Enregistrer l'événement de suppression
            $this->eventLogRepository->logInvestmentDeletion(
                $user->getUserGroup()->getId(),
                $user->getEmail(),
                $investmentDetails
            );

            $message = 'Investissement supprimé avec succès';
            if ($result['documentsDeleted'] > 0) {
                $message .= sprintf(' (%d document(s) associé(s) également supprimé(s))', $result['documentsDeleted']);
            }

            return new JsonResponse([
                'message' => $message,
                'documentsDeleted' => $result['documentsDeleted'],
                'companyName' => $result['companyName']
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la suppression de l\'investissement'
            ], 400);
        }
    }

    #[Route('/dashboard/stats', name: 'get_dashboard_stats', methods: ['GET'])]
    public function stats(
        Request $request,
        CompanyInvestmentRepository $CompanyInvestmentRepository,
    ): JsonResponse {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
            if (!$cognitoId || !$user) {
                throw new \Exception('Utilisateur non authentifié ou non trouvé');
            }

            $totalInvestments = $CompanyInvestmentRepository->getTotalInvestmentsByGroup(
                $user->getUserGroup()
            ); // ex: 123.45 (en M€)
            $companiesCount = $CompanyInvestmentRepository->countInvestedCompaniesByGroup(
                $user->getUserGroup()
            );
            $averageInvestment = $CompanyInvestmentRepository->getAverageInvestmentByGroup(
                $user->getUserGroup()
            ); // ex: 10.29 (en K€)
            $growthRate = $CompanyInvestmentRepository->getGrowthRateByGroup(
                $user->getUserGroup()
            ); // ex: 8.2

            return new JsonResponse([
                'totalInvestments' => $totalInvestments,
                'companiesCount' => $companiesCount,
                'averageInvestment' => round($averageInvestment, 2),
                'growthRate' => $growthRate,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la récupération des investissements globaux'
            ], 400);
        }
    }
}
