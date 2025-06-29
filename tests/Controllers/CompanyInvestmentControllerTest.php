<?php

namespace App\Tests\Unit\Controllers;

use App\Controller\Api\CompanyInvestmentController;
use App\Repository\CompanyInvestmentRepository;
use App\Repository\UserRepository;
use App\Repository\CompanyRepository;
use App\Entity\User;
use App\Entity\UserGroup;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class CompanyInvestmentControllerTest extends TestCase
{
    private CompanyInvestmentController $controller;
    private CompanyInvestmentRepository $companyInvestmentRepository;
    private UserRepository $userRepository;
    private CompanyRepository $companyRepository;
    private User $user;
    private UserGroup $userGroup;

    protected function setUp(): void
    {
        $this->companyInvestmentRepository = $this->createMock(CompanyInvestmentRepository::class);
        $this->userRepository = $this->createMock(UserRepository::class);
        $this->companyRepository = $this->createMock(CompanyRepository::class);

        // Créer un mock User et UserGroup
        $this->userGroup = $this->createMock(UserGroup::class);
        $this->userGroup->method('getId')->willReturn(1);

        $this->user = $this->createMock(User::class);
        $this->user->method('getUserGroup')->willReturn($this->userGroup);

        $this->controller = new CompanyInvestmentController(
            $this->companyInvestmentRepository,
            $this->userRepository
        );
    }

    public function testGetInvestmentsSuccess(): void
    {
        // Arrange
        $request = new Request();
        $request->headers->set('x-cognito-id', 'test-cognito-id');
        $request->query->set('page', '1');
        $request->query->set('limit', '10');
        $request->query->set('sortField', 'updatedAt');
        $request->query->set('sortOrder', 'desc');

        $expectedResult = [
            'data' => [
                [
                    'id' => 1,
                    'company' => ['name' => 'Test Company'],
                    'investment' => ['totalAmount' => 100000]
                ]
            ],
            'pagination' => [
                'current' => 1,
                'total' => 1,
                'pageSize' => 10
            ]
        ];

        $this->companyRepository
            ->expects($this->once())
            ->method('findByFiltersWithPagination')
            ->with(
                [],
                'test-cognito-id',
                1,
                10,
                'updatedAt',
                'desc'
            )
            ->willReturn($expectedResult);

        // Act
        $response = $this->controller->getInvestments($request, $this->companyRepository);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals($expectedResult, json_decode($response->getContent(), true));
    }

    public function testGetInvestmentsWithFilters(): void
    {
        // Arrange
        $request = new Request();
        $request->headers->set('x-cognito-id', 'test-cognito-id');
        $request->query->set('sector', 'technology,healthcare');
        $request->query->set('fundingType', 'seed,serieA');

        $expectedFilters = [
            'sector' => ['technology', 'healthcare'],
            'fundingType' => ['seed', 'serieA']
        ];

        $this->companyRepository
            ->expects($this->once())
            ->method('findByFiltersWithPagination')
            ->with(
                $expectedFilters,
                'test-cognito-id',
                1,
                10,
                'updatedAt',
                'desc'
            )
            ->willReturn(['data' => [], 'pagination' => []]);

        // Act
        $response = $this->controller->getInvestments($request, $this->companyRepository);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testGetInvestmentsWithoutAuthentication(): void
    {
        // Arrange
        $request = new Request();

        // Act
        $response = $this->controller->getInvestments($request, $this->companyRepository);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(400, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Utilisateur non authentifié', $responseData['error']);
    }

    public function testGetGlobalInvestmentsSuccess(): void
    {
        // Arrange
        $request = new Request();
        $request->headers->set('x-cognito-id', 'test-cognito-id');

        $expectedData = [
            [
                'company_id' => 1,
                'company_name' => 'Test Company',
                'total_investment' => 500000
            ]
        ];

        $this->userRepository
            ->expects($this->once())
            ->method('findOneBy')
            ->with(['cognitoId' => 'test-cognito-id'])
            ->willReturn($this->user);

        $this->companyInvestmentRepository
            ->expects($this->once())
            ->method('fetchGlobalInvestments')
            ->with($this->userGroup)
            ->willReturn($expectedData);

        // Act
        $response = $this->controller->getGlobalInvestments($request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals($expectedData, json_decode($response->getContent(), true));
    }

    public function testGetGlobalInvestmentsUserNotFound(): void
    {
        // Arrange
        $request = new Request();
        $request->headers->set('x-cognito-id', 'invalid-cognito-id');

        $this->userRepository
            ->expects($this->once())
            ->method('findOneBy')
            ->with(['cognitoId' => 'invalid-cognito-id'])
            ->willReturn(null);

        // Act
        $response = $this->controller->getGlobalInvestments($request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(400, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Utilisateur non authentifié ou non trouvé', $responseData['error']);
    }

    public function testGetGlobalFundingInvestmentsSuccess(): void
    {
        // Arrange
        $request = new Request();
        $request->headers->set('x-cognito-id', 'test-cognito-id');

        $expectedData = [
            [
                'funding_type' => 'seed',
                'total_investment' => 200000
            ],
            [
                'funding_type' => 'serieA',
                'total_investment' => 300000
            ]
        ];

        $this->userRepository
            ->expects($this->once())
            ->method('findOneBy')
            ->with(['cognitoId' => 'test-cognito-id'])
            ->willReturn($this->user);

        $this->companyInvestmentRepository
            ->expects($this->once())
            ->method('fetchGlobalFundingInvestments')
            ->with($this->userGroup)
            ->willReturn($expectedData);

        // Act
        $response = $this->controller->getGlobalFundingInvestments($request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals($expectedData, json_decode($response->getContent(), true));
    }

    public function testGetGlobalSectorInvestmentsSuccess(): void
    {
        // Arrange
        $request = new Request();
        $request->headers->set('x-cognito-id', 'test-cognito-id');

        $expectedData = [
            [
                'sector' => 'technology',
                'total_investment' => 400000
            ],
            [
                'sector' => 'healthcare',
                'total_investment' => 300000
            ]
        ];

        $this->userRepository
            ->expects($this->once())
            ->method('findOneBy')
            ->with(['cognitoId' => 'test-cognito-id'])
            ->willReturn($this->user);

        $this->companyInvestmentRepository
            ->expects($this->once())
            ->method('fetchGlobalSectorInvestments')
            ->with($this->userGroup)
            ->willReturn($expectedData);

        // Act
        $response = $this->controller->getGlobalSectorInvestments($request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals($expectedData, json_decode($response->getContent(), true));
    }

    public function testFindByCompanyIdAndYearSuccess(): void
    {
        // Arrange
        $request = new Request();
        $request->headers->set('x-cognito-id', 'test-cognito-id');
        $companyId = 1;
        $year = 2024;

        $expectedData = [
            [
                'month' => 'January',
                'investment' => 50000
            ],
            [
                'month' => 'February',
                'investment' => 75000
            ]
        ];

        $this->userRepository
            ->expects($this->once())
            ->method('findOneBy')
            ->with(['cognitoId' => 'test-cognito-id'])
            ->willReturn($this->user);

        $this->companyInvestmentRepository
            ->expects($this->once())
            ->method('findByCompanyIdAndYear')
            ->with($companyId, $year, $this->userGroup)
            ->willReturn($expectedData);

        // Act
        $response = $this->controller->findByCompanyIdAndYear($request, $companyId, $year);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals($expectedData, json_decode($response->getContent(), true));
    }

    public function testFindByCompanyIdAndYearNotFound(): void
    {
        // Arrange
        $request = new Request();
        $request->headers->set('x-cognito-id', 'test-cognito-id');
        $companyId = 1;
        $year = 2024;

        $this->userRepository
            ->expects($this->once())
            ->method('findOneBy')
            ->with(['cognitoId' => 'test-cognito-id'])
            ->willReturn($this->user);

        $this->companyInvestmentRepository
            ->expects($this->once())
            ->method('findByCompanyIdAndYear')
            ->with($companyId, $year, $this->userGroup)
            ->willReturn([]);

        // Act
        $response = $this->controller->findByCompanyIdAndYear($request, $companyId, $year);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(404, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Investment not found', $responseData['error']);
    }

    public function testGetPredefinedQueriesSuccess(): void
    {
        // Arrange
        $request = new Request();
        $request->headers->set('x-cognito-id', 'test-cognito-id');

        $expectedQueries = [
            [
                'id' => '1',
                'name' => 'Revenus par période',
                'description' => 'Analyse des KPI de revenus par période',
                'query' => 'monthly_revenue'
            ]
        ];

        $this->userRepository
            ->expects($this->once())
            ->method('findOneBy')
            ->with(['cognitoId' => 'test-cognito-id'])
            ->willReturn($this->user);

        $this->companyInvestmentRepository
            ->expects($this->once())
            ->method('getPredefinedQueries')
            ->willReturn($expectedQueries);

        // Act
        $response = $this->controller->getPredefinedQueries($request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals($expectedQueries, $responseData['queries']);
    }

    public function testGetPredefinedQueriesWithoutAuthentication(): void
    {
        // Arrange
        $request = new Request();

        // Act
        $response = $this->controller->getPredefinedQueries($request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(401, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Utilisateur non authentifié', $responseData['error']);
    }

    public function testGetPredefinedQueriesUserNotFound(): void
    {
        // Arrange
        $request = new Request();
        $request->headers->set('x-cognito-id', 'invalid-cognito-id');

        $this->userRepository
            ->expects($this->once())
            ->method('findOneBy')
            ->with(['cognitoId' => 'invalid-cognito-id'])
            ->willReturn(null);

        // Act
        $response = $this->controller->getPredefinedQueries($request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(401, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Utilisateur non trouvé', $responseData['error']);
    }

    public function testExecuteQuerySuccess(): void
    {
        // Arrange
        $requestData = [
            'queryId' => 'monthly_revenue',
            'companyId' => 1
        ];

        $request = new Request();
        $request->headers->set('x-cognito-id', 'test-cognito-id');
        $request->initialize([], [], [], [], [], ['HTTP_X_COGNITO_ID' => 'test-cognito-id'], json_encode($requestData));

        $expectedResults = [
            [
                'period' => '2024-Q1',
                'kpi_name' => 'Revenu Annuel Récurrent',
                'revenue' => 100000,
                'unit' => '€'
            ]
        ];

        $this->userRepository
            ->expects($this->once())
            ->method('findOneBy')
            ->with(['cognitoId' => 'test-cognito-id'])
            ->willReturn($this->user);

        $this->companyInvestmentRepository
            ->expects($this->once())
            ->method('executeQueryById')
            ->with('monthly_revenue', 1, $this->userGroup)
            ->willReturn($expectedResults);

        // Act
        $response = $this->controller->executeQuery($request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals($expectedResults, $responseData['results']);
    }

    public function testExecuteQueryMissingParameters(): void
    {
        // Arrange
        $requestData = [
            'queryId' => 'monthly_revenue'
            // companyId manquant
        ];

        $request = new Request();
        $request->headers->set('x-cognito-id', 'test-cognito-id');
        $request->initialize([], [], [], [], [], ['HTTP_X_COGNITO_ID' => 'test-cognito-id'], json_encode($requestData));

        $this->userRepository
            ->expects($this->once())
            ->method('findOneBy')
            ->with(['cognitoId' => 'test-cognito-id'])
            ->willReturn($this->user);

        // Act
        $response = $this->controller->executeQuery($request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(400, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Identifiant d\'entreprise manquant', $responseData['error']);
    }

    public function testExecuteQueryWithoutAuthentication(): void
    {
        // Arrange
        $requestData = [
            'queryId' => 'monthly_revenue',
            'companyId' => 1
        ];

        $request = new Request();
        // Pas d'en-tête x-cognito-id
        $request->initialize([], [], [], [], [], [], json_encode($requestData));

        // Act
        $response = $this->controller->executeQuery($request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(401, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Utilisateur non authentifié', $responseData['error']);
    }

    public function testExecuteQueryUserNotFound(): void
    {
        // Arrange
        $requestData = [
            'queryId' => 'monthly_revenue',
            'companyId' => 1
        ];

        $request = new Request();
        $request->headers->set('x-cognito-id', 'invalid-cognito-id');
        $request->initialize([], [], [], [], [], ['HTTP_X_COGNITO_ID' => 'invalid-cognito-id'], json_encode($requestData));

        $this->userRepository
            ->expects($this->once())
            ->method('findOneBy')
            ->with(['cognitoId' => 'invalid-cognito-id'])
            ->willReturn(null);

        // Act
        $response = $this->controller->executeQuery($request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(401, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Utilisateur non trouvé', $responseData['error']);
    }

    public function testDeleteInvestmentSuccess(): void
    {
        // Arrange
        $request = new Request();
        $request->headers->set('x-cognito-id', 'test-cognito-id');
        $investmentId = 1;

        $this->userRepository
            ->expects($this->once())
            ->method('findOneBy')
            ->with(['cognitoId' => 'test-cognito-id'])
            ->willReturn($this->user);

        $this->companyInvestmentRepository
            ->expects($this->once())
            ->method('deleteInvestmentById')
            ->with($investmentId)
            ->willReturn(true);

        // Act
        $response = $this->controller->deleteInvestment($request, $investmentId);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Investissement supprimé avec succès', $responseData['message']);
    }

    public function testDeleteInvestmentNotFound(): void
    {
        // Arrange
        $request = new Request();
        $request->headers->set('x-cognito-id', 'test-cognito-id');
        $investmentId = 999;

        $this->userRepository
            ->expects($this->once())
            ->method('findOneBy')
            ->with(['cognitoId' => 'test-cognito-id'])
            ->willReturn($this->user);

        $this->companyInvestmentRepository
            ->expects($this->once())
            ->method('deleteInvestmentById')
            ->with($investmentId)
            ->willReturn(false);

        // Act
        $response = $this->controller->deleteInvestment($request, $investmentId);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(404, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Investissement non trouvé', $responseData['error']);
    }

    public function testDeleteInvestmentWithoutAuthentication(): void
    {
        // Arrange
        $request = new Request();
        $investmentId = 1;

        // Act
        $response = $this->controller->deleteInvestment($request, $investmentId);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(400, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Utilisateur non authentifié ou non trouvé', $responseData['error']);
    }
}
