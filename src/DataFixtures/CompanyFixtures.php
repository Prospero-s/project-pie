<?php

namespace App\DataFixtures;

use App\Entity\Company;
use App\Entity\CompanyAddress;
use App\Entity\CompanyInvestment;
use App\Entity\Representative;
use App\Entity\User;
use App\Entity\UserGroup;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class CompanyFixtures extends Fixture implements DependentFixtureInterface
{
    /** @var array<string> */
    private array $businessStructures = ['SARL', 'SAS', 'SA', 'EURL', 'SASU'];

    /** @var array<string> */
    private array $sectors = [
        'Technology',
        'Healthcare',
        'Finance',
        'Manufacturing',
        'Retail',
        'Energy',
        'Real Estate'
    ];

    /** @var array<string> */
    private array $codeApe = ['6201Z', '7022Z', '6420Z', '4791A', '3511Z'];

    /** @var array<string> */
    private array $streetTypes = ['rue', 'avenue', 'boulevard', 'place', 'impasse'];

    /** @var array<string> */
    private array $fundingTypes = ['Equity', 'Debt', 'Convertible', 'Seed', 'Series A', 'Series B'];

    public function load(ObjectManager $manager): void
    {
        // Récupérer les utilisateurs et groupes créés par UserFixtures
        $users = $manager->getRepository(User::class)->findAll();
        $userGroup = $manager->getRepository(UserGroup::class)->findOneBy([]);
        
        if (empty($users) || !$userGroup) {
            throw new \Exception('Les utilisateurs et groupes doivent être créés avant les entreprises');
        }

        // Générer 20 entreprises
        for ($i = 0; $i < 20; $i++) {
            $company = new Company();
            
            // Sélectionner un utilisateur aléatoire
            $user = $users[array_rand($users)];

            // Générer un SIREN valide (9 chiffres)
            $siren = str_pad((string)mt_rand(1, 999999999), 9, '0', STR_PAD_LEFT);
            // Générer un SIRET valide (SIREN + 5 chiffres)
            $siret = $siren . str_pad((string)mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);

            $company
                ->setSiren($siren)
                ->setSiret($siret)
                ->setDenomination($this->generateCompanyName())
                ->setBusinessStructures($this->businessStructures[array_rand($this->businessStructures)])
                ->setCodeApe($this->codeApe[array_rand($this->codeApe)])
                ->setSector($this->sectors[array_rand($this->sectors)])
                ->setUpdatedAt(new \DateTime());

            // Créer et associer une adresse
            $address = new CompanyAddress();
            $address
                ->setStreetNumber((string)mt_rand(1, 150))
                ->setStreetTypes($this->streetTypes[array_rand($this->streetTypes)])
                ->setVoie($this->generateStreetType())
                ->setCodePostal($this->generatePostalCode())
                ->setCommune($this->generateCity())
                ->setPays('FRANCE')
                ->setCompany($company);

            $company->setAddress($address);

            // Créer et associer un investissement
            $investment = new CompanyInvestment();
            $investment
                ->setCompany($company)
                ->setUser($user)
                ->setUserGroup($userGroup)
                ->setAmount($this->generateInvestmentAmount($i))
                ->setFundingType($this->fundingTypes[array_rand($this->fundingTypes)])
                ->setCurrency('EUR')
                ->setInvestedAt($this->generateInvestmentDate($i));

            $company->addInvestment($investment);

            // Ajouter un deuxième investissement pour certaines entreprises (simulation de tours de financement)
            if ($i % 3 === 0) {
                $secondInvestment = new CompanyInvestment();
                $secondInvestment
                    ->setCompany($company)
                    ->setUser($user)
                    ->setUserGroup($userGroup)
                    ->setAmount($this->generateInvestmentAmount($i) * 1.5) // Montant plus élevé pour le tour suivant
                    ->setFundingType($this->fundingTypes[array_rand($this->fundingTypes)])
                    ->setCurrency('EUR')
                    ->setInvestedAt($this->generateInvestmentDate($i, true)); // Date plus récente

                $company->addInvestment($secondInvestment);
                $manager->persist($secondInvestment);
            }

            // Créer et associer un représentant
            $representative = new Representative();
            $representative
                ->setCompany($company)
                ->setNom('Représentant ' . $company->getDenomination())
                ->setQualite('Directeur Général');

            $manager->persist($representative);
            $manager->persist($address);
            $manager->persist($investment);
            $manager->persist($company);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
        ];
    }

    private function generateCompanyName(): string
    {
        $prefixes = ['Tech', 'Eco', 'Bio', 'Smart', 'Next', 'Future', 'Digital', 'Green'];
        $suffixes = ['Solutions', 'Systems', 'Technologies', 'Industries', 'Group', 'Labs', 'Innovation'];

        return $prefixes[array_rand($prefixes)] . ' ' . $suffixes[array_rand($suffixes)];
    }

    private function generateStreetType(): string
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

        return $dept . str_pad((string)mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
    }

    private function generateInvestmentAmount($i)
    {
        // Générer des montants d'investissement réalistes selon le type d'entreprise
        $ranges = [
            ['min' => 50000, 'max' => 250000],    // Seed
            ['min' => 250000, 'max' => 1000000],  // Series A
            ['min' => 1000000, 'max' => 5000000], // Series B
            ['min' => 100000, 'max' => 500000],   // Bridge
        ];
        
        $range = $ranges[$i % count($ranges)];
        return mt_rand($range['min'], $range['max']);
    }

    private function generateInvestmentDate($i, $isSecond = false)
    {
        // Générer des dates d'investissement réalistes sur les 4 dernières années
        $currentYear = (int)date('Y');
        $startYear = $currentYear - 3;
        
        if ($isSecond) {
            // Pour un deuxième tour, toujours plus récent
            $year = $currentYear - mt_rand(0, 1);
        } else {
            $year = $startYear + ($i % 4);
        }
        
        $month = mt_rand(1, 12);
        $day = mt_rand(1, 28); // Éviter les problèmes de fin de mois
        
        return new \DateTime(sprintf('%d-%02d-%02d', $year, $month, $day));
    }
}
