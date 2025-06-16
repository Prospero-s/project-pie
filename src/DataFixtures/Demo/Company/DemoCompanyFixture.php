<?php

namespace App\DataFixtures\Demo\Company;

use App\Entity\Company;
use App\Entity\CompanyAddress;
use App\Entity\Representative;
use App\DataFixtures\Demo\Common\DemoDataLoader;
use Doctrine\Persistence\ObjectManager;

class DemoCompanyFixture
{
    private DemoDataLoader $dataLoader;
    private array $companiesData;

    public function __construct(DemoDataLoader $dataLoader)
    {
        $this->dataLoader = $dataLoader;
        $this->companiesData = $this->dataLoader->loadCompaniesData();
    }

    public function createCompaniesWithDetails(ObjectManager $manager): array
    {
        $companies = [];
        
        foreach ($this->companiesData['companies'] as $companyData) {
            // Créer l'entreprise
            $company = $this->createCompany($companyData);
            $manager->persist($company);

            // Créer l'adresse
            $address = $this->createCompanyAddress($company, $companyData['address']);
            $company->setAddress($address);
            $manager->persist($address);

            // Créer le représentant
            $representative = $this->createRepresentative($company, $companyData['representative']);
            $manager->persist($representative);

            $companies[] = $company;
        }

        return $companies;
    }

    private function createCompany(array $companyData): Company
    {
        $company = new Company();
        $company->setSiren($companyData['siren'])
                ->setSiret($companyData['siret'])
                ->setDenomination($companyData['denomination'])
                ->setBusinessStructures($companyData['businessStructure'])
                ->setCodeApe($companyData['codeApe'])
                ->setSector($companyData['sector'])
                ->setUpdatedAt(new \DateTime());

        return $company;
    }

    private function createCompanyAddress(Company $company, array $addressData): CompanyAddress
    {
        $address = new CompanyAddress();
        $address->setCompany($company)
                ->setStreetNumber($addressData['streetNumber'])
                ->setStreetTypes($addressData['streetType'])
                ->setVoie($addressData['voie'])
                ->setCodePostal($addressData['codePostal'])
                ->setCommune($addressData['commune'])
                ->setPays('FRANCE');

        return $address;
    }

    private function createRepresentative(Company $company, array $representativeData): Representative
    {
        $representative = new Representative();
        $representative->setCompany($company)
                      ->setNom($representativeData['nom'])
                      ->setQualite($representativeData['qualite']);

        return $representative;
    }

    public function getCompaniesCount(): int
    {
        return count($this->companiesData['companies']);
    }
} 