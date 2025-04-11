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

            // Get KPIs to analyze, periodicity and year
            $kpis = $request->request->get('kpis');
            $periodicity = $request->request->get('periodicity', 'Q');
            $year = $request->request->get('year', date('Y'));
            
            // Decode JSON if needed
            if (is_string($kpis)) {
                $kpis = json_decode($kpis, true);
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

            // Extract text with Textract
            $textractResult = $this->textractService->analyzeDocument($filePath);
            
            // Generate image for OpenAI Vision if possible
            $imageBase64 = null;
            if ($file->getClientOriginalExtension() === 'pdf') {
                $imageBase64 = $this->generateImageFromPdf($filePath);
            }
            
            // Add PDF URL to the result
            $pdfUrl = '/uploads/' . $fileName;

            // Also perform OpenAI KPI analysis if text content is available
            if (isset($textractResult['text']['content']) && is_array($textractResult['text']['content'])) {
                $textContent = implode("\n", $textractResult['text']['content']);
                
                // Get KPI extraction prompt with periodicity, selected KPIs and year
                $prompt = $this->getKpiExtractionPrompt(
                    $textContent, 
                    (string)$periodicity, 
                    $kpis, 
                    (string)$year, 
                    $imageBase64, 
                    $pdfUrl
                );
                
                $kpiAnalysis = $this->openAIService->analyzeKpisWithVision($prompt, $fileName, $imageBase64);
                
                if ($kpiAnalysis['success'] && isset($kpiAnalysis['result'])) {
                    return new JsonResponse([
                        'textractData' => $textractResult,
                        'aiAnalysis' => $kpiAnalysis['result'],
                        'pdfUrl' => $pdfUrl
                    ]);
                }
            }
            
            // Fallback to basic verification if OpenAI analysis fails
            $verificationResult = $this->openAIService->verifyTextractData($textractResult);
            $verificationResult['pdfUrl'] = $pdfUrl;

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
            
            if (!isset($data['textContent']) || empty($data['textContent'])) {
                return new JsonResponse(['error' => 'Contenu textuel invalide ou manquant'], JsonResponse::HTTP_BAD_REQUEST);
            }
            
            $documentId = $data['documentId'] ?? 'unknown';
            $kpis = $data['kpis'] ?? [];
            $periodicity = $data['periodicity'] ?? 'Q';
            $year = $data['year'] ?? date('Y');
            $imageBase64 = $data['imageBase64'] ?? null;
            $pdfUrl = $data['pdfUrl'] ?? null;
            
            // Convert to string if it's an array, otherwise use as is
            $textContent = is_array($data['textContent']) 
                ? implode("\n", $data['textContent']) 
                : $data['textContent'];
            
            // If the request contains pre-extracted TextExtract data, use it directly
            $extractedData = $data['extractedData'] ?? null;
            
            // Generate prompt using PDF as reference but with TextExtract data as input
            $prompt = $this->getKpiExtractionPromptWithExtractedData($textContent, $extractedData, $periodicity, $kpis, $year, $imageBase64);
            
            // Analyze using OpenAI with vision if image is available
            if ($imageBase64) {
                $kpiAnalysis = $this->openAIService->analyzeKpisWithVision($prompt, $documentId, $imageBase64);
            } else {
            $kpiAnalysis = $this->openAIService->analyzeKpis($prompt, $documentId);
            }
            
            return new JsonResponse($kpiAnalysis);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false, 
                'message' => 'Erreur lors de l\'analyse du texte avec OpenAI: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Generate base64 image from PDF for OpenAI Vision
     *
     * @param string $pdfPath
     * @return string|null
     */
    private function generateImageFromPdf(string $pdfPath): ?string
    {
        try {
            // Vérifier si Imagick est disponible
            if (!extension_loaded('imagick')) {
                return null;
            }
            
            // Créer une instance Imagick
            $imagick = new \Imagick();
            
            // Lire la première page du PDF
            $imagick->readImage($pdfPath . '[0]');
            
            // Convertir en PNG
            $imagick->setImageFormat('png');
            
            // Optimiser pour la vision (résolution, qualité)
            $imagick->resizeImage(1500, 0, \Imagick::FILTER_LANCZOS, 1);
            
            // Obtenir l'image en base64
            $base64 = base64_encode($imagick->getImageBlob());
            
            return $base64;
        } catch (\Exception $e) {
            // En cas d'erreur, retourner null
            return null;
        }
    }

    /**
     * Creates a prompt for KPI extraction with pre-extracted data and document content as reference
     * 
     * @param string $textContent The text content of the document
     * @param array<string, mixed>|null $extractedData Pre-extracted data from TextExtract
     * @param string $periodicity Periodicity type ('Q' for quarterly, 'H' for half-yearly)
     * @param array<string>|null $selectedKpis List of KPIs to extract
     * @param string $year The year selected by the user
     * @param string|null $imageBase64 Base64 encoded image of the document (optional)
     * @return string The prompt for OpenAI
     */
    private function getKpiExtractionPromptWithExtractedData(
        string $textContent, 
        ?array $extractedData = null, 
        string $periodicity = 'Q', 
        ?array $selectedKpis = null, 
        string $year = '2023',
        ?string $imageBase64 = null
    ): string {
        $kpiMappings = [
            'chiffre_affaire' => ["Chiffre d'affaire", "Revenue", "Sales", "Turnover", "Net Bookings"],
            'marge_brute' => ["Marge brute", "Gross Margin", "Gross Profit"],
            'cout_acquisition' => ["Coût d'acquisition du client", "Customer Acquisition Cost", "CAC", "CAC Ratio", "Cost of Acquisition"],
            'valeur_vie_client' => ["Valeur à vie client", "Customer Lifetime Value", "LTV"],
            'nombre_employe' => ["Nombre employé", "Employee Count", "Headcount", "Staff"],
            'argent_brule' => ["Argent brûlé", "Cash Burn", "Burn Rate"],
            'ebitda' => ["EBITDA"],
            'revenu_annuel' => ["Revenu Annuel Récurrent", "Annual Recurring Revenue", "ARR", "Net ARR", "ARR base"],
            'revenu_mensuel' => ["Revenu Mensuel Récurrent", "Monthly Recurring Revenue", "MRR"],
            'montant_leve' => ["Montant levé", "Funding Amount", "Raised", "Funds Raised"],
        ];
        
        // Filter to only include selected KPIs if specified
        if ($selectedKpis && !empty($selectedKpis)) {
            $filteredKpiMappings = [];
            foreach ($selectedKpis as $kpiKey) {
                if (isset($kpiMappings[$kpiKey])) {
                    $filteredKpiMappings[$kpiKey] = $kpiMappings[$kpiKey];
                }
            }
            $kpiMappings = $filteredKpiMappings;
        }
        
        // Build the KPIs list for the prompt
        $kpiList = "";
        foreach ($kpiMappings as $key => $labels) {
            $kpiList .= "- " . implode(" / ", $labels) . "\n";
        }
        
        $periodsToDetect = $periodicity === 'Q' 
            ? '["Q1", "Q2", "Q3", "Q4"]' 
            : '["H1", "H2"]';
        
        $basePrompt = "
        Tu es un assistant financier intelligent spécialisé dans l'extraction de données depuis des bilans d'entreprise.

        📄 Tu vas recevoir un document contenant un tableau de KPI financiers trimestriels ou semestriels. Ta mission est de reconstruire un tableau structuré par KPI et période, en nettoyant les colonnes non pertinentes et en mappant les noms anglais/français vers des libellés standards.

        🧩 KPI à extraire si disponibles :
        $kpiList

        🗓 L'année du bilan est : $year  
        🗂 IMPORTANT: Ignorer TOUTES les colonnes suivantes : \"Fcst\", \"Forecast\", \"Better/Worse\", \"B/W\", \"YTD\", \"Budget\", \"Var\", \"Variation\", ou autres comparateurs.
        🔍 NE PRENDRE EN COMPTE QUE les colonnes qui correspondent aux périodes demandées : $periodsToDetect.

        🎯 Résultat attendu :
        - Un tableau structuré avec :
          - lignes = KPI
          - colonnes = périodes ($periodsToDetect)
          - valeurs = montant + unité (ex. \"0.4m EUR\")
        - Si une valeur est manquante ou introuvable : `\"N.A\"`

        🧠 Règles importantes :
        - Le tableau peut être en anglais ou en français
        - Les KPI peuvent être mal orthographiés ou avec des symboles, sois tolérant
        - NE JAMAIS inventer de valeur
        - NE JAMAIS ajouter un signe '+' ou '-' si absent du document original
        - S'assurer que chaque valeur est correctement alignée avec sa période
        - Ne pas recopier une valeur d'une colonne à une autre si manquante
        - NE JAMAIS prendre des valeurs dans des colonnes non demandées (Fcst, Budget, etc.)

        🔁 Format de réponse JSON attendu :
        {
          \"year\": \"$year\",
          \"language\": \"fr\" | \"en\",
          \"periodicity\": \"$periodicity\",
          \"periods\": $periodsToDetect,
          \"kpi\": {
            \"EBITDA\": {
              \"" . $periodicity . "1\": \"-2.1m EUR\",
              \"" . $periodicity . "2\": \"-1.1m EUR\",
              \"" . $periodicity . "3\": \"0.4m EUR\",
              \"" . $periodicity . "4\": \"0.1m EUR\"
            },
            \"Revenu Annuel Récurrent (ARR)\": {
              \"" . $periodicity . "1\": \"4.8m EUR\",
              \"" . $periodicity . "2\": \"2.7m EUR\",
              \"" . $periodicity . "3\": \"1.2m EUR\",
              \"" . $periodicity . "4\": \"N.A\"
            }
          }
        }
        ";
        
        // If we have pre-extracted data, include it
        if ($extractedData) {
            $extractedDataJson = json_encode($extractedData, JSON_PRETTY_PRINT);
            $basePrompt .= "
            \n\nVoici les données pré-extraites par Textract, qui peuvent contenir des erreurs d'alignement ou d'interprétation:
            {$extractedDataJson}
            ";
        }
        
        // Add the textract content
        $basePrompt .= "
        \n\nVoici le texte brut extrait du document (peut contenir des erreurs d'alignement):
        {$textContent}
        ";
        
        return $basePrompt;
    }

    /**
     * Creates a prompt for KPI extraction from document content
     * 
     * @param string $textContent The text content of the document
     * @param string $periodicity Periodicity type ('Q' for quarterly, 'H' for half-yearly)
     * @param array<string>|null $selectedKpis List of KPIs to extract
     * @param string $year The year selected by the user
     * @param string|null $imageBase64 Base64 encoded image of the document (optional)
     * @param string|null $pdfUrl URL of the PDF document (optional)
     * @return string The prompt for OpenAI
     */
    private function getKpiExtractionPrompt(
        string $textContent, 
        string $periodicity = 'Q', 
        ?array $selectedKpis = null, 
        string $year = '2023',
        ?string $imageBase64 = null,
        ?string $pdfUrl = null
    ): string {
        return $this->getKpiExtractionPromptWithExtractedData($textContent, null, $periodicity, $selectedKpis, $year, $imageBase64);
    }
}
