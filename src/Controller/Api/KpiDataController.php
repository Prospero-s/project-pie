<?php

namespace App\Controller\Api;

use App\Entity\KpiData;
use App\Enum\KpiStatus;
use App\Repository\CompanyRepository;
use App\Repository\KpiDataRepository;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/api', name: 'api_')]
class KpiDataController extends AbstractController
{
    private KpiDataRepository $kpiDataRepository;
    private CompanyRepository $companyRepository;
    private UserRepository $userRepository;

    public function __construct(KpiDataRepository $kpiDataRepository, CompanyRepository $companyRepository, UserRepository $userRepository)
    {
        $this->kpiDataRepository = $kpiDataRepository;
        $this->companyRepository = $companyRepository;
        $this->userRepository = $userRepository;
    }

    #[Route('/kpi/save', name: 'app_api_save_kpi', methods: ['POST'])]
    public function saveKpi(Request $request): JsonResponse
    {
        $cognitoId = $request->headers->get('X-Cognito-Id');
        $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
        if (!$cognitoId || !$user) {
            throw new \Exception('Utilisateur non authentifié');
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['companyId']) || !isset($data['text'])) {
            return new JsonResponse(['error' => 'Missing companyId or text data'], 400);
        }

        $company = $this->companyRepository->find($data['companyId']);

        if (!$company) {
            return new JsonResponse(['error' => 'Company not found'], 404);
        }

        try {
            $kpiData = $this->kpiDataRepository->saveKpi($company, $data, $user);

            return new JsonResponse([
                'message' => 'Enregistré avec succès',
                'kpiId' => $kpiData->getId(),
                'company' => $company->getDenomination(),
            ], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/kpi/draft', name: 'app_api_save_kpi_draft', methods: ['POST'])]
    public function saveDraft(Request $request): JsonResponse
    {
        $cognitoId = $request->headers->get('X-Cognito-Id');
        $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
        if (!$cognitoId || !$user) {
            throw new \Exception('Utilisateur non authentifié');
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['companyId']) || !isset($data['text'])) {
            return new JsonResponse(['error' => 'Missing companyId or text data'], 400);
        }

        $company = $this->companyRepository->find($data['companyId']);

        if (!$company) {
            return new JsonResponse(['error' => 'Company not found'], 404);
        }

        try {
            $kpiData = $this->kpiDataRepository->saveDraftKpi($company, $data, $user);

            return new JsonResponse([
                'message' => 'Brouillon enregistré avec succès',
                'kpiId' => $kpiData->getId(),
                'company' => $company->getDenomination(),
            ], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/kpi/updateDocument/{id}', name: 'app_api_update_document', methods: ['PUT'])]
    public function updateDocument(int $id, Request $request): JsonResponse
    {
        $kpiData = $this->kpiDataRepository->find($id);

        if (!$kpiData) {
            return new JsonResponse(['message' => 'Document non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['kpi'])) {
            return new JsonResponse(['message' => 'Données invalides'], 400);
        }

        // Assurer que $data['kpi'] est bien un tableau avant de l'affecter
        $kpiArray = is_array($data['kpi']) ? $data['kpi'] : json_decode($data['kpi'], true);

        if (!is_array($kpiArray)) {
            return new JsonResponse(['error' => 'Invalid KPI format'], 400);
        }

        $this->kpiDataRepository->changeStatus($kpiData, $kpiArray, KpiStatus::PROCESSED->getValue());

        return new JsonResponse(['message' => 'Document mis à jour avec succès']);
    }

    #[Route('/kpi/delete/{id}', name: 'app_api_delete_kpi', methods: ['DELETE'])]
    public function deleteKpi(int $id): JsonResponse
    {
        $kpiData = $this->kpiDataRepository->find($id);

        if (!$kpiData) {
            return new JsonResponse(['message' => 'Document non trouvé'], 404);
        }

        $this->kpiDataRepository->deleteKpi($kpiData);

        return new JsonResponse(['message' => 'Document supprimé avec succès']);
    }

    #[Route('/kpi/getAllKpi', name: 'app_api_list_kpi', methods: ['GET'])]
    public function getAllKpi(Request $request): JsonResponse
    {
        $cognitoId = $request->headers->get('X-Cognito-Id');
        if (!$cognitoId) {
            throw new \Exception('Utilisateur non authentifié');
        }

        $status = $request->query->get('status', null);
        $documents = $status ? $this->kpiDataRepository->findKpiByStatus($status) : array_merge($this->kpiDataRepository->findKpiByStatus('processed'), $this->kpiDataRepository->findKpiByStatus('draft'));

        // Vérification si des documents existent
        if (!$documents) {
            return new JsonResponse(['message' => 'Aucun document trouvé', 'data' => []], 200);
        }

        // Transformation des données pour l'API
        $kpiData = array_map(function (KpiData $kpi) {
            return [
                'id' => $kpi->getId(),
                'company' => $kpi->getCompany()->getDenomination(),
                // @phpstan-ignore-next-line
                'kpi' => is_string($kpi->getKpi()) ? json_decode($kpi->getKpi(), true) : $kpi->getKpi(),                'status' => $kpi->getStatus(),
                'pdfUrl' => $kpi->getPdfUrl(),
                'createdAt' => $kpi->getCreatedAt()?->format('Y-m-d H:i:s'),
            ];
        }, $documents);

        return new JsonResponse(['data' => $kpiData], 200);
    }

    #[Route('/kpi/getDocument/{id}', name: 'get_document', methods: ['GET'])]
    public function getDocument(int $id): JsonResponse
    {
        $document = $this->kpiDataRepository->find($id);

        if (!$document) {
            return new JsonResponse(['error' => 'Document non trouvé'], 404);
        }

        return new JsonResponse([
            'id' => $document->getId(),
            'company' => $document->getCompany() ?? null,
            'kpi' => $document->getKpi(),
            'status' => $document->getStatus(),
            'pdfUrl' => $document->getPdfUrl(),
            'createdAt' => $document->getCreatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }
}
