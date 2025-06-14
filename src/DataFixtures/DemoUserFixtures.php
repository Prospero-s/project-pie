<?php

namespace App\DataFixtures;

use App\Entity\Company;
use App\Entity\CompanyAddress;
use App\Entity\CompanyInvestment;
use App\Entity\NotificationSettings;
use App\Entity\Representative;
use App\Entity\User;
use App\Entity\UserGroup;
use App\Entity\UserNotifications;
use App\Entity\Notifications;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class DemoUserFixtures extends Fixture
{
    private string $cognitoId = 'DEMO_USER_2024';

    /** @var array<string> */
    private array $businessStructures = ['SARL', 'SAS', 'SA', 'EURL', 'SASU', 'SCI', 'SCOP'];

    /** @var array<string> */
    private array $sectors = [
        'Technologie et Innovation',
        'Santé et Biotechnologies', 
        'Finance et Fintech',
        'E-commerce et Retail',
        'Énergie Renouvelable',
        'Immobilier',
        'Intelligence Artificielle',
        'Blockchain et Crypto',
        'Mobilité et Transport',
        'AgTech et Alimentation',
        'EdTech et Formation',
        'GreenTech et Environnement',
        'Logistique et Supply Chain',
        'Média et Communication',
        'Cybersécurité'
    ];

    /** @var array<string> */
    private array $fundingTypes = [
        'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 
        'Bridge', 'Convertible', 'Equity', 'Debt', 'Mezzanine',
        'Growth Capital', 'LBO', 'Follow-on'
    ];

    /** @var array<string> */
    private array $companyStages = [
        'Idée', 'MVP', 'Product-Market Fit', 'Scaling', 'Mature', 'IPO Ready'
    ];

    /** @var array<string> */
    private array $frenchFirstNames = [
        'Alexandre', 'Pierre', 'Marie', 'Jean', 'Sophie', 'Julien', 'Laura', 'Nicolas',
        'Emma', 'Thomas', 'Sarah', 'Antoine', 'Camille', 'Maxime', 'Julie', 'Benjamin'
    ];

    /** @var array<string> */
    private array $frenchLastNames = [
        'Dubois', 'Martin', 'Bernard', 'Durand', 'Moreau', 'Laurent', 'Simon', 'Michel',
        'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard'
    ];

    /** @var array<string> */
    private array $frenchCities = [
        'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg',
        'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble'
    ];

    /** @var array<string> */
    private array $streetNames = [
        'de la Paix', 'des Champs-Élysées', 'Victor Hugo', 'de la République', 'du Commerce',
        'Jean Jaurès', 'de l\'Église', 'du Général de Gaulle', 'des Fleurs', 'de la Liberté'
    ];

    public function load(ObjectManager $manager): void
    {
        // Créer l'utilisateur de démo
        $demoUser = $this->createDemoUser($manager);
        
        // Créer un groupe d'utilisateurs pour la démo
        $demoGroup = $this->createDemoUserGroup($manager, $demoUser);
        $demoUser->setUserGroup($demoGroup);

        // Créer les paramètres de notification
        $this->createNotificationSettings($manager, $demoUser);

        // Générer 50 entreprises avec investissements sur 3 ans
        $companies = $this->createCompaniesWithInvestments($manager, $demoUser, $demoGroup, 50);

        // Créer des notifications pour simuler l'activité
        $this->createDemoNotifications($manager, $demoUser, $companies);

        $manager->persist($demoUser);
        $manager->persist($demoGroup);
        $manager->flush();

        echo "✅ Utilisateur de démo créé avec succès !\n";
        echo "📧 Email: demo@investisseur.com\n";
        echo "🏢 Nombre d'entreprises: " . count($companies) . "\n";
        echo "💰 Nombre total d'investissements: " . $demoUser->getInvestments()->count() . "\n";
    }

    private function createDemoUser(ObjectManager $manager): User
    {
        $user = new User();
        // Extraire le timestamp du CognitoId pour créer un nom unique
        $timestamp = str_replace('DEMO_USER_', '', $this->cognitoId);
        $user
            ->setCognitoId($this->cognitoId)
            ->setName('Alexandre Dubois (' . $timestamp . ')')
            ->setEmail('demo@investisseur.com');

        return $user;
    }

    private function createDemoUserGroup(ObjectManager $manager, User $owner): UserGroup
    {
        $group = new UserGroup();
        $timestamp = str_replace('DEMO_USER_', '', $this->cognitoId);
        $group
            ->setName('Portefeuille Démo - Alexandre Dubois (' . $timestamp . ')')
            ->setOwner($owner)
            ->setCreatedAt(new \DateTime('-2 years'));

        return $group;
    }

    private function createNotificationSettings(ObjectManager $manager, User $user): void
    {
        $settings = new NotificationSettings();
        $settings
            ->setUserId($user)
            ->setEmailEnabled(true)
            ->setSmsEnabled(false)
            ->setPushEnabled(true)
            ->setUpdatedAt(new \DateTime('-1 month'));

        $user->setNotificationSettings($settings);
        $manager->persist($settings);
    }

    private function createCompaniesWithInvestments(ObjectManager $manager, User $user, UserGroup $group, int $count): array
    {
        $companies = [];
        $startDate = new \DateTime('-3 years');
        $endDate = new \DateTime('now');

        for ($i = 0; $i < $count; $i++) {
            $company = $this->createCompany($manager, $i);
            $companies[] = $company;

            // Créer entre 1 et 5 investissements par entreprise
            $investmentCount = mt_rand(1, 5);
            for ($j = 0; $j < $investmentCount; $j++) {
                $this->createInvestment($manager, $company, $user, $group, $startDate, $endDate, $j);
            }

            $manager->persist($company);
        }

        return $companies;
    }

    private function createCompany(ObjectManager $manager, int $index): Company
    {
        $company = new Company();
        
        // Générer un SIREN valide
        $siren = str_pad((string)mt_rand(100000000, 999999999), 9, '0', STR_PAD_LEFT);
        $siret = $siren . str_pad((string)mt_rand(10000, 99999), 5, '0', STR_PAD_LEFT);

        $companyName = $this->generateRealisticCompanyName();
        $createdDate = $this->randomDateBetween('-4 years', '-6 months');

        $company
            ->setSiren($siren)
            ->setSiret($siret)
            ->setDenomination($companyName)
            ->setBusinessStructures($this->businessStructures[array_rand($this->businessStructures)])
            ->setCodeApe($this->generateCodeApe())
            ->setSector($this->sectors[array_rand($this->sectors)])
            ->setCreatedAt(\DateTimeImmutable::createFromMutable($createdDate))
            ->setUpdatedAt($this->randomDateBetween(date('Y-m-d', $createdDate->getTimestamp()), 'now'));

        // Créer une adresse réaliste
        $address = $this->createCompanyAddress($manager, $company);
        $company->setAddress($address);

        // Créer des représentants
        $this->createRepresentatives($manager, $company);

        return $company;
    }

    private function createCompanyAddress(ObjectManager $manager, Company $company): CompanyAddress
    {
        $address = new CompanyAddress();
        $streetTypes = ['rue', 'avenue', 'boulevard', 'place', 'impasse'];
        $address
            ->setStreetNumber((string)mt_rand(1, 150))
            ->setStreetTypes($streetTypes[array_rand($streetTypes)])
            ->setVoie($this->streetNames[array_rand($this->streetNames)])
            ->setCodePostal($this->generatePostalCode())
            ->setCommune($this->frenchCities[array_rand($this->frenchCities)])
            ->setPays('FRANCE')
            ->setCompany($company);

        $manager->persist($address);
        return $address;
    }

    private function createRepresentatives(ObjectManager $manager, Company $company): void
    {
        // Créer 1-3 représentants par entreprise
        $count = mt_rand(1, 3);
        $roles = ['CEO', 'CTO', 'CFO', 'Fondateur', 'Co-fondateur', 'Directeur Général'];

        for ($i = 0; $i < $count; $i++) {
            $representative = new Representative();
            $representative
                ->setCompany($company)
                ->setNom($this->frenchFirstNames[array_rand($this->frenchFirstNames)] . ' ' . $this->frenchLastNames[array_rand($this->frenchLastNames)])
                ->setQualite($roles[array_rand($roles)]);
            
            $manager->persist($representative);
        }
    }

    private function createInvestment(ObjectManager $manager, Company $company, User $user, UserGroup $group, \DateTime $startDate, \DateTime $endDate, int $round): void
    {
        $investment = new CompanyInvestment();
        
        // Montants réalistes selon le type de financement
        $fundingType = $this->fundingTypes[array_rand($this->fundingTypes)];
        $amount = $this->getAmountByFundingType($fundingType, $round);
        
        // Date d'investissement réaliste
        $investedAt = $this->randomDateBetween($startDate->format('Y-m-d'), $endDate->format('Y-m-d'));
        
        $investment
            ->setCompany($company)
            ->setUser($user)
            ->setUserGroup($group)
            ->setFundingType($fundingType)
            ->setAmount($amount)
            ->setCurrency('EUR')
            ->setInvestedAt($investedAt);

        $user->addInvestment($investment);
        $company->addInvestment($investment);
        
        $manager->persist($investment);
    }

    private function createDemoNotifications(ObjectManager $manager, User $user, array $companies): void
    {
        $notificationTypes = [
            'Nouveau document financier disponible',
            'Rapport trimestriel publié',
            'Levée de fonds annoncée',
            'Mise à jour du business plan',
            'Assemblée générale programmée',
            'Dividend distribué',
            'Exit potentielle identifiée'
        ];

        // Créer 30 notifications sur les 6 derniers mois
        for ($i = 0; $i < 30; $i++) {
            $randomCompany = $companies[array_rand($companies)];
            $createdAt = $this->randomDateBetween('-6 months', 'now');
            
            // Créer la notification principale
            $notification = new Notifications();
            $notification
                ->setType('investment_update')
                ->setTitle($notificationTypes[array_rand($notificationTypes)])
                ->setMessage("Concernant " . $randomCompany->getDenomination() . " - " . $this->generateRandomSentence())
                ->setCreatedAt(\DateTimeImmutable::createFromMutable($createdAt));
            
            $manager->persist($notification);
            
            // Créer la liaison utilisateur-notification
            $userNotification = new UserNotifications();
            $isRead = mt_rand(1, 100) <= 70; // 70% de chances d'être lue
            
            $userNotification
                ->setUserId($user)
                ->setNotification($notification)
                ->setReceivedAt(\DateTimeImmutable::createFromMutable($createdAt))
                ->setStatus($isRead ? 'read' : 'unread');
                
            if ($isRead) {
                $readAt = $this->randomDateBetween($createdAt->format('Y-m-d'), 'now');
                $userNotification->setReadAt($readAt);
            }
            
            $manager->persist($userNotification);
        }
    }

    private function generateRealisticCompanyName(): string
    {
        $prefixes = [
            'Tech', 'Digital', 'Smart', 'Eco', 'Bio', 'Green', 'Next', 'Future', 'Neo', 'Meta',
            'AI', 'Data', 'Cloud', 'Cyber', 'Quantum', 'Nano', 'Micro', 'Hyper'
        ];
        
        $cores = [
            'Solutions', 'Systems', 'Technologies', 'Innovations', 'Dynamics', 'Ventures',
            'Labs', 'Works', 'Hub', 'Connect', 'Flow', 'Stream', 'Force', 'Wave', 'Pulse'
        ];
        
        $suffixes = ['', ' France', ' Europe', ' Pro', ' Plus', ' X', ' 360', ' One'];

        if (mt_rand(0, 1)) {
            // Style: Prefix + Core + Suffix
            return $prefixes[array_rand($prefixes)] . 
                   $cores[array_rand($cores)] . 
                   $suffixes[array_rand($suffixes)];
        } else {
            // Style: Nom français traditionnel
            $frenchNames = [
                'Artisans du Numérique', 'Maison de l\'Innovation', 'Ateliers Connectés',
                'Fabrique Digitale', 'Compagnie Technologique', 'Société d\'Innovation',
                'Groupe Innovant', 'Entreprise du Futur', 'Studio Créatif'
            ];
            return $frenchNames[array_rand($frenchNames)];
        }
    }

    private function generateCodeApe(): string
    {
        $codes = [
            '6201Z', '6202A', '6209Z', '6311Z', '6312Z', '6391Z', '6399Z',
            '7021Z', '7022Z', '7111Z', '7112B', '7120B', '7219Z', '7220Z',
            '4791A', '4791B', '4799A', '4799B', '5829C', '5911A', '5912Z',
            '3511Z', '3512Z', '3513Z', '3514Z', '3521Z', '3522Z', '3523Z'
        ];
        
        return $codes[array_rand($codes)];
    }

    private function getAmountByFundingType(string $fundingType, int $round): int
    {
        $baseAmounts = [
            'Pre-Seed' => [5000, 25000],
            'Seed' => [25000, 150000],
            'Series A' => [100000, 500000],
            'Series B' => [300000, 1500000],
            'Series C' => [800000, 5000000],
            'Bridge' => [50000, 300000],
            'Convertible' => [25000, 200000],
            'Equity' => [50000, 1000000],
            'Debt' => [100000, 2000000],
            'Mezzanine' => [500000, 3000000],
            'Growth Capital' => [1000000, 10000000],
            'LBO' => [2000000, 50000000],
            'Follow-on' => [25000, 500000]
        ];

        $range = $baseAmounts[$fundingType] ?? [10000, 100000];
        $baseAmount = mt_rand($range[0], $range[1]);
        
        // Augmenter les montants pour les tours suivants
        return (int)($baseAmount * (1 + ($round * 0.5)));
    }

    private function randomDateBetween(string $startDate, string $endDate): \DateTime
    {
        $startTimestamp = strtotime($startDate);
        $endTimestamp = strtotime($endDate);
        
        if ($startTimestamp === false || $endTimestamp === false) {
            return new \DateTime();
        }
        
        $randomTimestamp = mt_rand($startTimestamp, $endTimestamp);
        return new \DateTime('@' . $randomTimestamp);
    }

    private function generatePostalCode(): string
    {
        $departements = ['75', '69', '13', '33', '31', '44', '67', '59', '06', '35', '34', '76'];
        $dept = $departements[array_rand($departements)];
        return $dept . str_pad((string)mt_rand(1, 999), 3, '0', STR_PAD_LEFT);
    }

    private function generateRandomSentence(): string
    {
        $sentences = [
            "Les derniers résultats financiers montrent une croissance prometteuse.",
            "Une nouvelle opportunité d'investissement se présente.",
            "L'équipe dirigeante souhaite partager les dernières actualités.",
            "Les métriques clés de performance ont été mises à jour.",
            "Une assemblée générale extraordinaire est programmée.",
            "Le plan de développement stratégique a été finalisé.",
            "Les prévisions de croissance pour le prochain trimestre sont optimistes.",
            "Une présentation détaillée des résultats est disponible.",
            "L'analyse concurrentielle révèle de nouvelles opportunités.",
            "Les investisseurs sont invités à consulter le rapport détaillé."
        ];
        
        return $sentences[array_rand($sentences)];
    }

    public function setCognitoId(string $cognitoId): void
    {
        $this->cognitoId = $cognitoId;
    }
} 