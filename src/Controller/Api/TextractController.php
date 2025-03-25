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
                
                // Get KPI extraction prompt
                $prompt = $this->getKpiExtractionPrompt($textContent);
                
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

    #[Route('/textract/analyze-text', name: 'app_textract_analyze_text', methods: ['POST'])]
    public function analyzeTextContent(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('X-Cognito-Id');
            if (!$cognitoId) {
                throw new \Exception('Utilisateur non authentifié');
            }

            $data = json_decode($request->getContent(), true);
            
            if (!isset($data['textContent']) || !is_array($data['textContent'])) {
                return new JsonResponse(['error' => 'Contenu textuel invalide ou manquant'], JsonResponse::HTTP_BAD_REQUEST);
            }
            
            $documentId = $data['documentId'] ?? 'unknown';
            $textContent = implode("\n", $data['textContent']);
            
            // Get KPI extraction prompt
            $prompt = $this->getKpiExtractionPrompt($textContent);
            
            $kpiAnalysis = $this->openAIService->analyzeKpis($prompt, $documentId);
            
            return new JsonResponse($kpiAnalysis);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false, 
                'message' => 'Erreur lors de l\'analyse du texte avec OpenAI: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Creates a prompt for KPI extraction from document content
     */
    private function getKpiExtractionPrompt(string $textContent): string
    {
        return "
        I am a financial document or business plan that may contain the following KPIs.
        First, determine if I am written in English or French, then extract and format these KPIs from my content.
        If a KPI is not present, indicate \"N.A\".
        
        KPIs to extract (English / French):
        - Revenue / Chiffre d'affaire (Also: Sales, Turnover)
        - Gross Margin / Marge brute (Also: Gross Profit)
        - Customer Acquisition Cost / Coût d'acquisition du client (Also: CAC, CAC Ratio)
        - Customer Lifetime Value / Valeur à vie client (Also: LTV)
        - Employee Count / Nombre employé (Also: Headcount)
        - Cash Burn / Argent brulé (Also: Burn Rate)
        - EBITDA / EBITDA
        - Annual Recurring Revenue / Revenu Annuel Récurrent (Also: ARR)
        - Monthly Recurring Revenue / Revenu Mensuel Récurrent (Also: MRR)
        - Funding Amount / Montant levé (Also: Raised)
        
        Document:
        {$textContent}
        
        Respond only with a JSON object containing the extracted values, for example:
        {
          \"chiffre_affaire\": \"1000000€\",
          \"marge_brute\": \"500000€\",
          \"cout_acquisition\": \"200€\",
          ...
        }
        
        Use the French field names in the JSON response regardless of document language.
        ";
    }
}
