<?php

namespace App\DataFixtures;

use App\Entity\Enterprise;
use App\Entity\CompanyAddress;
use App\Entity\CompanyInvestment;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class EnterpriseFixtures extends Fixture
{
    private array $formeJuridique = ['SARL', 'SAS', 'SA', 'EURL', 'SASU'];
    private array $sectors = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Energy', 'Real Estate'];
    private array $codeApe = ['6201Z', '7022Z', '6420Z', '4791A', '3511Z'];
    private array $typeVoie = ['rue', 'avenue', 'boulevard', 'place', 'impasse'];
    private array $fundingTypes = ['Equity', 'Debt', 'Convertible', 'Seed', 'Series A', 'Series B'];
    
    public function load(ObjectManager $manager): void
    {
        // Générer 20 entreprises
        for ($i = 0; $i < 20; $i++) {
            $enterprise = new Enterprise();
            $cognitoId = 'FIXTURE_USER_' . $i;
            
            // Générer un SIREN valide (9 chiffres)
            $siren = str_pad(mt_rand(1, 999999999), 9, '0', STR_PAD_LEFT);
            // Générer un SIRET valide (SIREN + 5 chiffres)
            $siret = $siren . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
            
            $enterprise
                ->setSiren($siren)
                ->setSiret($siret)
                ->setDenomination($this->generateCompanyName())
                ->setFormeJuridique($this->formeJuridique[array_rand($this->formeJuridique)])
                ->setCodeApe($this->codeApe[array_rand($this->codeApe)])
                ->setSector($this->sectors[array_rand($this->sectors)])
                ->setCognitoId($cognitoId)
                ->setCreatedAt(new \DateTime())
                ->setUpdatedAt(new \DateTime())
                ->setDeletedAt(new \DateTime('9999-12-31 23:59:59'));

            // Créer et associer une adresse
            $address = new CompanyAddress();
            $address
                ->setNumVoie((string)mt_rand(1, 150))
                ->setTypeVoie($this->typeVoie[array_rand($this->typeVoie)])
                ->setVoie($this->generateVoie())
                ->setCodePostal($this->generatePostalCode())
                ->setCommune($this->generateCity())
                ->setPays('FRANCE')
                ->setEnterprise($enterprise);
            
            $enterprise->setAddress($address);
            
            // Créer et associer un investissement
            $investment = new CompanyInvestment();
            $investment
                ->setEnterprise($enterprise)
                ->setAmount(mt_rand(10000, 1000000))
                ->setCognitoId($cognitoId)
                ->setFundingType($this->fundingTypes[array_rand($this->fundingTypes)])
                ->setCurrency('EUR')
                ->setInvestedAt(new \DateTime());
            
            $enterprise->setInvestment($investment);
            
            $manager->persist($address);
            $manager->persist($investment);
            $manager->persist($enterprise);
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