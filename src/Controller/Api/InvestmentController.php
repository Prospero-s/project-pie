<?php

namespace App\Controller\Api;

use App\Repository\CompanyRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class InvestmentController extends AbstractController
{
    #[Route('/investments', name: 'get_investments', methods: ['GET'])]
    public function getInvestments(Request $request, CompanyRepository $companyRepository): JsonResponse
    {
        // Initialiser $filters comme un tableau vide
        $filters = [];
        
        // Récupérer les paramètres de filtrage
        if ($request->query->get('sector')) {
            $filters['sector'] = explode(',', $request->query->get('sector'));
        }
        if ($request->query->get('fundingType')) {
            $filters['fundingType'] = explode(',', $request->query->get('fundingType'));
        }

        // Récupérer les paramètres de pagination
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $sortField = $request->query->get('sortField', 'updatedAt');
        $sortOrder = $request->query->get('sortOrder', 'desc');
        
        // Validation du sortOrder
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';
        
        // Validation du sortField
        $allowedFields = ['denomination', 'sector', 'amount', 'fundingType', 'updatedAt'];
        $sortField = in_array($sortField, $allowedFields) ? $sortField : 'updatedAt';

        $result = $companyRepository->findByFiltersWithPagination(
            $filters,
            $page,
            $limit,
            $sortField,
            $sortOrder
        );

        return new JsonResponse($result);
    }
} 