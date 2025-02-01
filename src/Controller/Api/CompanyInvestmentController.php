<?php

namespace App\Controller\Api;

use App\Repository\CompanyRepository;
use App\Repository\CompanyInvestmentRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class CompanyInvestmentController extends AbstractController
{
    private $companyRepository;
    private $companyInvestmentRepository;

    public function __construct(CompanyRepository $companyRepository, CompanyInvestmentRepository $companyInvestmentRepository)
    {
        $this->companyRepository = $companyRepository;
        $this->companyInvestmentRepository = $companyInvestmentRepository;
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

    #[Route('/investments/{id}/{year}', methods: ['GET'])]
    public function findByCompanyIdAndYear(int $id, int $year): JsonResponse
    {
        try {
            $investments = $this->companyInvestmentRepository->findByCompanyIdAndYear($id, $year);

            if (empty($investments)) {
                return new JsonResponse([
                    'error' => 'Investment not found',
                    'details' => 'Aucun investissement trouvé pour cette entreprise et cette année'
                ], 404);
            }

            

            return new JsonResponse($investments);

        } catch (\Exception $e) {
            // Log plus détaillé pour le debug
            error_log($e->getMessage());
            
            return new JsonResponse([
                'error' => 'Internal server error',
                'debug' => $e->getMessage()
            ], 500);
        }
    }
} 