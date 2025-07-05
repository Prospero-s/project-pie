<?php

namespace App\DataFixtures\Demo\Common;

use App\Entity\User;
use Doctrine\Persistence\ObjectManager;
use Doctrine\ORM\EntityManager;
use Doctrine\DBAL\Connection;

class DemoCleanupService
{
    private const DEMO_USER_EMAIL = 'tifasek566@ethsms.com';
    private const DEMO_GROUP_NAME = 'Demo Portfolio';

    public function cleanupExistingDemoData(ObjectManager $manager): bool
    {
        $existingUser = $manager->getRepository(User::class)->findOneBy([
            'email' => self::DEMO_USER_EMAIL
        ]);

        if (!$existingUser) {
            return false; // Aucune donnée à nettoyer
        }

        echo "🔄 Suppression de l'ancien compte de démonstration...\n";

        if (!$manager instanceof EntityManager) {
            throw new \RuntimeException('Expected EntityManager instance');
        }

        $connection = $manager->getConnection();
        $userId = $existingUser->getId();

        $this->executeCleanupQueries($connection, $userId);

        echo "✅ Ancien compte supprimé avec succès.\n";
        return true;
    }

    private function executeCleanupQueries(Connection $connection, int $userId): void
    {
        // 1. Récupérer les IDs des entreprises liées à cet utilisateur AVANT de supprimer les investissements
        $companyIds = $connection->fetchFirstColumn(
            'SELECT DISTINCT company_id FROM company_investment WHERE user_id = ?',
            [$userId]
        );

        // 2. Supprimer les investissements
        $connection->executeStatement(
            'DELETE FROM company_investment WHERE user_id = ?',
            [$userId]
        );

        // 3. Supprimer les paramètres de notification
        $connection->executeStatement(
            'DELETE FROM notification_settings WHERE user_id_id = ?',
            [$userId]
        );

        // 4. Supprimer les données des entreprises liées
        if (!empty($companyIds)) {
            $this->cleanupCompanies($connection, $companyIds);
        }

        // 5. Retirer la référence du groupe de l'utilisateur
        $connection->executeStatement(
            'UPDATE "user" SET user_group_id = NULL WHERE id = ?',
            [$userId]
        );

        // 6. Supprimer le groupe demo
        $connection->executeStatement(
            'DELETE FROM user_group WHERE owner_id = ? AND name = ?',
            [$userId, self::DEMO_GROUP_NAME]
        );

        // 7. Supprimer l'utilisateur
        $connection->executeStatement(
            'DELETE FROM "user" WHERE id = ?',
            [$userId]
        );

        // 8. Supprimer les entreprises demo
        // Supprimer toutes les entreprises et leurs dépendances
        $connection->executeStatement('TRUNCATE company CASCADE');
    }

    /**
     * @param array<int> $companyIds
     */
    private function cleanupCompanies(Connection $connection, array $companyIds): void
    {
        $placeholders = str_repeat('?,', count($companyIds) - 1) . '?';

        // Supprimer les KPI liés aux documents des entreprises
        $connection->executeStatement(
            "DELETE FROM kpi WHERE document_id IN (
                SELECT id FROM document WHERE company_id IN ($placeholders)
            )",
            $companyIds
        );

        // Supprimer les documents liés aux entreprises
        $connection->executeStatement(
            "DELETE FROM document WHERE company_id IN ($placeholders)",
            $companyIds
        );

        // Supprimer les représentants
        $connection->executeStatement(
            "DELETE FROM representative WHERE company_id IN ($placeholders)",
            $companyIds
        );

        // Supprimer les adresses
        $connection->executeStatement(
            "DELETE FROM company_address WHERE company_id IN ($placeholders)",
            $companyIds
        );

        // Supprimer les entreprises
        $connection->executeStatement(
            "DELETE FROM company WHERE id IN ($placeholders)",
            $companyIds
        );
    }

    public static function getDemoUserEmail(): string
    {
        return self::DEMO_USER_EMAIL;
    }

    public static function getDemoGroupName(): string
    {
        return self::DEMO_GROUP_NAME;
    }
}
