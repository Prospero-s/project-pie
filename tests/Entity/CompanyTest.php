<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Company;
use App\Entity\CompanyAddress;
use App\Entity\CompanyInvestment;
use App\Entity\Representative;
use PHPUnit\Framework\TestCase;
use Doctrine\Common\Collections\ArrayCollection;

class CompanyTest extends TestCase
{
    private Company $company;

    protected function setUp(): void
    {
        $this->company = new Company();
    }

    public function testConstructor(): void
    {
        // Vérifier que les collections sont initialisées
        $this->assertInstanceOf(ArrayCollection::class, $this->company->getRepresentatives());
        $this->assertInstanceOf(ArrayCollection::class, $this->company->getInvestments());
        
        // Vérifier que createdAt est initialisé
        $this->assertInstanceOf(\DateTimeImmutable::class, $this->company->getCreatedAt());
        
        // Vérifier que l'ID est null par défaut (généré par Doctrine)
        $this->assertNull($this->company->getId());
    }

    public function testIdGetter(): void
    {
        // L'ID est généré automatiquement par Doctrine, on ne peut que le récupérer
        $this->assertNull($this->company->getId());
    }

    public function testSirenGetterAndSetter(): void
    {
        $siren = '123456789';
        $this->company->setSiren($siren);
        
        $this->assertEquals($siren, $this->company->getSiren());
    }

    public function testDenominationGetterAndSetter(): void
    {
        $denomination = 'Test Company SARL';
        $this->company->setDenomination($denomination);
        
        $this->assertEquals($denomination, $this->company->getDenomination());
    }

    public function testBusinessStructuresGetterAndSetter(): void
    {
        $businessStructures = 'SARL';
        $this->company->setBusinessStructures($businessStructures);
        
        $this->assertEquals($businessStructures, $this->company->getBusinessStructures());
    }

    public function testBusinessStructuresWithNull(): void
    {
        $this->company->setBusinessStructures(null);
        
        $this->assertNull($this->company->getBusinessStructures());
    }

    public function testCodeApeGetterAndSetter(): void
    {
        $codeApe = '6201Z';
        $this->company->setCodeApe($codeApe);
        
        $this->assertEquals($codeApe, $this->company->getCodeApe());
    }

    public function testCodeApeWithNull(): void
    {
        $this->company->setCodeApe(null);
        
        $this->assertNull($this->company->getCodeApe());
    }

    public function testSiretGetterAndSetter(): void
    {
        $siret = '12345678901234';
        $this->company->setSiret($siret);
        
        $this->assertEquals($siret, $this->company->getSiret());
    }

    public function testSiretWithNull(): void
    {
        $this->company->setSiret(null);
        
        $this->assertNull($this->company->getSiret());
    }

    public function testSectorGetterAndSetter(): void
    {
        $sector = 'Technology';
        $this->company->setSector($sector);
        
        $this->assertEquals($sector, $this->company->getSector());
    }

    public function testSectorWithNull(): void
    {
        $this->company->setSector(null);
        
        $this->assertNull($this->company->getSector());
    }

    public function testUpdatedAtGetterAndSetter(): void
    {
        $updatedAt = new \DateTime('2024-01-15 10:30:00');
        $this->company->setUpdatedAt($updatedAt);
        
        $this->assertEquals($updatedAt, $this->company->getUpdatedAt());
    }

    public function testCreatedAtGetterAndSetter(): void
    {
        $createdAt = new \DateTimeImmutable('2024-01-01 00:00:00');
        $this->company->setCreatedAt($createdAt);
        
        $this->assertEquals($createdAt, $this->company->getCreatedAt());
    }

    public function testDeletedAtGetterAndSetter(): void
    {
        $deletedAt = new \DateTimeImmutable('2024-12-31 23:59:59');
        $this->company->setDeletedAt($deletedAt);
        
        $this->assertEquals($deletedAt, $this->company->getDeletedAt());
    }

    public function testAddressGetterAndSetter(): void
    {
        $address = new CompanyAddress();
        $this->company->setAddress($address);
        
        $this->assertEquals($address, $this->company->getAddress());
    }

