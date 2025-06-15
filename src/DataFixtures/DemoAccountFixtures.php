<?php

namespace App\DataFixtures;

use App\Entity\Company;
use App\Entity\CompanyAddress;
use App\Entity\CompanyInvestment;
use App\Entity\Representative;
use App\Entity\User;
use App\Entity\UserGroup;
use App\Entity\NotificationSettings;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;

class DemoAccountFixtures extends Fixture implements FixtureGroupInterface
{
    private const DEMO_USER_COGNITO_ID = 'f18910ae-f0c1-7059-42c3-3980693e8095';
    private const DEMO_USER_EMAIL = 'tifasek566@ethsms.com';
    private const DEMO_USER_PASSWORD = 'Tifasek566@ethsms.com';
    private const DEMO_GROUP_NAME = 'Demo Portfolio';

    /** @var array<array<string, mixed>> */
    private array $realCompanies = [
        [
            'siren' => '542051180',
            'siret' => '54205118000016',
            'denomination' => 'TotalEnergies SE',
            'codeApe' => '6420Z',
            'sector' => 'energy',
            'businessStructure' => 'SE',
            'address' => [
                'streetNumber' => '2',
                'streetType' => 'place',
                'voie' => 'Jean-Millier',
                'codePostal' => '92400',
                'commune' => 'Courbevoie',
            ]
        ],
        [
            'siren' => '552032534',
            'siret' => '55203253400477',
            'denomination' => 'LVMH Moët Hennessy Louis Vuitton',
            'codeApe' => '7010Z',
            'sector' => 'luxury',
            'businessStructure' => 'SA',
            'address' => [
                'streetNumber' => '22',
                'streetType' => 'avenue',
                'voie' => 'Montaigne',
                'codePostal' => '75008',
                'commune' => 'Paris',
            ]
        ],
        [
            'siren' => '552120222',
            'siret' => '55212022200047',
            'denomination' => 'L\'Oréal',
            'codeApe' => '2042Z',
            'sector' => 'beauty_personal_care',
            'businessStructure' => 'SA',
            'address' => [
                'streetNumber' => '14',
                'streetType' => 'rue',
                'voie' => 'Royale',
                'codePostal' => '75008',
                'commune' => 'Paris',
            ]
        ],
        [
            'siren' => '775670417',
            'siret' => '77567041700455',
            'denomination' => 'Airbus SE',
            'codeApe' => '3030Z',
            'sector' => 'aerospace',
            'businessStructure' => 'SE',
            'address' => [
                'streetNumber' => '2',
                'streetType' => 'rond-point',
                'voie' => 'Emile Dewoitine',
                'codePostal' => '31700',
                'commune' => 'Blagnac',
            ]
        ],
        [
            'siren' => '315676484',
            'siret' => '31567648400895',
            'denomination' => 'Michelin',
            'codeApe' => '2211Z',
            'sector' => 'automotive',
            'businessStructure' => 'SCA',
            'address' => [
                'streetNumber' => '23',
                'streetType' => 'place',
                'voie' => 'des Carmes-Déchaux',
                'codePostal' => '63000',
                'commune' => 'Clermont-Ferrand',
            ]
        ],
        [
            'siren' => '542107651',
            'siret' => '54210765100508',
            'denomination' => 'Sanofi',
            'codeApe' => '2120Z',
            'sector' => 'pharmaceuticals',
            'businessStructure' => 'SA',
            'address' => [
                'streetNumber' => '54',
                'streetType' => 'rue',
                'voie' => 'La Boétie',
                'codePostal' => '75008',
                'commune' => 'Paris',
            ]
        ],
        [
            'siren' => '542044031',
            'siret' => '54204403115522',
            'denomination' => 'Orange',
            'codeApe' => '6110Z',
            'sector' => 'telecommunications',
            'businessStructure' => 'SA',
            'address' => [
                'streetNumber' => '111',
                'streetType' => 'quai',
                'voie' => 'du Président Roosevelt',
                'codePostal' => '92130',
                'commune' => 'Issy-les-Moulineaux',
            ]
        ],
        [
            'siren' => '712054599',
            'siret' => '71205459900507',
            'denomination' => 'Safran',
            'codeApe' => '2611Z',
            'sector' => 'aerospace',
            'businessStructure' => 'SA',
            'address' => [
                'streetNumber' => '2',
                'streetType' => 'boulevard',
                'voie' => 'du Général Martial Valin',
                'codePostal' => '75015',
                'commune' => 'Paris',
            ]
        ],
        [
            'siren' => '542029166',
            'siret' => '54202916600127',
            'denomination' => 'Schneider Electric',
            'codeApe' => '2712Z',
            'sector' => 'industrial_equipment',
            'businessStructure' => 'SE',
            'address' => [
                'streetNumber' => '35',
                'streetType' => 'rue',
                'voie' => 'Joseph Monier',
                'codePostal' => '92500',
                'commune' => 'Rueil-Malmaison',
            ]
        ],
        [
            'siren' => '422769638',
            'siret' => '42276963800395',
            'denomination' => 'Dassault Systèmes',
            'codeApe' => '5829C',
            'sector' => 'software',
            'businessStructure' => 'SE',
            'address' => [
                'streetNumber' => '10',
                'streetType' => 'rue',
                'voie' => 'Marcel Dassault',
                'codePostal' => '78140',
                'commune' => 'Vélizy-Villacoublay',
            ]
        ],
        [
            'siren' => '775661285',
            'siret' => '77566128500397',
            'denomination' => 'Capgemini',
            'codeApe' => '6202A',
            'sector' => 'technology_services',
            'businessStructure' => 'SE',
            'address' => [
                'streetNumber' => '11',
                'streetType' => 'rue',
                'voie' => 'de Tilsitt',
                'codePostal' => '75017',
                'commune' => 'Paris',
            ]
        ],
        [
            'siren' => '542108996',
            'siret' => '54210899600047',
            'denomination' => 'Thales',
            'codeApe' => '2651B',
            'sector' => 'defense_aerospace',
            'businessStructure' => 'SA',
            'address' => [
                'streetNumber' => '4',
                'streetType' => 'avenue',
                'voie' => 'des Louvresses',
                'codePostal' => '92230',
                'commune' => 'Gennevilliers',
            ]
        ]
    ];

