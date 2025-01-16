<?php

namespace App\Controller\Api;

use App\Service\AwsTextractService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class TextractController extends AbstractController
{
    private AwsTextractService $textractService;

    public function __construct(AwsTextractService $textractService)
    {
        $this->textractService = $textractService;
    } 

    #[Route('/textract/analyze', name: 'app_textract_analyze', methods: ['POST'])]
    public function uploadFileKpi(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('X-Cognito-Id');
            if (!$cognitoId) {
                throw new \Exception('Utilisateur non authentifié');
            }
    
            $file = $request->files->get('document');
            if (!$file) {
                return new JsonResponse(['error' => 'No file uploaded'], JsonResponse::HTTP_BAD_REQUEST);
            }
    
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
    
            $fileName = uniqid('pdf_') . '.' . $file->guessExtension();
            $filePath = $uploadDir . '/' . $fileName;
            $file->move($uploadDir, $fileName);
    
            $result = $this->textractService->analyzeDocument($filePath);
    
            $pdfUrl = '/uploads/' . $fileName;
            $result['pdfUrl'] = $pdfUrl;
    
            return new JsonResponse($result);
        } catch (\RuntimeException $e) {
            return new JsonResponse(['error' => $e->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
