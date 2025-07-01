<?php

namespace App\Tests\Unit\Service\Company;

use App\Service\Company\CompanyService;
use App\Service\Company\CompanyDataAggregator;
use PHPUnit\Framework\TestCase;

class CompanyServiceTest extends TestCase
{
    private CompanyService $companyService;
    private CompanyDataAggregator $dataAggregator;

    protected function setUp(): void
    {
        // Créer un mock de CompanyDataAggregator
        $this->dataAggregator = $this->createMock(CompanyDataAggregator::class);
        
        // Créer l'instance de CompanyService avec le mock
        $this->companyService = new CompanyService($this->dataAggregator);
    }

    public function testGetCompanyDataReturnsDataFromAggregator(): void
    {
        // Arrange
        $siren = '123456789';
        $expectedData = [
            'siren' => $siren,
            'denomination' => 'Test Company',
            'businessStructures' => 'SARL'
        ];

        // Configurer le mock pour retourner les données attendues
        $this->dataAggregator
            ->expects($this->once())
            ->method('getCompanyData')
            ->with($siren, false)
            ->willReturn($expectedData);

        // Act
        $result = $this->companyService->getCompanyData($siren);

        // Assert
        $this->assertEquals($expectedData, $result);
    }

    public function testGetCompanyDataWithForceScraping(): void
    {
        // Arrange
        $siren = '123456789';
        $expectedData = [
            'siren' => $siren,
            'denomination' => 'Test Company',
            'businessStructures' => 'SARL'
        ];

        // Configurer le mock pour retourner les données attendues avec forceScraping = true
        $this->dataAggregator
            ->expects($this->once())
            ->method('getCompanyData')
            ->with($siren, true)
            ->willReturn($expectedData);

        // Act
        $result = $this->companyService->getCompanyData($siren, true);

        // Assert
        $this->assertEquals($expectedData, $result);
    }

    public function testGetCompanyDataHandlesException(): void
    {
        // Arrange
        $siren = '123456789';
        
        // Configurer le mock pour lever une exception
        $this->dataAggregator
            ->expects($this->once())
            ->method('getCompanyData')
            ->with($siren, false)
            ->willThrowException(new \Exception('Erreur de test'));

        // Assert
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Erreur de test');

        // Act
        $this->companyService->getCompanyData($siren);
    }
}
