<?php

namespace App\DataFixtures;

use App\Entity\Company;
use App\Entity\CompanyAddress;
use App\Entity\CompanyInvestment;
use App\Entity\Representative;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CompanyFixtures extends Fixture
{
    private array $businessStructures = ['SARL', 'SAS', 'SA', 'EURL', 'SASU'];
    private array $sectors = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Energy', 'Real Estate'];
    private array $codeApe = ['6201Z', '7022Z', '6420Z', '4791A', '3511Z'];
    private array $streetTypes = ['rue', 'avenue', 'boulevard', 'place', 'impasse'];
    private array $fundingTypes = ['Equity', 'Debt', 'Convertible', 'Seed', 'Series A', 'Series B'];
    
    public function load(ObjectManager $manager): void
    {
        // Créer un investisseur qui investira dans plusieurs entreprises
        $multiInvestorId = 'MULTI_INVESTOR_USER';
        
        // Générer 20 entreprises
        for ($i = 0; $i < 20; $i++) {
            $company = new Company();
            // Pour les entreprises 0, 5 et 10, utiliser le même investisseur
            $cognitoId = ($i == 0 || $i == 5 || $i == 10) ? $multiInvestorId : 'FIXTURE_USER_' . $i;
            
            // Générer un SIREN valide (9 chiffres)
            $siren = str_pad(mt_rand(1, 999999999), 9, '0', STR_PAD_LEFT);
            // Générer un SIRET valide (SIREN + 5 chiffres)
            $siret = $siren . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
            
            $company
                ->setSiren($siren)
                ->setSiret($siret)
                ->setDenomination($this->generateCompanyName())
                ->setBusinessStructures($this->businessStructures[array_rand($this->businessStructures)])
                ->setCodeApe($this->codeApe[array_rand($this->codeApe)])
                ->setSector($this->sectors[array_rand($this->sectors)])
                ->setCognitoId($cognitoId)
                ->setCreatedAt(new \DateTime())
                ->setUpdatedAt(new \DateTime())
                ->setDeletedAt(new \DateTime('9999-12-31 23:59:59'));

            // Créer et associer une adresse
            $address = new CompanyAddress();
            $address
                ->setStreetNumber((string)mt_rand(1, 150))
                ->setStreetTypes($this->streetTypes[array_rand($this->streetTypes)])
                ->setVoie($this->generateVoie())
                ->setCodePostal($this->generatePostalCode())
                ->setCommune($this->generateCity())
                ->setPays('FRANCE')
                ->setCompany($company);
            
            $company->setAddress($address);
            
            // Créer et associer un investissement
            $investment = new CompanyInvestment();
            $investment
                ->setCompany($company)
                ->setAmount(mt_rand(10000, 1000000))
                ->setCognitoId($cognitoId)
                ->setFundingType($this->fundingTypes[array_rand($this->fundingTypes)])
                ->setCurrency('EUR')
                ->setInvestedAt(new \DateTime());
            
            $company->setInvestment($investment);
            
            // Créer et associer un représentant pour l'investisseur
            $representative = new Representative();
            $representative
                ->setCompany($company)
                ->setNom($cognitoId === $multiInvestorId ? 'Multi Investisseur' : 'Investisseur ' . $i)
                ->setQualite('Investisseur')
                ->setCognitoId($cognitoId);
            
            $manager->persist($representative);
            $manager->persist($address);
            $manager->persist($investment);
            $manager->persist($company);
        }

        $manager->flush();
    }

    private function generateCompanyName(): string
    {
        $prefixes = ['Tech', 'Eco', 'Bio', 'Smart', 'Next', 'Future', 'Digital', 'Green'];
        $suffixes = ['Solutions', 'Systems', 'Technologies', 'Industries', 'Group', 'Labs', 'Innovation'];
        
        return $prefixes[array_rand($prefixes)] . ' ' . $suffixes[array_rand($suffixes)];
    }

    private function generateVoie(): string
    {
        $names = ['de la Paix', 'des Champs-Élysées', 'Saint-Germain', 
                 'du Commerce', 'de l\'Innovation', 'de l\'Industrie',
                 'Victor Hugo', 'de la République', 'Pasteur', 'des Lilas'];
        
        return $names[array_rand($names)];
    }

    private function generateCity(): string
    {
        $cities = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Nantes', 
                  'Strasbourg', 'Lille', 'Nice', 'Rennes'];
        
        return $cities[array_rand($cities)];
    }

    private function generatePostalCode(): string
    {
        $departements = ['75', '69', '13', '33', '31', '44', '67', '59', '06', '35'];
        $dept = $departements[array_rand($departements)];
        
        return $dept . str_pad(mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
    }
} 