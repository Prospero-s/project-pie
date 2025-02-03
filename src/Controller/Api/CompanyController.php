<?php

namespace App\Controller\Api;

use App\Service\Company\CompanyServiceInterface;
use App\Repository\CompanyRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Psr\Log\LoggerInterface;

#[Route('/api', name: 'api_')]
class CompanyController extends AbstractController
{
    public function __construct(
        private readonly CompanyServiceInterface $companyService,
        private readonly CompanyRepository $companyRepository,
        private readonly LoggerInterface $logger
    ) {}

    #[Route('/company/{siren}', name: 'get_company', methods: ['GET'])]
    public function getCompanyDetails(string $siren, Request $request): JsonResponse
    {
        $this->logger->info('Début de la requête getCompanyDetails', [
            'siren' => $siren,
            'ip' => $request->getClientIp(),
            'mode' => $request->query->get('mode')
        ]);

        try {
            $mode = $request->query->get('mode');
            $forceScraping = $mode === 'scraping';
            
            $companyData = $this->companyService->getCompanyData($siren, $forceScraping);
            
            return new JsonResponse($companyData);

        } catch (\Exception $e) {
            $this->logger->error('Erreur critique dans getCompanyDetails', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'siren' => $siren,
                'class' => get_class($e)
            ]);

            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la récupération des données'
            ], 400);
        }
    }

    #[Route('/company/save', name: 'app_api_company_save', methods: ['POST'])]
    public function saveCompany(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $this->logger->info('Données reçues:', ['data' => $data]);
            
            if (!$data) {
                throw new \Exception('Données JSON invalides');
            }

            $cognitoId = $request->headers->get('X-Cognito-Id');
            $email = $request->headers->get('X-Cognito-Email');

            if (!$cognitoId || !$email) {
                throw new \Exception('Utilisateur non authentifié');
            }

            $result = $this->companyRepository->saveCompany($cognitoId, $email, $data);
            
            return new JsonResponse($result);

        } catch (\Exception $e) {
            $this->logger->error('Erreur critique dans saveCompany', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return new JsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }

    #[Route('/getAllCompanies', name: 'app_get_all_companies', methods: ['GET'])]
    public function getAllCompanies(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('X-Cognito-Id');
            if (!$cognitoId) {
                throw new \Exception('Utilisateur non authentifié');
            }

            $companies = $this->companyRepository->findAll();

            $data = [];
            foreach ($companies as $company) {
                $data[] = [
                    'id' => $company->getId(),
                    'name' => $company->getDenomination(),
                    'sector' => $company->getSector(),
                    'created_at' => $company->getCreatedAt()->format('Y-m-d'),
                ];
            }

            return new JsonResponse($data);
        } catch (\Exception $e) {
            $this->logger->error('Erreur critique dans getAllCompanies', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'class' => get_class($e)
            ]);

            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la récupération des données'
            ], 400);
        }
    }

    #[Route('/company/details/{id}', methods: ['GET'])]
    public function getCompanyDataById(int $id): JsonResponse
    {
        try {
            $company = $this->companyRepository->findOneBy(['id' => $id]);
            if (!$company) {
                throw new \Exception('Entreprise non trouvé');
            }

            return new JsonResponse([
                'id' => $company->getId(),
                'denomination' => $company->getDenomination(),
                'sector' => $company->getSector()
            ], 200);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la récupération des investissements globaux'
            ], 400);
        }
    }
}