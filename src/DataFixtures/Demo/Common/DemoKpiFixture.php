<?php

namespace App\DataFixtures\Demo\Common;

use App\Entity\Company;
use App\Entity\Document;
use App\Entity\Kpi;
use App\Entity\UserGroup;
use Doctrine\Persistence\ObjectManager;

class DemoKpiFixture
{
    /**
     * @param Company[] $companies
     */
    public function createKpisForCompanies(ObjectManager $manager, array $companies): void
    {
        // Récupère le UserGroup "Demo Portfolio"
        $demoGroup = $manager->getRepository(UserGroup::class)
            ->findOneBy(['name' => 'Demo Portfolio']);

        if (!$demoGroup) {
            throw new \Exception('Le groupe "Demo Portfolio" n\'existe pas dans la base de données.');
        }

        foreach ($companies as $company) {
            for ($year = 2020; $year <= date('Y'); $year++) {
                for ($period = 1; $period <= 3; $period++) {
                    $statuses = ['draft', 'validated'];
                    $randomStatus = $statuses[array_rand($statuses)];

                    $document = new Document();
                    $document->setCompany($company);
                    $document->setYear($year);
                    $document->setBlob('DEMO');
                    $document->setPeriodicity('quarterly');
                    $document->setUserGroup($demoGroup);
                    $document->setStatus($randomStatus);
                    $manager->persist($document);

                    // Créer un KPI "Argent brûlé" pour ce document/période
                    $kpi = new Kpi();
                    $kpi->setDocument($document);
                    $kpi->setName('Argent brûlé');
                    $kpi->setPeriod($period);
                    $kpi->setValue(mt_rand(10000, 50000)); // Valeur aléatoire
                    $kpi->setUnit('€');
                    $manager->persist($kpi);

                    // KPI Nombre d'employés (headcount)
                    $kpiHeadcount = new Kpi();
                    $kpiHeadcount->setDocument($document);
                    $kpiHeadcount->setName("Nombre d'employés");
                    $kpiHeadcount->setPeriod($period);
                    $kpiHeadcount->setValue(mt_rand(10, 500));
                    $kpiHeadcount->setUnit('personnes');
                    $manager->persist($kpiHeadcount);

                    // KPI Revenu Annuel Récurrent (monthly_revenue)
                    $kpiRevenue = new Kpi();
                    $kpiRevenue->setDocument($document);
                    $kpiRevenue->setName('Revenu Annuel Récurrent');
                    $kpiRevenue->setPeriod($period);
                    $kpiRevenue->setValue(mt_rand(100000, 1000000));
                    $kpiRevenue->setUnit('€');
                    $manager->persist($kpiRevenue);
                }
            }
        }
    }
}