    public function testAddressWithNull(): void
    {
        $this->company->setAddress(null);
        
        $this->assertNull($this->company->getAddress());
    }

    public function testInvestmentsCollection(): void
    {
        // Vérifier que la collection est vide au départ
        $this->assertCount(0, $this->company->getInvestments());
        
        // Ajouter un investissement
        $investment = new CompanyInvestment();
        $this->company->addInvestment($investment);
        
        $this->assertCount(1, $this->company->getInvestments());
        $this->assertTrue($this->company->getInvestments()->contains($investment));
        
        // Vérifier que l'investissement a bien la company définie
        $this->assertEquals($this->company, $investment->getCompany());
    }

    public function testAddInvestmentDuplicate(): void
    {
        $investment = new CompanyInvestment();
        
        // Ajouter le même investissement deux fois
        $this->company->addInvestment($investment);
        $this->company->addInvestment($investment);
        
        // Vérifier qu'il n'y a qu'une seule occurrence
        $this->assertCount(1, $this->company->getInvestments());
    }

    public function testRepresentativesCollection(): void
    {
        // Vérifier que la collection est vide au départ
        $this->assertCount(0, $this->company->getRepresentatives());
        
        // Ajouter un représentant
        $representative = new Representative();
        $this->company->addRepresentative($representative);
        
        $this->assertCount(1, $this->company->getRepresentatives());
        $this->assertTrue($this->company->getRepresentatives()->contains($representative));
        
        // Vérifier que le représentant a bien la company définie
        $this->assertEquals($this->company, $representative->getCompany());
    }

    public function testAddRepresentativeDuplicate(): void
    {
        $representative = new Representative();
        
        // Ajouter le même représentant deux fois
        $this->company->addRepresentative($representative);
        $this->company->addRepresentative($representative);
        
        // Vérifier qu'il n'y a qu'une seule occurrence
        $this->assertCount(1, $this->company->getRepresentatives());
    }

    public function testFluentInterface(): void
    {
        // Tester que les setters retournent l'instance pour le fluent interface
        $result = $this->company
            ->setSiren('123456789')
            ->setDenomination('Test Company')
            ->setSector('Technology')
            ->setBusinessStructures('SARL');
        
        $this->assertSame($this->company, $result);
    }

    public function testMultipleInvestments(): void
    {
        $investment1 = new CompanyInvestment();
        $investment2 = new CompanyInvestment();
        $investment3 = new CompanyInvestment();
        
        $this->company->addInvestment($investment1);
        $this->company->addInvestment($investment2);
        $this->company->addInvestment($investment3);
        
        $this->assertCount(3, $this->company->getInvestments());
        $this->assertTrue($this->company->getInvestments()->contains($investment1));
        $this->assertTrue($this->company->getInvestments()->contains($investment2));
        $this->assertTrue($this->company->getInvestments()->contains($investment3));
    }

    public function testMultipleRepresentatives(): void
    {
        $representative1 = new Representative();
        $representative2 = new Representative();
        $representative3 = new Representative();
        
        $this->company->addRepresentative($representative1);
        $this->company->addRepresentative($representative2);
        $this->company->addRepresentative($representative3);
        
        $this->assertCount(3, $this->company->getRepresentatives());
        $this->assertTrue($this->company->getRepresentatives()->contains($representative1));
        $this->assertTrue($this->company->getRepresentatives()->contains($representative2));
        $this->assertTrue($this->company->getRepresentatives()->contains($representative3));
    }

