<?php

namespace App\Command;

use App\DataFixtures\DemoUserFixtures;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:load-demo-data',
    description: 'Charge les données de démo pour présenter l\'application avec un utilisateur rempli d\'investissements'
)]
class LoadDemoDataCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('🚀 Chargement des données de démo');
        
        $io->section('Préparation de la base de données');
        
        // Vérifier si l'utilisateur de démo existe déjà
        $userRepository = $this->entityManager->getRepository(\App\Entity\User::class);
        $timestamp = date('Y_m_d_H_i_s');
        $cognitoId = 'DEMO_USER_' . $timestamp;
        
        $existingDemoUsers = $userRepository->findBy(['name' => 'Alexandre Dubois']);
        if (count($existingDemoUsers) > 0) {
            $io->note('Des utilisateurs de démo existent déjà. Création d\'un nouvel utilisateur avec ID unique.');
        }

        $io->section('Génération des données');
        
        // Charger les fixtures avec l'ID unique
        $fixture = new DemoUserFixtures();
        $fixture->setCognitoId($cognitoId);
        $fixture->load($this->entityManager);

        $io->success('🎉 Données de démo chargées avec succès !');
        
        $io->section('Informations de connexion de démo');
        $io->table(
            ['Propriété', 'Valeur'],
            [
                ['Email', 'demo@investisseur.com'],
                ['Nom', 'Alexandre Dubois'],
                ['Cognito ID', $cognitoId],
                ['Nombre d\'entreprises', '~50'],
                ['Nombre d\'investissements', '~150-250'],
                ['Période couverte', 'Les 3 dernières années'],
            ]
        );

        $io->note([
            'Cet utilisateur dispose d\'un portefeuille riche avec :',
            '• Des investissements dans diverses industries tech',
            '• Des montants réalistes selon les types de financement',
            '• Un historique étalé sur 3 ans',
            '• Des notifications d\'activité récentes',
            '• Des paramètres de notification configurés'
        ]);

        $io->info('💡 Utilisez cet utilisateur pour vos démonstrations produit !');

        return Command::SUCCESS;
    }

    private function deleteExistingDemoData(\App\Entity\User $demoUser): void
    {
        $connection = $this->entityManager->getConnection();
        $userId = $demoUser->getId();
        
        try {
            $connection->beginTransaction();
            
            // Supprimer les notifications liées à l'utilisateur
            $connection->executeStatement('DELETE FROM user_notifications WHERE user_id_id = ?', [$userId]);
            $connection->executeStatement('DELETE FROM notifications WHERE id NOT IN (SELECT notification_id FROM user_notifications WHERE notification_id IS NOT NULL)');
            
            // Supprimer les paramètres de notification
            $connection->executeStatement('DELETE FROM notification_settings WHERE user_id_id = ?', [$userId]);
            
            // Supprimer les investissements de l'utilisateur et les entreprises qui deviennent orphelines
            $companyIds = $connection->fetchFirstColumn('SELECT company_id FROM company_investment WHERE user_id = ?', [$userId]);
            $connection->executeStatement('DELETE FROM company_investment WHERE user_id = ?', [$userId]);
            
            // Supprimer les entreprises qui n'ont plus d'investissements
            foreach ($companyIds as $companyId) {
                $remainingInvestments = $connection->fetchOne('SELECT COUNT(*) FROM company_investment WHERE company_id = ?', [$companyId]);
                if ($remainingInvestments == 0) {
                    $connection->executeStatement('DELETE FROM representative WHERE company_id = ?', [$companyId]);
                    $connection->executeStatement('DELETE FROM company_address WHERE company_id = ?', [$companyId]);
                    $connection->executeStatement('DELETE FROM company WHERE id = ?', [$companyId]);
                }
            }
            
            // Supprimer d'abord l'utilisateur (mettre à null la référence au groupe)
            $connection->executeStatement('UPDATE "user" SET user_group_id = NULL WHERE id = ?', [$userId]);
            $connection->executeStatement('DELETE FROM "user" WHERE id = ?', [$userId]);
            
            // Puis supprimer le groupe d'utilisateurs s'il en était propriétaire
            $groupId = $connection->fetchOne('SELECT id FROM user_group WHERE owner_id = ?', [$userId]);
            if ($groupId) {
                $connection->executeStatement('DELETE FROM user_group WHERE id = ?', [$groupId]);
            }
            
            $connection->commit();
        } catch (\Exception $e) {
            $connection->rollBack();
            throw $e;
        }
    }
} 