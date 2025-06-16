<?php

namespace App\Tests\Unit\Controller\Api;

use App\Controller\Api\CompanyController;
use App\Service\Company\CompanyServiceInterface;
use App\Repository\CompanyRepository;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class CompanyControllerTest extends TestCase
{
    private CompanyController $controller;
    private CompanyServiceInterface $companyService;
    private CompanyRepository $companyRepository;
    private LoggerInterface $logger;

    protected function setUp(): void
    {
        // Créer les mocks
        $this->companyService = $this->createMock(CompanyServiceInterface::class);
        $this->companyRepository = $this->createMock(CompanyRepository::class);
        $this->logger = $this->createMock(LoggerInterface::class);

        // Créer l'instance du contrôleur
        $this->controller = new CompanyController(
            $this->companyService,
            $this->companyRepository,
            $this->logger
        );
    }

    public function testGetCompanyDetailsSuccess(): void
    {
        // Arrange
        $siren = '123456789';
        $expectedData = [
            'siren' => $siren,
            'denomination' => 'Test Company'
        ];

        $request = new Request();
        $request->query->set('mode', 'normal');

        // Configurer le service
        $this->companyService
            ->expects($this->once())
            ->method('getCompanyData')
            ->with($siren, false)
            ->willReturn($expectedData);

        // Configurer le logger
        $this->logger->expects($this->once())
            ->method('info')
            ->with(
                'Début de la requête getCompanyDetails',
                $this->callback(function ($args) use ($siren) {
                    return $args['siren'] === $siren && $args['mode'] === 'normal';
                })
            );

        // Act
        $response = $this->controller->getCompanyDetails($siren, $request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals($expectedData, json_decode($response->getContent(), true));
    }

    public function testGetCompanyDetailsWithForceScraping(): void
    {
        // Arrange
        $siren = '123456789';
        $expectedData = [
            'siren' => $siren,
            'denomination' => 'Test Company'
        ];

        $request = new Request();
        $request->query->set('mode', 'scraping');

        // Configurer le service
        $this->companyService
            ->expects($this->once())
            ->method('getCompanyData')
            ->with($siren, true)
            ->willReturn($expectedData);

        // Act
        $response = $this->controller->getCompanyDetails($siren, $request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals($expectedData, json_decode($response->getContent(), true));
    }

    public function testGetCompanyDetailsWithError(): void
    {
        // Arrange
        $siren = '123456789';
        $errorMessage = 'Erreur de test';

        $request = new Request();

        // Configurer le service pour lever une exception
        $this->companyService
            ->expects($this->once())
            ->method('getCompanyData')
            ->willThrowException(new \Exception($errorMessage));

        // Configurer le logger pour l'erreur
        $this->logger->expects($this->once())
            ->method('error')
            ->with(
                'Erreur critique dans getCompanyDetails',
                $this->callback(function ($args) use ($errorMessage) {
                    return $args['error'] === $errorMessage;
                })
            );

        // Act
        $response = $this->controller->getCompanyDetails($siren, $request);

        // Assert
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(400, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals($errorMessage, $responseData['error']);
        $this->assertEquals('Une erreur est survenue lors de la récupération des données', $responseData['details']);
    }
}