    /** @var array<string> */
    private array $fundingTypes = [
        'Seed',
        'Series A',
        'Series B',
        'Series C',
        'Growth',
        'Private Equity',
        'Venture Capital',
        'Corporate Venture',
        'Strategic Investment',
        'Bridge Funding'
    ];

    public function load(ObjectManager $manager): void
    {
        // Vérifier si l'utilisateur demo existe déjà
        $existingUser = $manager->getRepository(User::class)->findOneBy([
            'email' => self::DEMO_USER_EMAIL
        ]);
        
        if ($existingUser) {
            echo "⚠️  Le compte de démonstration existe déjà !\n";
            echo "📧 Email: " . self::DEMO_USER_EMAIL . "\n";
            echo "🔑 Mot de passe: " . self::DEMO_USER_PASSWORD . "\n";
            echo "💰 Portfolio total: 48M EUR répartis sur 24 investissements\n";
            echo "🌐 Secteurs traduits correctement\n";
            echo "🛑 Arrêt du processus de création.\n";
            return;
        }

        echo "✅ Création du nouveau compte de démonstration...\n";
        echo "📧 Email: " . self::DEMO_USER_EMAIL . "\n";
        echo "🔑 Mot de passe: " . self::DEMO_USER_PASSWORD . "\n\n";

        // 1. Créer l'utilisateur demo
        $demoUser = $this->createDemoUser($manager);
        $manager->persist($demoUser);
        $manager->flush(); // Flush pour obtenir l'ID de l'utilisateur
        
        // 2. Créer le groupe demo
        $demoGroup = $this->createDemoGroup($manager, $demoUser);
        $manager->persist($demoGroup);
        $manager->flush(); // Flush pour obtenir l'ID du groupe
        
        // 3. Assigner l'utilisateur au groupe
        $demoUser->setUserGroup($demoGroup);
        $demoGroup->addUser($demoUser);
        
        // 4. Créer les paramètres de notification
        $this->createNotificationSettings($manager, $demoUser);
        
        // 5. Créer les entreprises avec des investissements
        $this->createCompaniesWithInvestments($manager, $demoUser, $demoGroup);
        
        $manager->flush();
    }

    private function createDemoUser(ObjectManager $manager): User
    {
        $user = new User();
        $user->setCognitoId(self::DEMO_USER_COGNITO_ID)
             ->setName('Demo Investor')
             ->setEmail(self::DEMO_USER_EMAIL);

        return $user;
    }

