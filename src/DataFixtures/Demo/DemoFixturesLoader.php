<?php

namespace App\DataFixtures\Demo;

use App\Entity\Company;
use App\Entity\CompanyInvestment;
use App\DataFixtures\Demo\Common\DemoCleanupService;
use App\DataFixtures\Demo\Common\DemoDataLoader;
use App\DataFixtures\Demo\User\DemoUserFixture;
use App\DataFixtures\Demo\Company\DemoCompanyFixture;
use App\DataFixtures\Demo\Investment\DemoInvestmentFixture;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;

class DemoFixturesLoader extends Fixture implements FixtureGroupInterface
{
    private DemoCleanupService $cleanupService;
    private DemoDataLoader $dataLoader;
    private DemoUserFixture $userFixture;
    private DemoCompanyFixture $companyFixture;
    private DemoInvestmentFixture $investmentFixture;

    public function __construct()
    {
        $this->cleanupService = new DemoCleanupService();
        $this->dataLoader = new DemoDataLoader();
        $this->userFixture = new DemoUserFixture($this->dataLoader);
        $this->companyFixture = new DemoCompanyFixture($this->dataLoader);
        $this->investmentFixture = new DemoInvestmentFixture($this->dataLoader);
    }

    public function load(ObjectManager $manager): void
    {
        // 1. Nettoyer les données existantes
        $this->cleanupService->cleanupExistingDemoData($manager);

        // 2. Créer l'utilisateur demo
        $demoUser = $this->userFixture->createDemoUser($manager);
        $manager->persist($demoUser);
        $manager->flush(); // Flush pour obtenir l'ID de l'utilisateur
        
        // 3. Créer le groupe demo
        $demoGroup = $this->userFixture->createDemoGroup($manager, $demoUser);
        $manager->persist($demoGroup);
        $manager->flush(); // Flush pour obtenir l'ID du groupe
        
        // 4. Assigner l'utilisateur au groupe
        $demoUser->setUserGroup($demoGroup);
        $demoGroup->addUser($demoUser);
        
        // 5. Créer les paramètres de notification
        $notificationSettings = $this->userFixture->createNotificationSettings($manager, $demoUser);
        $manager->persist($notificationSettings);
        
        // 6. Créer les entreprises avec leurs détails
        $companies = $this->companyFixture->createCompaniesWithDetails($manager);
        
        // 7. Créer les investissements
        $investments = $this->investmentFixture->createInvestmentsForCompanies(
            $manager, 
            $companies, 
            $demoUser, 
            $demoGroup
        );
        
        // 8. Sauvegarder tout
        $manager->flush();

        // 9. Afficher le résumé
        $this->displaySummary($companies, $investments);
    }

    /**
     * @param Company[] $companies
     * @param CompanyInvestment[] $investments
     */
    private function displaySummary(array $companies, array $investments): void
    {
        $totalValue = $this->investmentFixture->calculateTotalPortfolioValue($investments);
        $companiesCount = count($companies);
        $investmentsCount = count($investments);

        echo "\n" . str_repeat("=", 50) . "\n";
        echo "🎯 RÉSUMÉ DU COMPTE DE DÉMONSTRATION\n";
        echo str_repeat("=", 50) . "\n";
        echo "📊 Entreprises créées: {$companiesCount}\n";
        echo "💰 Investissements créés: {$investmentsCount}\n";
        echo "💼 Valeur totale du portefeuille: " . number_format($totalValue / 1000000, 1) . "M EUR\n";
        echo "🏷️  Types de financement: " . implode(', ', $this->investmentFixture->getFundingTypes()) . "\n";
        echo str_repeat("=", 50) . "\n\n";
    }

    /**
     * @return string[]
     */
    public static function getGroups(): array
    {
        return ['demo'];
    }
} 