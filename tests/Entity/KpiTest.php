<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Kpi;
use App\Entity\Document;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Uid\Uuid;

class KpiTest extends TestCase
{
    private Kpi $kpi;

    protected function setUp(): void
    {
        $this->kpi = new Kpi();
    }

    public function testConstructor(): void
    {
        // Vérifier que l'ID UUID est généré
        $this->assertInstanceOf(Uuid::class, $this->kpi->getId());
        
        // Vérifier que les propriétés sont null par défaut
        $this->assertNull($this->kpi->getName());
        $this->assertNull($this->kpi->getValue());
        $this->assertNull($this->kpi->getPeriod());
        $this->assertNull($this->kpi->getDocument());
        $this->assertNull($this->kpi->getUnit());
    }

    public function testIdGetter(): void
    {
        // L'ID est généré automatiquement dans le constructeur
        $this->assertInstanceOf(Uuid::class, $this->kpi->getId());
        
        // Vérifier que l'ID est unique pour chaque instance
        $kpi2 = new Kpi();
        $this->assertNotEquals($this->kpi->getId(), $kpi2->getId());
    }

    public function testNameGetterAndSetter(): void
    {
        $name = 'Revenu Annuel Récurrent';
        $this->kpi->setName($name);
        
        $this->assertEquals($name, $this->kpi->getName());
    }

    public function testNameWithEmptyString(): void
    {
        $name = '';
        $this->kpi->setName($name);
        
        $this->assertEquals($name, $this->kpi->getName());
    }

    public function testNameWithSpecialCharacters(): void
    {
        $name = 'KPI avec caractères spéciaux: éàçù€$%';
        $this->kpi->setName($name);
        
        $this->assertEquals($name, $this->kpi->getName());
    }

    public function testValueGetterAndSetter(): void
    {
        $value = 100000.50;
        $this->kpi->setValue($value);
        
        $this->assertEquals($value, $this->kpi->getValue());
    }

    public function testValueWithNull(): void
    {
        // La valeur peut être null selon la définition de l'entité
        $this->kpi->setValue(null);
        
        $this->assertNull($this->kpi->getValue());
    }

    public function testValueWithZero(): void
    {
        $value = 0.0;
        $this->kpi->setValue($value);
        
        $this->assertEquals($value, $this->kpi->getValue());
    }

    public function testValueWithNegativeNumber(): void
    {
        $value = -50000.75;
        $this->kpi->setValue($value);
        
        $this->assertEquals($value, $this->kpi->getValue());
    }

    public function testValueWithLargeNumber(): void
    {
        $value = 999999999.99;
        $this->kpi->setValue($value);
        
        $this->assertEquals($value, $this->kpi->getValue());
    }

    public function testPeriodGetterAndSetter(): void
    {
        $period = 'Q1';
        $this->kpi->setPeriod($period);
        
        $this->assertEquals($period, $this->kpi->getPeriod());
    }

    public function testPeriodWithDifferentValues(): void
    {
        $periods = ['Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2', 'Y', 'M1', 'M2', 'M3'];
        
        foreach ($periods as $period) {
            $this->kpi->setPeriod($period);
            $this->assertEquals($period, $this->kpi->getPeriod());
        }
    }

    public function testPeriodWithEmptyString(): void
    {
        $period = '';
        $this->kpi->setPeriod($period);
        
        $this->assertEquals($period, $this->kpi->getPeriod());
    }

    public function testDocumentGetterAndSetter(): void
    {
        $document = new Document();
        $this->kpi->setDocument($document);
        
        $this->assertEquals($document, $this->kpi->getDocument());
    }

    public function testDocumentWithNull(): void
    {
        // La relation Document peut être null selon la définition de l'entité
        $this->kpi->setDocument(null);
        
        $this->assertNull($this->kpi->getDocument());
    }

    public function testUnitGetterAndSetter(): void
    {
        $unit = '€';
        $this->kpi->setUnit($unit);
        
        $this->assertEquals($unit, $this->kpi->getUnit());
    }

    public function testUnitWithNull(): void
    {
        // L'unité peut être null selon la définition de l'entité
        $this->kpi->setUnit(null);
        
        $this->assertNull($this->kpi->getUnit());
    }

    public function testUnitWithDifferentValues(): void
    {
        $units = ['€', '$', '£', '%', 'kg', 'km', 'unités', ''];
        
        foreach ($units as $unit) {
            $this->kpi->setUnit($unit);
            $this->assertEquals($unit, $this->kpi->getUnit());
        }
    }

    public function testFluentInterface(): void
    {
        // Tester que les setters retournent l'instance pour le fluent interface
        $result = $this->kpi
            ->setName('Test KPI')
            ->setValue(50000.0)
            ->setPeriod('Q2')
            ->setUnit('€');
        
        $this->assertSame($this->kpi, $result);
    }

    public function testComplexScenario(): void
    {
        // Créer un KPI complet avec toutes les propriétés
        $document = new Document();
        
        $this->kpi
            ->setName('Chiffre d\'affaires')
            ->setValue(150000.75)
            ->setPeriod('Q3')
            ->setDocument($document)
            ->setUnit('€');

        // Vérifier toutes les propriétés
        $this->assertEquals('Chiffre d\'affaires', $this->kpi->getName());
        $this->assertEquals(150000.75, $this->kpi->getValue());
        $this->assertEquals('Q3', $this->kpi->getPeriod());
        $this->assertEquals($document, $this->kpi->getDocument());
        $this->assertEquals('€', $this->kpi->getUnit());
    }