    private function createDemoGroup(ObjectManager $manager, User $owner): UserGroup
    {
        $group = new UserGroup();
        $group->setName(self::DEMO_GROUP_NAME)
              ->setOwner($owner);

        return $group;
    }

    private function createNotificationSettings(ObjectManager $manager, User $user): void
    {
        $notificationSettings = new NotificationSettings();
        $notificationSettings->setUserId($user)
                            ->setEmailEnabled(true)
                            ->setSmsEnabled(false)
                            ->setPushEnabled(true)
                            ->setUpdatedAt(new \DateTime());

        $manager->persist($notificationSettings);
    }

    private function createCompaniesWithInvestments(ObjectManager $manager, User $user, UserGroup $group): void
    {
        foreach ($this->realCompanies as $companyData) {
            // Créer l'entreprise
            $company = $this->createCompany($companyData);
            $manager->persist($company);

            // Créer l'adresse
            $address = $this->createCompanyAddress($company, $companyData['address']);
            $company->setAddress($address);
            $manager->persist($address);

            // Créer un ou plusieurs investissements pour cette entreprise
            $numberOfInvestments = mt_rand(1, 3); // Entre 1 et 3 investissements par entreprise
            
            for ($i = 0; $i < $numberOfInvestments; $i++) {
                $investment = $this->createInvestment($company, $user, $group, $i);
                $manager->persist($investment);
            }

            // Créer un représentant
            $representative = $this->createRepresentative($company);
            $manager->persist($representative);
        }
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

    private function createInvestment(Company $company, User $user, UserGroup $group, int $round): CompanyInvestment
    {
        $investment = new CompanyInvestment();
        
        // Montants réalistes selon le type de financement et la taille de l'entreprise
        $baseAmount = $this->getBaseAmountForSector($company->getSector());
        $amount = $baseAmount * (1 + $round * 0.5); // Augmente avec les tours
        
        // Date d'investissement réaliste (entre 6 mois et 3 ans)
        $daysAgo = mt_rand(180, 1095);
        $investedAt = new \DateTime();
        $investedAt->modify("-{$daysAgo} days");

        $investment->setCompany($company)
                  ->setUser($user)
                  ->setUserGroup($group)
                  ->setFundingType($this->fundingTypes[array_rand($this->fundingTypes)])
                  ->setAmount((int) $amount)
                  ->setCurrency('EUR')
                  ->setInvestedAt($investedAt);

        return $investment;
    }

    private function createRepresentative(Company $company): Representative
    {
        $representative = new Representative();
        $representative->setCompany($company)
                      ->setNom($this->generateExecutiveName())
                      ->setQualite($this->generateExecutiveRole());

        return $representative;
    }

    private function getBaseAmountForSector(string $sector): float
    {
        $sectorMultipliers = [
            'energy' => 2500000,            // 2.5M €
            'luxury' => 1500000,            // 1.5M €
            'beauty_personal_care' => 800000,  // 800K €
            'aerospace' => 3000000,         // 3M €
            'automotive' => 2000000,        // 2M €
            'pharmaceuticals' => 1800000,   // 1.8M €
            'telecommunications' => 1200000, // 1.2M €
            'industrial_equipment' => 900000, // 900K €
            'software' => 600000,           // 600K €
            'technology_services' => 750000, // 750K €
            'defense_aerospace' => 4000000, // 4M €
        ];

        return $sectorMultipliers[$sector] ?? 500000; // Default 500K €
    }

    private function generateExecutiveName(): string
    {
        $firstNames = [
            'Patrick', 'Marie', 'Jean-Luc', 'Catherine', 'Philippe', 
            'Isabelle', 'François', 'Sophie', 'Pierre', 'Anne',
            'Thierry', 'Sylvie', 'Laurent', 'Véronique', 'Alain'
        ];
        
        $lastNames = [
            'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert',
            'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon',
            'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David'
        ];

        return $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
    }

    private function generateExecutiveRole(): string
    {
        $roles = [
            'Président-Directeur Général',
            'Directeur Général',
            'Directeur Général Délégué',
            'Président du Conseil d\'Administration',
            'Directeur Financier',
            'Directeur des Opérations',
            'Vice-Président',
            'Directeur Exécutif'
        ];

        return $roles[array_rand($roles)];
    }

    public static function getGroups(): array
    {
        return ['demo'];
    }
} 