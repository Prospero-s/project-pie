<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Document;
use App\Entity\Company;
use App\Entity\UserGroup;
use App\Entity\Kpi;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Uid\Uuid;
use Doctrine\Common\Collections\ArrayCollection;

class DocumentTest extends TestCase
{
    private Document $document;

    protected function setUp(): void
    {
        $this->document = new Document();
    }

    public function testConstructor(): void
    {
        // Vérifier que l'ID UUID est généré
        $this->assertInstanceOf(Uuid::class, $this->document->getId());
        
        // Vérifier que addDate est initialisé
        $this->assertInstanceOf(\DateTimeInterface::class, $this->document->getAddDate());
        
        // Vérifier que la collection kpis est initialisée
        $this->assertInstanceOf(ArrayCollection::class, $this->document->getKpis());
        
        // Vérifier que le statut par défaut est 'draft'
        $this->assertEquals('draft', $this->document->getStatus());
    }

    public function testIdGetter(): void
    {
        // L'ID est généré automatiquement dans le constructeur
        $this->assertInstanceOf(Uuid::class, $this->document->getId());
        
        // Vérifier que l'ID est unique pour chaque instance
        $document2 = new Document();
        $this->assertNotEquals($this->document->getId(), $document2->getId());
    }

    public function testBlobGetterAndSetter(): void
    {
        $blob = 'base64_encoded_pdf_content';
        $this->document->setBlob($blob);
        
        $this->assertEquals($blob, $this->document->getBlob());
    }

    public function testBlobWithNull(): void
    {
        // Le blob peut être null selon la définition de l'entité
        $this->document->setBlob('');
        $this->assertEquals('', $this->document->getBlob());
    }

    public function testAddDateGetterAndSetter(): void
    {
        $addDate = new \DateTime('2024-01-15 10:30:00');
        $this->document->setAddDate($addDate);
        
        $this->assertEquals($addDate, $this->document->getAddDate());
    }

    public function testAddDateWithDateTimeImmutable(): void
    {
        $addDate = new \DateTimeImmutable('2024-01-15 10:30:00');
        $this->document->setAddDate($addDate);
        
        $this->assertEquals($addDate, $this->document->getAddDate());
    }

    public function testYearGetterAndSetter(): void
    {
        $year = 2024;
        $this->document->setYear($year);
        
        $this->assertEquals($year, $this->document->getYear());
    }

    public function testYearWithZero(): void
    {
        $year = 0;
        $this->document->setYear($year);
        
        $this->assertEquals($year, $this->document->getYear());
    }

    public function testPeriodicityGetterAndSetter(): void
    {
        $periodicity = 'Q';
        $this->document->setPeriodicity($periodicity);
        
        $this->assertEquals($periodicity, $this->document->getPeriodicity());
    }

    public function testPeriodicityWithDifferentValues(): void
    {
        $periodicities = ['Q', 'H', 'Y', 'M'];
        
        foreach ($periodicities as $periodicity) {
            $this->document->setPeriodicity($periodicity);
            $this->assertEquals($periodicity, $this->document->getPeriodicity());
        }
    }

    public function testStatusGetterAndSetter(): void
    {
        $status = 'validated';
        $this->document->setStatus($status);
        
        $this->assertEquals($status, $this->document->getStatus());
    }

    public function testStatusWithDifferentValues(): void
    {
        $statuses = ['draft', 'validated', 'archived'];
        
        foreach ($statuses as $status) {
            $this->document->setStatus($status);
            $this->assertEquals($status, $this->document->getStatus());
        }
    }

    public function testCompanyGetterAndSetter(): void
    {
        $company = new Company();
        $this->document->setCompany($company);
        
        $this->assertEquals($company, $this->document->getCompany());
    }

    public function testCompanyWithNull(): void
    {
        // La relation Company est nullable selon l'annotation
        $this->document->setCompany(null);
        
        $this->assertNull($this->document->getCompany());
    }

    public function testUserGroupGetterAndSetter(): void
    {
        $userGroup = new UserGroup();
        $this->document->setUserGroup($userGroup);
        
        $this->assertEquals($userGroup, $this->document->getUserGroup());
    }

