<?php

namespace App\Controller\Api;

use App\Service\Company\CompanyServiceInterface;
use App\Repository\CompanyRepository;
use App\Repository\KpiRepository;
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
        private readonly KpiRepository $kpiRepository,
        private readonly LoggerInterface $logger
    ) {
    }

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
                    'businessStructures' => $company->getBusinessStructures(),
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

    #[Route('/company/{id}/kpis', name: 'get_company_kpis', methods: ['GET'])]
    public function getCompanyKpis(int $id, Request $request): JsonResponse
    {
        try {
            // Vérifier si l'entreprise existe
            $company = $this->companyRepository->findOneBy(['id' => $id]);
            if (!$company) {
                throw new \Exception('Entreprise non trouvée');
            }

            // Récupérer le paramètre année (optionnel)
            $year = $request->query->get('year');

            // Récupérer les KPI selon l'année spécifiée ou tous
            if ($year) {
                $kpis = $this->kpiRepository->findByCompanyIdAndYear($id, (int)$year);
            } else {
                $kpis = $this->kpiRepository->findByCompanyId($id);
            }

            // Organiser les données par métrique et période
            $organizedData = [];
            foreach ($kpis as $kpi) {
                $metricName = $kpi->getName();
                $period = $kpi->getPeriod();
                $value = $kpi->getValue();
                $unit = $kpi->getUnit();

                if (!isset($organizedData[$metricName])) {
                    $organizedData[$metricName] = [
                        'metric' => $metricName,
                        'unit' => $unit
                    ];
                }

                // Formater la valeur avec l'unité si elle existe
                $formattedValue = $value;
                if ($unit && $value !== null) {
                    $formattedValue = number_format($value, 2, ',', ' ') . ' ' . $unit;
                } elseif ($value !== null) {
                    $formattedValue = number_format($value, 2, ',', ' ');
                }

                $organizedData[$metricName][$period] = $formattedValue;
            }

            // Convertir en tableau indexé pour la réponse
            $result = array_values($organizedData);

            return new JsonResponse($result);
        } catch (\Exception $e) {
            $this->logger->error('Erreur critique dans getCompanyKpis', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'companyId' => $id
            ]);

            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la récupération des KPI'
            ], 400);
        }
    }

    #[Route('/company/{id}/kpis/years', name: 'get_company_kpis_years', methods: ['GET'])]
    public function getCompanyKpisYears(int $id): JsonResponse
    {
        try {
            // Vérifier si l'entreprise existe
            $company = $this->companyRepository->findOneBy(['id' => $id]);
            if (!$company) {
                throw new \Exception('Entreprise non trouvée');
            }

            // Récupérer toutes les années disponibles pour cette entreprise
            $years = $this->kpiRepository->findAvailableYearsByCompanyId($id);

            return new JsonResponse($years);
        } catch (\Exception $e) {
            $this->logger->error('Erreur critique dans getCompanyKpisYears', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'companyId' => $id
            ]);

            return new JsonResponse([
                'error' => $e->getMessage(),
                'details' => 'Une erreur est survenue lors de la récupération des années'
            ], 400);
        }
    }
}
