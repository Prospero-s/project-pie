<?php

namespace App\DataFixtures\Demo\Investment;

use App\Entity\Company;
use App\Entity\CompanyInvestment;
use App\Entity\User;
use App\Entity\UserGroup;
use App\DataFixtures\Demo\Common\DemoDataLoader;
use Doctrine\Persistence\ObjectManager;

class DemoInvestmentFixture
{
    private DemoDataLoader $dataLoader;
    /**
     * @var array<string, mixed>
     */
    private array $investmentConfig;

    public function __construct(DemoDataLoader $dataLoader)
    {
        $this->dataLoader = $dataLoader;
        $this->investmentConfig = $this->dataLoader->loadInvestmentConfig();
    }

    /**
     * @param Company[] $companies
     * @return CompanyInvestment[]
     */
    public function createInvestmentsForCompanies(
        ObjectManager $manager, 
        array $companies, 
        User $user, 
        UserGroup $group
    ): array {
        $investments = [];
        
        foreach ($companies as $company) {
            $companyInvestments = $this->createInvestmentsForCompany($company, $user, $group);
            
            foreach ($companyInvestments as $investment) {
                $manager->persist($investment);
                $investments[] = $investment;
            }
        }

        return $investments;
    }

    /**
     * @return CompanyInvestment[]
     */
    private function createInvestmentsForCompany(Company $company, User $user, UserGroup $group): array
    {
        $rules = $this->investmentConfig['investmentRules'];
        $numberOfInvestments = mt_rand(
            $rules['minInvestmentsPerCompany'], 
            $rules['maxInvestmentsPerCompany']
        );
        
        $investments = [];
        
        for ($i = 0; $i < $numberOfInvestments; $i++) {
            $investment = $this->createInvestment($company, $user, $group, $i);
            $investments[] = $investment;
        }

        return $investments;
    }

    private function createInvestment(Company $company, User $user, UserGroup $group, int $round): CompanyInvestment
    {
        $investment = new CompanyInvestment();
        
        // Montants réalistes selon le type de financement et la taille de l'entreprise
        $baseAmount = $this->getBaseAmountForSector($company->getSector());
        $roundMultiplier = $this->investmentConfig['investmentRules']['roundMultiplier'];
        $amount = $baseAmount * (1 + $round * $roundMultiplier);
        
        // Date d'investissement réaliste
        $rules = $this->investmentConfig['investmentRules'];
        $daysAgo = mt_rand($rules['minDaysAgo'], $rules['maxDaysAgo']);
        $investedAt = new \DateTime();
        $investedAt->modify("-{$daysAgo} days");

        $investment->setCompany($company)
                  ->setUser($user)
                  ->setUserGroup($group)
                  ->setFundingType($this->getRandomFundingType())
                  ->setAmount((int) $amount)
                  ->setCurrency($rules['currency'])
                  ->setInvestedAt($investedAt);

        return $investment;
    }

    private function getBaseAmountForSector(string $sector): float
    {
        $sectorAmounts = $this->investmentConfig['sectorBaseAmounts'];
        return $sectorAmounts[$sector] ?? 1000000; // Default 1M €
    }

    private function getRandomFundingType(): string
    {
        $fundingTypes = $this->investmentConfig['fundingTypes'];
        return $fundingTypes[array_rand($fundingTypes)];
    }

    /**
     * @param CompanyInvestment[] $investments
     */
    public function calculateTotalPortfolioValue(array $investments): int
    {
        $total = 0;
        foreach ($investments as $investment) {
            $total += $investment->getAmount();
        }
        return $total;
    }

    /**
     * @return string[]
     */
    public function getFundingTypes(): array
    {
        return $this->investmentConfig['fundingTypes'];
    }
} 