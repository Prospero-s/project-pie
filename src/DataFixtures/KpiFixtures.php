<?php

namespace App\DataFixtures;

use App\Entity\Kpi;
use App\Entity\Document;
use App\Entity\Company;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class KpiFixtures extends Fixture implements DependentFixtureInterface
{
    /** @var array<string> */
    private array $kpiNames = [
        'ARR',
        'ARR par Compte',
        'Revenu Moyen par Effectif',
        'Taux de Croissance',
        'Churn Rate',
        'LTV',
        'CAC',
        'Marge Brute',
        'EBITDA',
        'Burn Rate',
        'Nombre d\'employés',
        'Revenu Annuel Récurrent'
    ];

    /** @var array<string> */
    private array $periods = [
        'Q4_FY2022',
        'Q1_FY2023',
        'Q2_FY2023',
        'Q3_FY2023',
        'Q4_FY2023',
        'Q1_FY2024',
        'Q2_FY2024'
    ];

    /** @var array<string> */
    private array $units = ['€', '%', 'K€', 'M€', 'jours', 'unités'];

    public function load(ObjectManager $manager): void
    {
        // Récupérer toutes les entreprises
        $companies = $manager->getRepository(Company::class)->findAll();

        // Années pour lesquelles créer des données
        $years = [2022, 2023, 2024];

        foreach ($companies as $company) {
            // Créer des documents pour chaque année
            foreach ($years as $year) {
                $document = new Document();
                $document
                    ->setCompany($company)
                    ->setBlob('Document content for ' . $company->getDenomination() . ' - Year ' . $year)
                    ->setYear($year)
                    ->setPeriodicity('quarterly')
                    ->setStatus('published')
                    ->setFilename('financial_report_' . $company->getSiren() . '_' . $year . '.pdf');

                $manager->persist($document);

                // Générer des KPI pour ce document
                foreach ($this->kpiNames as $kpiName) {
                    foreach ($this->periods as $period) {
                        $kpi = new Kpi();
                        $kpi
                            ->setDocument($document)
                            ->setName($kpiName)
                            ->setPeriod($period)
                            ->setValue($this->generateValueForKpi($kpiName, $year))
                            ->setUnit($this->getUnitForKpi($kpiName));

                        $manager->persist($kpi);
                    }
                }
            }
        }

        $manager->flush();
    }

    private function generateValueForKpi(string $kpiName, int $year): float
    {
        // Facteur de croissance basé sur l'année (simulation de croissance)
        $growthFactor = 1 + (($year - 2022) * 0.15); // 15% de croissance par an
        
        $baseValue = match ($kpiName) {
            'ARR' => mt_rand(1000000, 5000000), // 1M à 5M€
            'ARR par Compte' => mt_rand(50000, 150000), // 50K à 150K€
            'Revenu Moyen par Effectif' => mt_rand(40000, 250000), // 40K à 250K€
            'Taux de Croissance' => mt_rand(5, 50), // 5% à 50%
            'Churn Rate' => mt_rand(1, 15), // 1% à 15%
            'LTV' => mt_rand(50000, 300000), // 50K à 300K€
            'CAC' => mt_rand(5000, 25000), // 5K à 25K€
            'Marge Brute' => mt_rand(40, 80), // 40% à 80%
            'EBITDA' => mt_rand(100000, 1000000), // 100K à 1M€
            'Burn Rate' => mt_rand(50000, 200000), // 50K à 200K€
            'Nombre d\'employés' => mt_rand(100, 1000),
            'Revenu Annuel Récurrent' => mt_rand(500000, 5000000), // 500K à 5M€
            default => mt_rand(1000, 100000),
        };

        // Appliquer le facteur de croissance (sauf pour les pourcentages négatifs comme Churn Rate)
        if (!in_array($kpiName, ['Churn Rate', 'Taux de Croissance', 'Marge Brute'])) {
            $baseValue = $baseValue * $growthFactor;
        }

        return $baseValue;
    }

    private function getUnitForKpi(string $kpiName): string
    {
        switch ($kpiName) {
            case 'ARR':
            case 'ARR par Compte':
            case 'Revenu Moyen par Effectif':
            case 'LTV':
            case 'CAC':
            case 'EBITDA':
            case 'Burn Rate':
            case 'Revenu Annuel Récurrent':
                return '€';
            case 'Taux de Croissance':
            case 'Churn Rate':
            case 'Marge Brute':
                return '%';
            case 'Nombre d\'employés':
                return 'personnes';
            default:
                return '';
        }
    }

    public function getDependencies(): array
    {
        return [
            CompanyFixtures::class,
        ];
    }
} 