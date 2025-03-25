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