<?php

namespace App\Controller\Api;

use App\Service\Enterprise\EnterpriseServiceInterface;
use App\Repository\EnterpriseRepository;
use App\Repository\EnterpriseInvestmentRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Psr\Log\LoggerInterface;

#[Route('/api', name: 'api_')]
class EnterpriseController extends AbstractController
{
    public function __construct(
        private readonly EnterpriseServiceInterface $enterpriseService,
        private readonly EnterpriseRepository $enterpriseRepository,
        private readonly LoggerInterface $logger
    ) {}

    #[Route('/enterprise/{siren}', name: 'get_enterprise', methods: ['GET'])]
    public function getEnterpriseDetails(string $siren, Request $request): JsonResponse
    {
        $this->logger->info('Début de la requête getEnterpriseDetails', [
            'siren' => $siren,
            'ip' => $request->getClientIp(),
            'mode' => $request->query->get('mode')
        ]);

        try {
            $mode = $request->query->get('mode');
            $forceScraping = $mode === 'scraping';
            
            $enterpriseData = $this->enterpriseService->getEnterpriseData($siren, $forceScraping);
            
            return new JsonResponse($enterpriseData);

        } catch (\Exception $e) {
            $this->logger->error('Erreur critique dans getEnterpriseDetails', [
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

    #[Route('/enterprise/save', name: 'app_api_enterprise_save', methods: ['POST'])]
    public function saveEnterprise(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $this->logger->info('Données reçues:', ['data' => $data]);
            
            if (!$data) {
                throw new \Exception('Données JSON invalides');
            }

            $cognitoId = $request->headers->get('X-Cognito-Id');
            if (!$cognitoId) {
                throw new \Exception('Utilisateur non authentifié');
            }

            $result = $this->enterpriseRepository->saveEnterprise($cognitoId, $data);
            
            return new JsonResponse($result);

        } catch (\Exception $e) {
            $this->logger->error('Erreur critique dans saveEnterprise', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return new JsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 400);
        }
    }
} 