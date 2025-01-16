<?php

namespace App\Controller\Api;

use App\Entity\KpiData;
use App\Repository\CompanyRepository;
use App\Repository\KpiDataRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/api', name: 'api_')]
class KpiDataController extends AbstractController
{
    #[Route('/kpi/save', name: 'app_save_kpi', methods: ['POST'])]
    public function saveKpi(
        Request $request,
        KpiDataRepository $kpiDataRepository,
        CompanyRepository $companyRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['companyId']) || !isset($data['text'])) {
            return new JsonResponse(['error' => 'Missing companyId or text data'], 400);
        }

        $company = $companyRepository->find($data['companyId']);

        if (!$company) {
            return new JsonResponse(['error' => 'Company not found'], 404);
        }

        try {
            $kpiData = new KpiData();
            $kpiData->setCompany($company);
            $kpiData->setKpi($data['text']);
            $kpiData->setPdfUrl($data['pdfUrl'] ?? null);
            $kpiData->setStatus('processed'); 
            $kpiData->setCreatedAt(new \DateTimeImmutable());
            
            $entityManager->persist($kpiData);
            $entityManager->flush();

            return new JsonResponse([
                'message' => 'Enregistré avec succès',
                'kpiId' => $kpiData->getId(),
                'company' => $company->getDenomination(),
            ], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
            return new JsonResponse($data);
        }
    }

    #[Route('/kpi/draft', name: 'app_save_kpi_draft', methods: ['POST'])]
    public function saveDraft(
        Request $request,
        KpiDataRepository $kpiDataRepository,
        CompanyRepository $companyRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['companyId']) || !isset($data['text'])) {
            return new JsonResponse(['error' => 'Missing companyId or text data'], 400);
        }

        $company = $companyRepository->find($data['companyId']);

        if (!$company) {
            return new JsonResponse(['error' => 'Company not found'], 404);
        }

        try {
            $kpiData = new KpiData();
            $kpiData->setCompany($company);
            $kpiData->setKpi($data['text']);
            $kpiData->setPdfUrl($data['pdfUrl'] ?? null);
            $kpiData->setStatus('draft'); 
            $kpiData->setCreatedAt(new \DateTimeImmutable());
            
            $entityManager->persist($kpiData);
            $entityManager->flush();

            return new JsonResponse([
                'message' => 'Brouillon enregistré avec succès',
                'kpiId' => $kpiData->getId(),
                'company' => $company->getDenomination(),
            ], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
            return new JsonResponse($data);
        }
    }

    #[Route('/kpi/updateDocument/{id}', name: 'update_document', methods: ['PUT'])]
    public function updateDocument(
        $id,
        Request $request,
        KpiDataRepository $kpiDataRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $kpiData = $kpiDataRepository->find($id);

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

        $kpiData->setKpi($kpiArray);
        $kpiData->setStatus('processed');
        $entityManager->persist($kpiData);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Document mis à jour avec succès']);
    }

    #[Route('/kpi/delete/{id}', name: 'delete_kpi', methods: ['DELETE'])]
    public function deleteKpi($id, KpiDataRepository $kpiDataRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $kpiData = $kpiDataRepository->find($id);

        if (!$kpiData) {
            return new JsonResponse(['message' => 'Document non trouvé'], 404);
        }

        $entityManager->remove($kpiData);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Document supprimé avec succès']);
    }

    #[Route('/kpi/getAllKpi', name: 'app_list_kpi', methods: ['GET'])]
    public function getAllKpi(
        Request $request,
        KpiDataRepository $kpiDataRepository
    ): JsonResponse {
        $cognitoId = $request->headers->get('X-Cognito-Id');
        if (!$cognitoId) {
            throw new \Exception('Utilisateur non authentifié');
        }
        $status = $request->query->get('status', null);
        if ($status) {
            $documents = $kpiDataRepository->findKpiByStatus($status);
        } else {
            $documents = array_merge(
                $kpiDataRepository->findKpiByStatus('processed'),
                $kpiDataRepository->findKpiByStatus('draft')
            );
        } 
        // Vérification si des documents existent
        if (!$documents) {
            return new JsonResponse(['message' => 'Aucun document trouvé', 'data' => []], 200);
        }

        // Transformation des données pour l'API
        $kpiData = array_map(function (KpiData $kpi) {
            return [
                'id' => $kpi->getId(),
                'company' => $kpi->getCompany()->getDenomination(),
                'kpi' => is_string($kpi->getKpi()) ? json_decode($kpi->getKpi(), true) : $kpi->getKpi(),                'status' => $kpi->getStatus(),
                'pdfUrl' => $kpi->getPdfUrl(),
                'createdAt' => $kpi->getCreatedAt()?->format('Y-m-d H:i:s'),
            ];
        }, $documents);

        return new JsonResponse(['data' => $kpiData], 200);
    }

    #[Route('/kpi/getDocument/{id}', name: 'get_document', methods: ['GET'])]
    public function getDocument($id, KpiDataRepository $repository): JsonResponse
    {
        $document = $repository->find($id);

        if (!$document) {
            return new JsonResponse(['error' => 'Document non trouvé'], 404);
        }

        return new JsonResponse([
            'id' => $document->getId(),
            'company' => $document->getCompany() ? $document->getCompany() : null,
            'kpi' => is_string($document->getKpi()) ? json_decode($document->getKpi(), true) : $document->getKpi(),                
            'status' => $document->getStatus(),
            'pdfUrl' => $document->getPdfUrl(),
            'status' => $document->getStatus(),
            'createdAt' => $document->getCreatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }
}

