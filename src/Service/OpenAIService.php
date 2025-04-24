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
                            'content' => 'You are a financial analysis expert who precisely extracts KPIs from financial documents and business plans in both French and English. First determine the document language, then extract data like revenue/chiffre d\'affaire, gross margin/marge brute, acquisition costs/coûts d\'acquisition, etc. You can identify periods (Q1, Q2, Q3, Q4 or H1, H2) in the document and extract KPI values for each period. Respond only with structured JSON format.'
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
                
                // Format response for multi-period data
                $periodsResult = $this->formatMultiPeriodResponse($kpiData);
                
                return [
                    'success' => true,
                    'result' => $periodsResult,
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
     * Formats the response from OpenAI to match the expected multi-period format
     * 
     * @param array<string, mixed> $kpiData The raw KPI data from OpenAI
     * @return array<string, mixed> The formatted KPI data with periods
     */
    private function formatMultiPeriodResponse(array $kpiData): array
    {
        // Define default response structure
        $response = [
            'language' => $kpiData['language'] ?? 'fr',
            'periodicity' => $kpiData['periodicity'] ?? 'Q',
            'periods' => [],
            'kpi' => []
        ];
        
        // Check if the response already has the expected format
        if (isset($kpiData['periods']) && is_array($kpiData['periods']) && isset($kpiData['kpi']) && is_array($kpiData['kpi'])) {
            $response['periods'] = $kpiData['periods'];
            $response['kpi'] = $kpiData['kpi'];
            return $response;
        }
        
        // If we have legacy format (pre-multiple periods), convert it
        if (!isset($kpiData['kpi'])) {
            // Extract standard KPI fields
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
            
            // Get current period as fallback (e.g., "Q1 2023")
            $currentPeriod = date('Y');
            $periodPrefix = $response['periodicity'] === 'Q' ? 'Q1 ' : 'H1 ';
            $defaultPeriod = $periodPrefix . $currentPeriod;
            $response['periods'] = [$defaultPeriod];
            
            // Format standard fields
            foreach ($requiredFields as $field) {
                if (isset($kpiData[$field]) && $kpiData[$field] !== 'N.A') {
                    $response['kpi'][$field] = [
                        $defaultPeriod => $kpiData[$field]
                    ];
                }
            }
            
            // Check if there's a reconstructed table to extract periods from
            if (isset($kpiData['reconstructed_table']) && is_array($kpiData['reconstructed_table']) && count($kpiData['reconstructed_table']) > 1) {
                $this->extractPeriodsFromTable($kpiData['reconstructed_table'], $response);
            }
        }
        
        return $response;
    }

    /**
     * Extract periods and KPI values from a reconstructed table
     * 
     * @param array<int, array<int, string|int|float>> $table The reconstructed table data
     * @param array<string, mixed>& $response The response object to update
     */
    private function extractPeriodsFromTable(array $table, array &$response): void
    {
        // The first row should contain headers with period information
        $headers = $table[0] ?? [];
        $periodPrefix = $response['periodicity'] === 'Q' ? 'Q' : 'H';
        $periods = [];
        
        // Extract periods from headers (looking for Q1, Q2, etc. or H1, H2, etc.)
        foreach ($headers as $idx => $header) {
            if ($idx === 0) continue; // Skip the first column (usually KPI names)
            
            $header = (string)$header;
            if (preg_match('/(' . $periodPrefix . '\d+\s*\d{4}?)/', $header, $matches)) {
                $periods[$idx] = $matches[1];
            } elseif (preg_match('/(' . $periodPrefix . '\d+)/', $header, $matches)) {
                // If no year is specified, use current year
                $periods[$idx] = $matches[1] . ' ' . date('Y');
            }
        }
        
        if (count($periods) > 0) {
            $response['periods'] = array_values($periods);
            
            // Extract KPI values for each period
            $kpiMapping = [
                'revenue' => 'chiffre_affaire',
                'chiffre d\'affaire' => 'chiffre_affaire',
                'chiffre d\'affaires' => 'chiffre_affaire',
                'gross margin' => 'marge_brute',
                'marge brute' => 'marge_brute',
                'cac' => 'cout_acquisition',
                'customer acquisition cost' => 'cout_acquisition',
                'coût d\'acquisition' => 'cout_acquisition',
                'ltv' => 'valeur_vie_client',
                'customer lifetime value' => 'valeur_vie_client',
                'valeur à vie client' => 'valeur_vie_client',
                'employees' => 'nombre_employe',
                'employés' => 'nombre_employe',
                'nombre employé' => 'nombre_employe',
                'burn rate' => 'argent_brule',
                'argent brûlé' => 'argent_brule',
                'ebitda' => 'ebitda',
                'arr' => 'revenu_annuel',
                'annual recurring revenue' => 'revenu_annuel',
                'revenu annuel récurrent' => 'revenu_annuel',
                'mrr' => 'revenu_mensuel',
                'monthly recurring revenue' => 'revenu_mensuel',
                'revenu mensuel récurrent' => 'revenu_mensuel',
                'funding' => 'montant_leve',
                'montant levé' => 'montant_leve',
                'raised' => 'montant_leve',
            ];
            
            // Process each row after the header
            for ($i = 1; $i < count($table); $i++) {
                $row = $table[$i];
                $kpiName = strtolower((string)($row[0] ?? ''));
                
                // Check if this row contains a recognized KPI
                $kpiKey = null;
                foreach ($kpiMapping as $term => $key) {
                    if (strpos($kpiName, $term) !== false) {
                        $kpiKey = $key;
                        break;
                    }
                }
                
                if ($kpiKey) {
                    if (!isset($response['kpi'][$kpiKey])) {
                        $response['kpi'][$kpiKey] = [];
                    }
                    
                    // Add values for each period
                    foreach ($periods as $colIdx => $period) {
                        $value = isset($row[$colIdx]) ? (string)$row[$colIdx] : 'N.A';
                        if ($value && $value !== 'N.A' && $value !== '-') {
                            $response['kpi'][$kpiKey][$period] = $value;
                        }
                    }
                }
            }
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
            
            // Handle English variations and specific field mappings
            switch ($field) {
                case 'chiffre_affaire':
                    if (isset($kpiData['chiffre_d_affaire'])) $value = $kpiData['chiffre_d_affaire'];
                    elseif (isset($kpiData['revenue'])) $value = $kpiData['revenue'];
                    elseif (isset($kpiData['sales'])) $value = $kpiData['sales'];
                    elseif (isset($kpiData['turnover'])) $value = $kpiData['turnover'];
                    break;
                case 'marge_brute':
                    if (isset($kpiData['grossMargin'])) $value = $kpiData['grossMargin'];
                    elseif (isset($kpiData['gross_margin'])) $value = $kpiData['gross_margin'];
                    elseif (isset($kpiData['grossProfit'])) $value = $kpiData['grossProfit'];
                    elseif (isset($kpiData['gross_profit'])) $value = $kpiData['gross_profit'];
                    break;
                case 'cout_acquisition':
                    if (isset($kpiData['cac'])) $value = $kpiData['cac'];
                    elseif (isset($kpiData['costOfAcquisition'])) $value = $kpiData['costOfAcquisition'];
                    elseif (isset($kpiData['cost_of_acquisition'])) $value = $kpiData['cost_of_acquisition'];
                    elseif (isset($kpiData['acquisitionCost'])) $value = $kpiData['acquisitionCost'];
                    elseif (isset($kpiData['acquisition_cost'])) $value = $kpiData['acquisition_cost'];
                    elseif (isset($kpiData['customer_acquisition_cost'])) $value = $kpiData['customer_acquisition_cost'];
                    break;
                case 'valeur_vie_client':
                    if (isset($kpiData['ltv'])) $value = $kpiData['ltv'];
                    elseif (isset($kpiData['lifetimeValue'])) $value = $kpiData['lifetimeValue'];
                    elseif (isset($kpiData['lifetime_value'])) $value = $kpiData['lifetime_value'];
                    elseif (isset($kpiData['customerLifetimeValue'])) $value = $kpiData['customerLifetimeValue'];
                    elseif (isset($kpiData['customer_lifetime_value'])) $value = $kpiData['customer_lifetime_value'];
                    break;
                case 'nombre_employe':
                    if (isset($kpiData['headcount'])) $value = $kpiData['headcount'];
                    elseif (isset($kpiData['employeeCount'])) $value = $kpiData['employeeCount'];
                    elseif (isset($kpiData['employee_count'])) $value = $kpiData['employee_count'];
                    elseif (isset($kpiData['employees'])) $value = $kpiData['employees'];
                    break;
                case 'argent_brule':
                    if (isset($kpiData['burn'])) $value = $kpiData['burn'];
                    elseif (isset($kpiData['burnRate'])) $value = $kpiData['burnRate'];
                    elseif (isset($kpiData['burn_rate'])) $value = $kpiData['burn_rate'];
                    elseif (isset($kpiData['cashBurn'])) $value = $kpiData['cashBurn'];
                    elseif (isset($kpiData['cash_burn'])) $value = $kpiData['cash_burn'];
                    break;
                case 'revenu_annuel':
                    if (isset($kpiData['revenu_annuel_recurrent'])) $value = $kpiData['revenu_annuel_recurrent'];
                    elseif (isset($kpiData['arr'])) $value = $kpiData['arr'];
                    elseif (isset($kpiData['annualRecurringRevenue'])) $value = $kpiData['annualRecurringRevenue'];
                    elseif (isset($kpiData['annual_recurring_revenue'])) $value = $kpiData['annual_recurring_revenue'];
                    break;
                case 'revenu_mensuel':
                    if (isset($kpiData['revenu_mensuel_recurrent'])) $value = $kpiData['revenu_mensuel_recurrent'];
                    elseif (isset($kpiData['mrr'])) $value = $kpiData['mrr'];
                    elseif (isset($kpiData['monthlyRecurringRevenue'])) $value = $kpiData['monthlyRecurringRevenue'];
                    elseif (isset($kpiData['monthly_recurring_revenue'])) $value = $kpiData['monthly_recurring_revenue'];
                    break;
                case 'montant_leve':
                    if (isset($kpiData['funding'])) $value = $kpiData['funding'];
                    elseif (isset($kpiData['fundingAmount'])) $value = $kpiData['fundingAmount'];
                    elseif (isset($kpiData['funding_amount'])) $value = $kpiData['funding_amount'];
                    elseif (isset($kpiData['raised'])) $value = $kpiData['raised'];
                    break;
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
            $prompt = "You are an expert financial document validator assistant that helps verify text extracted from PDFs in both English and French. First determine the document language, then verify the accuracy of financial data, numbers, and terms in that language.\n\n";
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
                            'content' => 'You are an expert financial document validator assistant that helps verify text extracted from PDFs in both English and French. First determine the document language, then verify the accuracy of financial data, numbers, and terms in that language.'
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

    /**
     * Analyze document content with vision capabilities to extract KPIs
     * 
     * @param string $prompt The user prompt with document content
     * @param string $documentId Optional document identifier for logging
     * @param string|null $imageBase64 Base64 encoded image to analyze with Vision
     * @return array<string, mixed> The extracted KPIs and analysis
     */
    public function analyzeKpisWithVision(string $prompt, string $documentId = 'unknown', ?string $imageBase64 = null): array
    {
        try {
            if (!$imageBase64) {
                // Fallback to text-only analysis if no image is provided
                return $this->analyzeKpis($prompt, $documentId);
            }

            // Call OpenAI API with vision capabilities
            $messages = [
                [
                    'role' => 'system',
                    'content' => 'You are a financial analysis expert specialized in extracting KPIs from financial documents and business plans. You can process both text and images to provide accurate data extraction, especially for tables and structured data.'
                ]
            ];

            // Add the text content
            $messages[] = [
                'role' => 'user',
                'content' => [
                    [
                        'type' => 'text',
                        'text' => $prompt
                    ],
                    [
                        'type' => 'image_url',
                        'image_url' => [
                            'url' => 'data:image/png;base64,' . $imageBase64,
                            'detail' => 'high'
                        ]
                    ]
                ]
            ];

            $response = $this->httpClient->request('POST', 'https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => 'gpt-4.1', // Utiliser le modèle vision
                    'messages' => $messages,
                    'temperature' => 0.1,
                    'max_tokens' => 2000,
                    'response_format' => ['type' => 'json_object'],
                ],
                'timeout' => 60, // Augmenter le timeout pour le traitement des images
            ]);
            
            $statusCode = $response->getStatusCode();
            
            if ($statusCode !== 200) {
                // Get more detailed error information
                $errorData = $response->toArray(false);
                $errorMessage = isset($errorData['error']['message']) ? $errorData['error']['message'] : 'Unknown error';
                
                return [
                    'success' => false,
                    'message' => 'OpenAI Vision API error: ' . $statusCode . ' - ' . $errorMessage,
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
                
                // Ensure response has the expected format
                $periodsResult = $this->formatAndCleanMultiPeriodResponse($kpiData);
                
                return [
                    'success' => true,
                    'result' => $periodsResult,
                    'documentId' => $documentId
                ];
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => 'Error parsing Vision KPI data: ' . $e->getMessage(),
                    'documentId' => $documentId
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error during Vision KPI analysis: ' . $e->getMessage(),
                'documentId' => $documentId
            ];
        }
    }

    /**
     * Formats and cleans the response for multi-period data with improved consistency
     * 
     * @param array<string, mixed> $kpiData The raw KPI data from OpenAI
     * @return array<string, mixed> The formatted KPI data with periods
     */
    private function formatAndCleanMultiPeriodResponse(array $kpiData): array
    {
        // Define default response structure
        $response = [
            'year' => $kpiData['year'] ?? date('Y'),
            'language' => $kpiData['language'] ?? 'fr',
            'periodicity' => $kpiData['periodicity'] ?? 'Q',
            'periods' => $kpiData['periods'] ?? [],
            'kpi' => []
        ];
        
        // Check if the response already has the expected format with KPI data
        if (isset($kpiData['kpi']) && is_array($kpiData['kpi'])) {
            // Filter out non-relevant columns
            $excludedColumns = ['fcst', 'better', 'worse', 'ytd', 'total', 'average'];
            
            // Normalize KPI data
            $normalizedKpi = [];
            foreach ($kpiData['kpi'] as $kpiName => $periodValues) {
                // Skip empty KPIs
                if (empty($periodValues)) {
                    continue;
                }
                
                // Standardize KPI names
                $standardizedKpiName = $this->standardizeKpiName($kpiName, $response['language']);
                
                if (!$standardizedKpiName) {
                    // Skip unrecognized KPIs
                    continue;
                }
                
                $normalizedKpi[$standardizedKpiName] = [];
                
                // Filter and normalize period values
                foreach ($periodValues as $period => $value) {
                    // Check if period should be excluded
                    $periodLower = strtolower($period);
                    $shouldExclude = false;
                    
                    foreach ($excludedColumns as $excludedColumn) {
                        if (strpos($periodLower, $excludedColumn) !== false) {
                            $shouldExclude = true;
                            break;
                        }
                    }
                    
                    if ($shouldExclude) {
                        continue;
                    }
                    
                    // Normalize period format (Q1, Q2, etc.)
                    $normalizedPeriod = $this->normalizePeriod($period, $response['periodicity']);
                    
                    if ($normalizedPeriod) {
                        $normalizedKpi[$standardizedKpiName][$normalizedPeriod] = $value;
                    }
                }
            }
            
            $response['kpi'] = $normalizedKpi;
            
            // Reconstruct periods based on KPI data
            if (empty($response['periods'])) {
                $allPeriods = [];
                foreach ($normalizedKpi as $periodValues) {
                    $allPeriods = array_merge($allPeriods, array_keys($periodValues));
                }
                
                $uniquePeriods = array_unique($allPeriods);
                sort($uniquePeriods);
                $response['periods'] = $uniquePeriods;
            }
        }
        
        return $response;
    }

    /**
     * Standardize KPI names for consistency
     * 
     * @param string $kpiName Raw KPI name from the data
     * @param string $language The language of the document (fr or en)
     * @return string|null Standardized KPI name or null if not recognized
     */
    private function standardizeKpiName(string $kpiName, string $language): ?string
    {
        $kpiName = strtolower(trim($kpiName));
        
        // Mapping of KPI names and their variations to standard names
        $kpiMapping = [
            // French standard names
            'chiffre d\'affaire' => 'Chiffre d\'affaire',
            'chiffre d\'affaires' => 'Chiffre d\'affaire',
            'revenu' => 'Chiffre d\'affaire',
            'ca' => 'Chiffre d\'affaire',
            'net bookings' => 'Chiffre d\'affaire',
            
            'marge brute' => 'Marge brute',
            'gross margin' => 'Marge brute',
            
            'cout d\'acquisition' => 'Coût d\'acquisition du client',
            'coût d\'acquisition' => 'Coût d\'acquisition du client',
            'cac' => 'Coût d\'acquisition du client',
            'cac ratio' => 'Coût d\'acquisition du client',
            
            'valeur vie client' => 'Valeur à vie client',
            'ltv' => 'Valeur à vie client',
            'lifetime value' => 'Valeur à vie client',
            
            'nombre employé' => 'Nombre d\'employés',
            'nombre employe' => 'Nombre d\'employés',
            'headcount' => 'Nombre d\'employés',
            'employees' => 'Nombre d\'employés',
            'effectif' => 'Nombre d\'employés',
            
            'argent brulé' => 'Argent brûlé',
            'burn rate' => 'Argent brûlé',
            'cash burn' => 'Argent brûlé',
            
            'ebitda' => 'EBITDA',
            
            'revenu annuel' => 'Revenu Annuel Récurrent (ARR)',
            'arr' => 'Revenu Annuel Récurrent (ARR)',
            'net arr' => 'Revenu Annuel Récurrent (ARR)',
            'annual recurring revenue' => 'Revenu Annuel Récurrent (ARR)',
            
            'revenu mensuel' => 'Revenu Mensuel Récurrent (MRR)',
            'mrr' => 'Revenu Mensuel Récurrent (MRR)',
            'monthly recurring revenue' => 'Revenu Mensuel Récurrent (MRR)',
            
            'montant levé' => 'Montant levé',
            'funds raised' => 'Montant levé',
            'raised' => 'Montant levé',
            'funding' => 'Montant levé',
        ];
        
        // English standard names (if language is English)
        $englishMapping = [
            'revenue' => 'Revenue',
            'sales' => 'Revenue',
            'turnover' => 'Revenue',
            'chiffre d\'affaire' => 'Revenue',
            
            'gross margin' => 'Gross Margin',
            'marge brute' => 'Gross Margin',
            
            'customer acquisition cost' => 'Customer Acquisition Cost (CAC)',
            'cac' => 'Customer Acquisition Cost (CAC)',
            'coût d\'acquisition' => 'Customer Acquisition Cost (CAC)',
            
            'customer lifetime value' => 'Customer Lifetime Value (LTV)',
            'ltv' => 'Customer Lifetime Value (LTV)',
            'valeur vie client' => 'Customer Lifetime Value (LTV)',
            
            'headcount' => 'Headcount',
            'employees' => 'Headcount',
            'nombre employé' => 'Headcount',
            
            'cash burn' => 'Cash Burn',
            'burn rate' => 'Cash Burn',
            'argent brulé' => 'Cash Burn',
            
            'ebitda' => 'EBITDA',
            
            'annual recurring revenue' => 'Annual Recurring Revenue (ARR)',
            'arr' => 'Annual Recurring Revenue (ARR)',
            'revenu annuel' => 'Annual Recurring Revenue (ARR)',
            
            'monthly recurring revenue' => 'Monthly Recurring Revenue (MRR)',
            'mrr' => 'Monthly Recurring Revenue (MRR)',
            'revenu mensuel' => 'Monthly Recurring Revenue (MRR)',
            
            'funding amount' => 'Funding Amount',
            'raised' => 'Funding Amount',
            'montant levé' => 'Funding Amount',
        ];
        
        // Use the appropriate mapping based on language
        $mapping = $language === 'en' ? $englishMapping : $kpiMapping;
        
        foreach ($mapping as $key => $standardName) {
            // Check if the KPI name contains this key
            if (strpos($kpiName, $key) !== false) {
                return $standardName;
            }
        }
        
        // If no match found but the name seems to be a known KPI, return it as is with first letter capitalized
        foreach (array_values($mapping) as $standardName) {
            if (strpos(strtolower($standardName), $kpiName) !== false) {
                return $standardName;
            }
        }
        
        // Otherwise return the original KPI name with first letter capitalized
        return ucfirst($kpiName);
    }

    /**
     * Normalize period format
     * 
     * @param string $period Raw period from the data
     * @param string $periodicity The periodicity type (Q or H)
     * @return string|null Normalized period or null if not recognized
     */
    private function normalizePeriod(string $period, string $periodicity): ?string
    {
        $period = trim($period);
        
        // Regular expression patterns to identify quarters and half-years
        $quarterPattern = '/\b(q|quarter|trimestre|t)[.\s-]*(\d+)(?:\s*(\d{4}|\d{2}))?\b/i';
        $halfYearPattern = '/\b(h|half|semestre|s)[.\s-]*(\d+)(?:\s*(\d{4}|\d{2}))?\b/i';
        
        if ($periodicity === 'Q') {
            if (preg_match($quarterPattern, $period, $matches)) {
                $quarterNumber = $matches[2];
                
                // Only accept quarters 1-4
                if ($quarterNumber < 1 || $quarterNumber > 4) {
                    return null;
                }
                
                return "Q{$quarterNumber}";
            }
        } else { // H
            if (preg_match($halfYearPattern, $period, $matches)) {
                $halfNumber = $matches[2];
                
                // Only accept half-years 1-2
                if ($halfNumber < 1 || $halfNumber > 2) {
                    return null;
                }
                
                return "H{$halfNumber}";
            }
        }
        
        // If period already matches expected format, return as is
        if (preg_match('/^' . $periodicity . '\d+$/', $period)) {
            return $period;
        }
        
        return null;
    }
} 