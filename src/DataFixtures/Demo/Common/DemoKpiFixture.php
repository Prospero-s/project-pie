<?php

namespace App\DataFixtures\Demo\Common;

use App\Entity\Company;
use App\Entity\Document;
use App\Entity\Kpi;
use Doctrine\Persistence\ObjectManager;

class DemoKpiFixture
{
    /**
     * @param Company[] $companies
     */
    public function createKpisForCompanies(ObjectManager $manager, array $companies): void
    {
        foreach ($companies as $company) {
            // Créer un document pour chaque année/période
            for ($year = 2022; $year <= 2024; $year++) {
                for ($period = 1; $period <= 4; $period++) {
                    $document = new Document();
                    $document->setCompany($company);
                    $document->setYear($year);
                    $document->setBlob('DEMO');
                    $document->setPeriodicity('quarterly');
                    $manager->persist($document);

                    // Créer un KPI \"Argent brûlé\" pour ce document/période
                    $kpi = new Kpi();
                    $kpi->setDocument($document);
                    $kpi->setName('Argent brûlé');
                    $kpi->setPeriod($period);
                    $kpi->setValue(mt_rand(10000, 50000)); // Valeur aléatoire
                    $kpi->setUnit('€');
                    $manager->persist($kpi);
                }
            }
        }
    }
}