    public function testUserGroupWithNull(): void
    {
        // La relation UserGroup est nullable selon l'annotation
        $this->document->setUserGroup(null);
        
        $this->assertNull($this->document->getUserGroup());
    }

    public function testFilenameGetterAndSetter(): void
    {
        $filename = 'document_2024.pdf';
        $this->document->setFilename($filename);
        
        $this->assertEquals($filename, $this->document->getFilename());
    }

    public function testFilenameWithNull(): void
    {
        // Le filename est nullable selon l'annotation
        $this->document->setFilename(null);
        
        $this->assertNull($this->document->getFilename());
    }

    public function testKpisCollection(): void
    {
        // Vérifier que la collection est vide au départ
        $this->assertCount(0, $this->document->getKpis());
        
        // Ajouter un KPI
        $kpi = new Kpi();
        $this->document->addKpi($kpi);
        
        $this->assertCount(1, $this->document->getKpis());
        $this->assertTrue($this->document->getKpis()->contains($kpi));
        
        // Vérifier que le KPI a bien le document défini
        $this->assertEquals($this->document, $kpi->getDocument());
    }

    public function testAddKpiDuplicate(): void
    {
        $kpi = new Kpi();
        
        // Ajouter le même KPI deux fois
        $this->document->addKpi($kpi);
        $this->document->addKpi($kpi);
        
        // Vérifier qu'il n'y a qu'une seule occurrence
        $this->assertCount(1, $this->document->getKpis());
    }

    public function testRemoveKpi(): void
    {
        $kpi = new Kpi();
        $this->document->addKpi($kpi);
        
        // Vérifier qu'il y a un KPI
        $this->assertCount(1, $this->document->getKpis());
        
        // Supprimer le KPI
        $this->document->removeKpi($kpi);
        
        // Vérifier que la collection est vide
        $this->assertCount(0, $this->document->getKpis());
        
        // Vérifier que le KPI n'a plus de document
        $this->assertNull($kpi->getDocument());
    }

    public function testRemoveKpiNotInCollection(): void
    {
        $kpi = new Kpi();
        
        // Essayer de supprimer un KPI qui n'est pas dans la collection
        $this->document->removeKpi($kpi);
        
        // Vérifier que la collection reste vide
        $this->assertCount(0, $this->document->getKpis());
    }

    public function testMultipleKpis(): void
    {
        $kpi1 = new Kpi();
        $kpi2 = new Kpi();
        $kpi3 = new Kpi();
        
        $this->document->addKpi($kpi1);
        $this->document->addKpi($kpi2);
        $this->document->addKpi($kpi3);
        
        $this->assertCount(3, $this->document->getKpis());
        $this->assertTrue($this->document->getKpis()->contains($kpi1));
        $this->assertTrue($this->document->getKpis()->contains($kpi2));
        $this->assertTrue($this->document->getKpis()->contains($kpi3));
    }

    public function testFluentInterface(): void
    {
        // Tester que les setters retournent l'instance pour le fluent interface
        $result = $this->document
            ->setBlob('test_blob')
            ->setYear(2024)
            ->setPeriodicity('Q')
            ->setStatus('validated')
            ->setFilename('test.pdf');
        
        $this->assertSame($this->document, $result);
    }

    public function testComplexScenario(): void
    {
        // Créer un document complet avec toutes les propriétés
        $company = new Company();
        $userGroup = new UserGroup();
        
        $this->document
            ->setBlob('base64_encoded_pdf_content')
            ->setYear(2024)
            ->setPeriodicity('Q')
            ->setStatus('validated')
            ->setCompany($company)
            ->setUserGroup($userGroup)
            ->setFilename('financial_report_2024.pdf');

        // Ajouter des KPIs
        $kpi1 = new Kpi();
        $kpi2 = new Kpi();
        $this->document->addKpi($kpi1);
        $this->document->addKpi($kpi2);

        // Vérifier toutes les propriétés
        $this->assertEquals('base64_encoded_pdf_content', $this->document->getBlob());
        $this->assertEquals(2024, $this->document->getYear());
        $this->assertEquals('Q', $this->document->getPeriodicity());
        $this->assertEquals('validated', $this->document->getStatus());
        $this->assertEquals($company, $this->document->getCompany());
        $this->assertEquals($userGroup, $this->document->getUserGroup());
        $this->assertEquals('financial_report_2024.pdf', $this->document->getFilename());
        $this->assertCount(2, $this->document->getKpis());

        // Supprimer un KPI
        $this->document->removeKpi($kpi1);

        $this->assertCount(1, $this->document->getKpis());
        $this->assertNull($kpi1->getDocument());
        $this->assertEquals($this->document, $kpi2->getDocument());
    }