    public function testComplexScenario(): void
    {
        // Créer une entreprise complète avec toutes les propriétés
        $this->company
            ->setSiren('123456789')
            ->setDenomination('Tech Solutions SARL')
            ->setBusinessStructures('SARL')
            ->setCodeApe('6201Z')
            ->setSiret('12345678901234')
            ->setSector('Technology')
            ->setUpdatedAt(new \DateTime('2024-01-15 10:30:00'))
            ->setCreatedAt(new \DateTimeImmutable('2024-01-01 00:00:00'));

        // Ajouter une adresse
        $address = new CompanyAddress();
        $this->company->setAddress($address);

        // Ajouter des investissements
        $investment1 = new CompanyInvestment();
        $investment2 = new CompanyInvestment();
        $this->company->addInvestment($investment1);
        $this->company->addInvestment($investment2);

        // Ajouter des représentants
        $representative1 = new Representative();
        $representative2 = new Representative();
        $this->company->addRepresentative($representative1);
        $this->company->addRepresentative($representative2);

        // Vérifier toutes les propriétés
        $this->assertEquals('123456789', $this->company->getSiren());
        $this->assertEquals('Tech Solutions SARL', $this->company->getDenomination());
        $this->assertEquals('SARL', $this->company->getBusinessStructures());
        $this->assertEquals('6201Z', $this->company->getCodeApe());
        $this->assertEquals('12345678901234', $this->company->getSiret());
        $this->assertEquals('Technology', $this->company->getSector());
        $this->assertEquals($address, $this->company->getAddress());
        $this->assertCount(2, $this->company->getInvestments());
        $this->assertCount(2, $this->company->getRepresentatives());

        // Marquer comme supprimé
        $deletedAt = new \DateTimeImmutable('2024-12-31 23:59:59');
        $this->company->setDeletedAt($deletedAt);

        $this->assertEquals($deletedAt, $this->company->getDeletedAt());
    }

    public function testDateTimeTypes(): void
    {
        // Vérifier que updatedAt accepte DateTime
        $updatedAt = new \DateTime();
        $this->company->setUpdatedAt($updatedAt);
        $this->assertInstanceOf(\DateTime::class, $this->company->getUpdatedAt());

        // Vérifier que createdAt accepte DateTimeImmutable
        $createdAt = new \DateTimeImmutable();
        $this->company->setCreatedAt($createdAt);
        $this->assertInstanceOf(\DateTimeImmutable::class, $this->company->getCreatedAt());

        // Vérifier que deletedAt accepte DateTimeImmutable
        $deletedAt = new \DateTimeImmutable();
        $this->company->setDeletedAt($deletedAt);
        $this->assertInstanceOf(\DateTimeImmutable::class, $this->company->getDeletedAt());
    }

    public function testCollectionTypes(): void
    {
        // Vérifier que les collections sont du bon type
        $this->assertInstanceOf(\Doctrine\Common\Collections\Collection::class, $this->company->getInvestments());
        $this->assertInstanceOf(\Doctrine\Common\Collections\Collection::class, $this->company->getRepresentatives());
    }

    public function testNullHandling(): void
    {
        // Tester la gestion des valeurs null pour les propriétés optionnelles
        $this->company
            ->setBusinessStructures(null)
            ->setCodeApe(null)
            ->setSiret(null)
            ->setSector(null)
            ->setAddress(null);

        $this->assertNull($this->company->getBusinessStructures());
        $this->assertNull($this->company->getCodeApe());
        $this->assertNull($this->company->getSiret());
        $this->assertNull($this->company->getSector());
        $this->assertNull($this->company->getAddress());
    }

    /**
     * Test pour vérifier le comportement problématique de deletedAt avec null
     * L'entité a un problème de type - getDeletedAt() retourne \DateTimeImmutable mais devrait retourner ?\DateTimeImmutable
     */
    public function testDeletedAtWithNullThrowsException(): void
    {
        $this->company->setDeletedAt(null);
        
        // L'entité actuelle lance une TypeError quand on essaie de récupérer deletedAt quand il est null
        $this->expectException(\TypeError::class);
        $this->company->getDeletedAt();
    }

    /**
     * Test pour vérifier que les méthodes removeInvestment et removeRepresentative
     * lancent des exceptions à cause des relations non-nullables
     */
    public function testRemoveInvestmentThrowsException(): void
    {
        $investment = new CompanyInvestment();
        $this->company->addInvestment($investment);
        
        // La méthode removeInvestment essaie de passer null à setCompany() ce qui cause une erreur
        $this->expectException(\TypeError::class);
        $this->company->removeInvestment($investment);
    }

    public function testRemoveRepresentativeThrowsException(): void
    {
        $representative = new Representative();
        $this->company->addRepresentative($representative);
        
        // La méthode removeRepresentative essaie de passer null à setCompany() ce qui cause une erreur
        $this->expectException(\TypeError::class);
        $this->company->removeRepresentative($representative);
    }
}
