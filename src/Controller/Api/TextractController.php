<?php

namespace App\Controller\Api;

use App\Service\AwsTextractService;
use App\Service\OpenAIService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class TextractController extends AbstractController
{
    private AwsTextractService $textractService;
    private OpenAIService $openAIService;

    public function __construct(AwsTextractService $textractService, OpenAIService $openAIService)
    {
        $this->textractService = $textractService;
        $this->openAIService = $openAIService;
    }

    #[Route('/openai/analyze', name: 'openai_analyze', methods: ['POST'])]
    public function analyzeWithOpenAI(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('X-Cognito-Id');
            if (!$cognitoId) {
                throw new \Exception('Utilisateur non authentifié');
            }

            $data = json_decode($request->getContent(), true);
            
            if (!isset($data['prompt']) || !is_string($data['prompt'])) {
                return new JsonResponse(['error' => 'Prompt invalide ou manquant'], JsonResponse::HTTP_BAD_REQUEST);
            }
            
            $documentId = $data['documentId'] ?? 'unknown';
            
            // Call OpenAI service to analyze the document and extract KPIs
            $analysisResult = $this->openAIService->analyzeKpis($data['prompt'], $documentId);
            
            return new JsonResponse($analysisResult);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false, 
                'message' => 'Erreur lors de l\'analyse avec OpenAI: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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

            $projectDir = $this->getParameter('kernel.project_dir');

            if (!is_string($projectDir)) {
                throw new \UnexpectedValueException('The "kernel.project_dir" parameter must be a string.');
            }

            $uploadDir = $projectDir . '/public/uploads';

            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileName = uniqid('pdf_') . '.' . $file->guessExtension();
            $filePath = $uploadDir . '/' . $fileName;
            $file->move($uploadDir, $fileName);

            $textractResult = $this->textractService->analyzeDocument($filePath);
            
            // Perform OpenAI verification on the extracted text
            $verificationResult = $this->openAIService->verifyTextractData($textractResult);
            
            // Add PDF URL to the result
            $pdfUrl = '/uploads/' . $fileName;
            $verificationResult['pdfUrl'] = $pdfUrl;

            // Also perform OpenAI KPI analysis if text content is available
            if (isset($textractResult['text']['content']) && is_array($textractResult['text']['content'])) {
                $textContent = implode("\n", $textractResult['text']['content']);
                
                // Build prompt for KPI extraction
                $prompt = "
                Je suis un document financier ou business plan contenant potentiellement les KPIs suivants. 
                Extrais et formate ces KPIs à partir de mon contenu. Si un KPI n'est pas présent, indique \"N.A\".
                Prends en compte à la fois les termes français et anglais (indiqués entre parenthèses).
                
                KPIs à extraire:
                - Chiffre d'affaire (Revenue, Sales, Turnover)
                - Marge brute (Gross Margin, Gross Profit)
                - Coût d'acquisition du client (CAC, Cost of Acquisition, CAC Ratio)
                - Valeur à vie client (Lifetime Value, LTV)
                - Nombre employé (Headcount, Employees)
                - Argent brulé (Burn, Cash Burn, Burn Rate)
                - Ebitda (EBITDA)
                - Revenu Annuel Récurrent (ARR, Annual Recurring Revenue)
                - Revenu Mensuel Récurrent (MRR, Monthly Recurring Revenue)
                - Montant levé (Funding, Raised)
                
                Document:
                {$textContent}
                
                Réponds uniquement avec un objet JSON contenant les valeurs extraites, par exemple:
                {
                  \"chiffre_affaire\": \"1000000€\",
                  \"marge_brute\": \"500000€\",
                  \"cout_acquisition\": \"200€\",
                  ...
                }
                ";
                
                $kpiAnalysis = $this->openAIService->analyzeKpis($prompt, $fileName);
                
                if ($kpiAnalysis['success'] && isset($kpiAnalysis['result'])) {
                    $verificationResult['aiAnalysis'] = $kpiAnalysis['result'];
                }
            }

            return new JsonResponse($verificationResult);
        } catch (\RuntimeException $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