    public function testUuidUniqueness(): void
    {
        // Vérifier que chaque document a un UUID unique
        $documents = [];
        for ($i = 0; $i < 10; $i++) {
            $documents[] = new Document();
        }

        $uuids = array_map(fn($doc) => $doc->getId()->toString(), $documents);
        $uniqueUuids = array_unique($uuids);

        $this->assertCount(count($documents), $uniqueUuids, 'Tous les UUIDs doivent être uniques');
    }

    public function testDateTimeTypes(): void
    {
        // Vérifier que addDate accepte DateTime
        $dateTime = new \DateTime();
        $this->document->setAddDate($dateTime);
        $this->assertInstanceOf(\DateTimeInterface::class, $this->document->getAddDate());

        // Vérifier que addDate accepte DateTimeImmutable
        $dateTimeImmutable = new \DateTimeImmutable();
        $this->document->setAddDate($dateTimeImmutable);
        $this->assertInstanceOf(\DateTimeInterface::class, $this->document->getAddDate());
    }

    public function testCollectionTypes(): void
    {
        // Vérifier que la collection kpis est du bon type
        $this->assertInstanceOf(\Doctrine\Common\Collections\Collection::class, $this->document->getKpis());
    }

    public function testNullHandling(): void
    {
        // Tester la gestion des valeurs null pour les propriétés optionnelles
        $this->document
            ->setCompany(null)
            ->setUserGroup(null)
            ->setFilename(null);

        $this->assertNull($this->document->getCompany());
        $this->assertNull($this->document->getUserGroup());
        $this->assertNull($this->document->getFilename());
    }

    public function testDefaultValues(): void
    {
        // Vérifier les valeurs par défaut
        $this->assertEquals('draft', $this->document->getStatus());
        $this->assertInstanceOf(\DateTimeInterface::class, $this->document->getAddDate());
        $this->assertInstanceOf(Uuid::class, $this->document->getId());
        $this->assertCount(0, $this->document->getKpis());
    }

    public function testKpiRelationshipBidirectional(): void
    {
        $kpi = new Kpi();
        
        // Ajouter le KPI au document
        $this->document->addKpi($kpi);
        
        // Vérifier que le KPI a bien le document défini
        $this->assertEquals($this->document, $kpi->getDocument());
        
        // Supprimer le KPI du document
        $this->document->removeKpi($kpi);
        
        // Vérifier que le KPI n'a plus de document
        $this->assertNull($kpi->getDocument());
    }

    public function testKpiRelationshipWithExistingDocument(): void
    {
        $kpi = new Kpi();
        $kpi->setDocument($this->document);
        
        // Ajouter le KPI au document
        $this->document->addKpi($kpi);
        
        // Vérifier que le KPI est dans la collection
        $this->assertTrue($this->document->getKpis()->contains($kpi));
        $this->assertEquals($this->document, $kpi->getDocument());
    }

    public function testDocumentWithAllRelationships(): void
    {
        // Créer toutes les entités liées
        $company = new Company();
        $userGroup = new UserGroup();
        $kpi1 = new Kpi();
        $kpi2 = new Kpi();
        
        // Configurer le document avec toutes les relations
        $this->document
            ->setCompany($company)
            ->setUserGroup($userGroup)
            ->addKpi($kpi1)
            ->addKpi($kpi2);
        
        // Vérifier toutes les relations
        $this->assertEquals($company, $this->document->getCompany());
        $this->assertEquals($userGroup, $this->document->getUserGroup());
        $this->assertCount(2, $this->document->getKpis());
        $this->assertEquals($this->document, $kpi1->getDocument());
        $this->assertEquals($this->document, $kpi2->getDocument());
    }
}