    public function testUuidUniqueness(): void
    {
        // Vérifier que chaque KPI a un UUID unique
        $kpis = [];
        for ($i = 0; $i < 10; $i++) {
            $kpis[] = new Kpi();
        }

        $uuids = array_map(fn($kpi) => $kpi->getId()->toString(), $kpis);
        $uniqueUuids = array_unique($uuids);

        $this->assertCount(count($kpis), $uniqueUuids, 'Tous les UUIDs doivent être uniques');
    }

    public function testFloatPrecision(): void
    {
        // Tester la précision des nombres flottants
        $value = 123456.789;
        $this->kpi->setValue($value);
        
        $this->assertEquals($value, $this->kpi->getValue());
        
        // Tester avec beaucoup de décimales
        $value2 = 0.123456789;
        $this->kpi->setValue($value2);
        
        $this->assertEquals($value2, $this->kpi->getValue());
    }

    public function testStringLengthLimits(): void
    {
        // Tester les limites de longueur des chaînes
        $longName = str_repeat('A', 255); // Longueur maximale pour name
        $this->kpi->setName($longName);
        $this->assertEquals($longName, $this->kpi->getName());
        
        $longUnit = str_repeat('€', 20); // Longueur maximale pour unit
        $this->kpi->setUnit($longUnit);
        $this->assertEquals($longUnit, $this->kpi->getUnit());
        
        $longPeriod = str_repeat('Q', 10); // Longueur maximale pour period
        $this->kpi->setPeriod($longPeriod);
        $this->assertEquals($longPeriod, $this->kpi->getPeriod());
    }

    public function testNullHandling(): void
    {
        // Tester la gestion des valeurs null pour les propriétés optionnelles
        $this->kpi
            ->setValue(null)
            ->setDocument(null)
            ->setUnit(null);

        $this->assertNull($this->kpi->getValue());
        $this->assertNull($this->kpi->getDocument());
        $this->assertNull($this->kpi->getUnit());
    }

    public function testDefaultValues(): void
    {
        // Vérifier les valeurs par défaut
        $this->assertInstanceOf(Uuid::class, $this->kpi->getId());
        $this->assertNull($this->kpi->getName());
        $this->assertNull($this->kpi->getValue());
        $this->assertNull($this->kpi->getPeriod());
        $this->assertNull($this->kpi->getDocument());
        $this->assertNull($this->kpi->getUnit());
    }

    public function testDocumentRelationship(): void
    {
        $document = new Document();
        
        // Définir le document
        $this->kpi->setDocument($document);
        $this->assertEquals($document, $this->kpi->getDocument());
        
        // Changer le document
        $document2 = new Document();
        $this->kpi->setDocument($document2);
        $this->assertEquals($document2, $this->kpi->getDocument());
        
        // Supprimer le document
        $this->kpi->setDocument(null);
        $this->assertNull($this->kpi->getDocument());
    }

    public function testKpiWithAllPropertiesSet(): void
    {
        // Créer toutes les entités liées
        $document = new Document();
        
        // Configurer le KPI avec toutes les propriétés
        $this->kpi
            ->setName('EBITDA')
            ->setValue(75000.25)
            ->setPeriod('H1')
            ->setDocument($document)
            ->setUnit('€');
        
        // Vérifier toutes les propriétés
        $this->assertEquals('EBITDA', $this->kpi->getName());
        $this->assertEquals(75000.25, $this->kpi->getValue());
        $this->assertEquals('H1', $this->kpi->getPeriod());
        $this->assertEquals($document, $this->kpi->getDocument());
        $this->assertEquals('€', $this->kpi->getUnit());
    }

    public function testKpiWithFinancialData(): void
    {
        // Test avec des données financières typiques
        $financialKpis = [
            ['name' => 'Chiffre d\'affaires', 'value' => 1000000.00, 'unit' => '€'],
            ['name' => 'Marge brute', 'value' => 400000.00, 'unit' => '€'],
            ['name' => 'EBITDA', 'value' => 200000.00, 'unit' => '€'],
            ['name' => 'Résultat net', 'value' => 120000.00, 'unit' => '€'],
            ['name' => 'Taux de croissance', 'value' => 15.5, 'unit' => '%']
        ];
        
        foreach ($financialKpis as $kpiData) {
            $this->kpi
                ->setName($kpiData['name'])
                ->setValue($kpiData['value'])
                ->setUnit($kpiData['unit']);
            
            $this->assertEquals($kpiData['name'], $this->kpi->getName());
            $this->assertEquals($kpiData['value'], $this->kpi->getValue());
            $this->assertEquals($kpiData['unit'], $this->kpi->getUnit());
        }
    }

    public function testKpiWithDifferentPeriods(): void
    {
        // Test avec différentes périodes
        $periods = [
            'Q1' => 'Premier trimestre',
            'Q2' => 'Deuxième trimestre', 
            'Q3' => 'Troisième trimestre',
            'Q4' => 'Quatrième trimestre',
            'H1' => 'Premier semestre',
            'H2' => 'Deuxième semestre',
            'Y' => 'Année complète',
            'M1' => 'Janvier',
            'M2' => 'Février',
            'M12' => 'Décembre'
        ];
        
        foreach ($periods as $period => $description) {
            $this->kpi->setPeriod($period);
            $this->assertEquals($period, $this->kpi->getPeriod());
        }
    }

    public function testKpiWithSpecialCharacters(): void
    {
        // Test avec des caractères spéciaux
        $this->kpi
            ->setName('KPI avec caractères spéciaux: éàçù€$%')
            ->setValue(12345.67)
            ->setPeriod('Q1')
            ->setUnit('€/mois');
        
        $this->assertEquals('KPI avec caractères spéciaux: éàçù€$%', $this->kpi->getName());
        $this->assertEquals(12345.67, $this->kpi->getValue());
        $this->assertEquals('Q1', $this->kpi->getPeriod());
        $this->assertEquals('€/mois', $this->kpi->getUnit());
    }
}
