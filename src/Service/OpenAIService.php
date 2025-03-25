<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class OpenAIService
{
    private HttpClientInterface $httpClient;
    private string $apiKey;
    private string $model;

    public function __construct(HttpClientInterface $httpClient)
    {
        $this->httpClient = $httpClient;
        $this->apiKey = $_ENV['OPENAI_API_KEY'];
        $this->model = $_ENV['OPENAI_MODEL'] ?? 'gpt-4o';
    }

    /**
     * Analyze document content to extract specific KPIs
     * 
     * @param string $prompt The user prompt with document content
     * @param string $documentId Optional document identifier for logging
     * @return array<string, mixed> The extracted KPIs and analysis
     */
    public function analyzeKpis(string $prompt, string $documentId = 'unknown'): array
    {
        try {
            // Call OpenAI API
            $response = $this->httpClient->request('POST', 'https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => $this->model,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'Tu es un expert en analyse financière qui extrait avec précision les KPIs des documents financiers et business plans. Tu détectes les données comme le chiffre d\'affaire, la marge brute, les coûts d\'acquisition, etc. Réponds uniquement au format JSON structuré.'
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'temperature' => 0.2,
                    'response_format' => ['type' => 'json_object'],
                ],
            ]);
            
            $statusCode = $response->getStatusCode();
            
            if ($statusCode !== 200) {
                // Get more detailed error information
                $errorData = $response->toArray(false);
                $errorMessage = isset($errorData['error']['message']) ? $errorData['error']['message'] : 'Unknown error';
                
                return [
                    'success' => false,
                    'message' => 'OpenAI API error: ' . $statusCode . ' - ' . $errorMessage,
                    'documentId' => $documentId
                ];
            }
            
            $result = $response->toArray();
            $content = $result['choices'][0]['message']['content'] ?? '{}';
            
            // Parse JSON response
            try {
                $kpiData = json_decode($content, true);
                
                if (!is_array($kpiData)) {
                    throw new \Exception('Invalid JSON response');
                }
                
                // Standardize KPI fields to ensure all required fields exist
                $standardizedKpis = $this->standardizeKpiFields($kpiData);
                
                return [
                    'success' => true,
                    'result' => $standardizedKpis,
                    'documentId' => $documentId
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Error parsing KPI data: ' . $e->getMessage(),
                    'documentId' => $documentId
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error during KPI analysis: ' . $e->getMessage(),
                'documentId' => $documentId
            ];
        }
    }

    /**
     * Ensure all required KPI fields exist in the data
     * 
     * @param array<string, mixed> $kpiData The raw KPI data from OpenAI
     * @return array<string, string> The standardized KPI data
     */
    private function standardizeKpiFields(array $kpiData): array
    {
        $requiredFields = [
            'chiffre_affaire',
            'marge_brute',
            'cout_acquisition',
            'valeur_vie_client',
            'nombre_employe',
            'argent_brule',
            'ebitda',
            'revenu_annuel',
            'revenu_mensuel',
            'montant_leve'
        ];
        
        $standardized = [];
        
        foreach ($requiredFields as $field) {
            // Handle different possible field names
            $value = null;
            
            // Check for direct match
            if (isset($kpiData[$field])) {
                $value = $kpiData[$field];
            } 
            // Check for camelCase variation
            elseif (isset($kpiData[lcfirst(str_replace('_', '', ucwords($field, '_')))])) {
                $value = $kpiData[lcfirst(str_replace('_', '', ucwords($field, '_')))];
            }
            // Handle specific field variations
            elseif ($field === 'chiffre_affaire' && isset($kpiData['chiffre_d_affaire'])) {
                $value = $kpiData['chiffre_d_affaire'];
            } elseif ($field === 'revenu_annuel' && isset($kpiData['revenu_annuel_recurrent'])) {
                $value = $kpiData['revenu_annuel_recurrent'];
            } elseif ($field === 'revenu_mensuel' && isset($kpiData['revenu_mensuel_recurrent'])) {
                $value = $kpiData['revenu_mensuel_recurrent'];
            }
            
            // Standardize the value
            if ($value !== null) {
                // Ensure it's a string
                $standardized[$field] = (string)$value;
            } else {
                $standardized[$field] = 'N.A';
            }
        }
        
        return $standardized;
    }

    /**
     * Verify the accuracy of text extracted by AWS Textract
     * 
     * @param array<string, mixed> $textractData The data extracted by AWS Textract
     * @return array<string, mixed> The verification result
     */
    public function verifyTextractData(array $textractData): array
    {
        try {
            $content = [];
            
            // Extract text content from Textract data
            if (isset($textractData['text']['content']) && is_array($textractData['text']['content'])) {
                $content = $textractData['text']['content'];
            }
            
            // If there's no content to verify
            if (empty($content)) {
                return [
                    'verified' => false,
                    'error' => 'No content to verify',
                    'textractData' => $textractData
                ];
            }
            
            $textContent = implode("\n", $content);
            
            // Prepare prompt for OpenAI
            $prompt = "You are an expert financial document validator. Review this text extracted from a financial PDF document and verify its accuracy. The document likely contains financial data, numbers, and economic information that must be precise:\n\n";
            $prompt .= $textContent;
            $prompt .= "\n\nPlease identify any potential errors, especially with numbers, dates, and financial terms. For each potential error, provide the likely correction. If no errors are found, state that the extraction appears accurate. Format your response as JSON with 'verified' (boolean), 'corrections' (array of objects with 'original' and 'corrected' fields), and 'confidence' (number from 0-1).";
            
            // Call OpenAI API
            $response = $this->httpClient->request('POST', 'https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => $this->model,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are an expert financial document validator assistant that helps verify text extracted from PDFs.'
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'temperature' => 0.2,
                ],
            ]);
            
            $statusCode = $response->getStatusCode();
            
            if ($statusCode !== 200) {
                // Get more detailed error information
                $errorData = $response->toArray(false);
                $errorMessage = isset($errorData['error']['message']) ? $errorData['error']['message'] : 'Unknown error';
                
                return [
                    'verified' => false,
                    'error' => 'OpenAI API error: ' . $statusCode . ' - ' . $errorMessage,
                    'textractData' => $textractData
                ];
            }
            
            $result = $response->toArray();
            
            // Try to parse JSON from the content
            try {
                $content = $result['choices'][0]['message']['content'];
                // Try to extract JSON object if present
                if (preg_match('/\{.*\}/s', $content, $matches)) {
                    $jsonContent = $matches[0];
                    $aiResponse = json_decode($jsonContent, true);
                } else {
                    // If no JSON found, create a simple response
                    $aiResponse = [
                        'verified' => false,
                        'corrections' => [],
                        'confidence' => 0,
                        'message' => 'Unable to parse response from AI'
                    ];
                }
            } catch (\Exception $e) {
                $aiResponse = [
                    'verified' => false,
                    'corrections' => [],
                    'confidence' => 0,
                    'message' => 'Error parsing AI response: ' . $e->getMessage()
                ];
            }
            
            // Return the verification result along with the original data
            return [
                'verified' => $aiResponse['verified'] ?? false,
                'corrections' => $aiResponse['corrections'] ?? [],
                'confidence' => $this->calculateAdjustedConfidence($aiResponse),
                'textractData' => $textractData
            ];
            
        } catch (\Exception $e) {
            return [
                'verified' => false,
                'error' => 'Error during verification: ' . $e->getMessage(),
                'textractData' => $textractData
            ];
        }
    }
    
    /**
     * Calculate an adjusted confidence level based on various factors
     * 
     * @param array<string, mixed> $aiResponse The response from OpenAI
     * @return float The adjusted confidence level (0-1)
     */
    private function calculateAdjustedConfidence(array $aiResponse): float
    {
        // Get base confidence from AI response, default to 0.5 if not provided
        $baseConfidence = $aiResponse['confidence'] ?? 0.5;
        
        // If the AI says the text is verified and there are no corrections
        if (($aiResponse['verified'] ?? false) && empty($aiResponse['corrections'] ?? [])) {
            // High confidence for perfect documents: 99%
            return 0.99;
        }
        
        // If there are corrections, adjust confidence based on number of corrections
        $corrections = $aiResponse['corrections'] ?? [];
        $correctionCount = count($corrections);
        
        if ($correctionCount > 0) {
            // Reduce confidence based on number of corrections
            // More corrections = lower confidence
            $confidenceReduction = min(0.7, $correctionCount * 0.1);
            return max(0.3, $baseConfidence - $confidenceReduction);
        }
        
        // Default fallback
        return $baseConfidence;
    }
} 