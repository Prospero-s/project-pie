<?php

namespace App\Repository;

use Doctrine\ORM\EntityManagerInterface;

class EventLogRepository
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
    }

    /**
     * Récupère tous les événements du groupe avec pagination
     * 
     * @param int $groupId
     * @param int $page
     * @param int $limit
     * @return array<string, mixed>
     */
    public function getGroupEvents(int $groupId, int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;
        $events = [];

        // Récupérer les investissements
        $investments = $this->getInvestmentEvents($groupId, $limit, $offset);
        $events = array_merge($events, $investments);

        // Récupérer les documents
        $documents = $this->getDocumentEvents($groupId, $limit, $offset);
        $events = array_merge($events, $documents);

        // Récupérer les événements du groupe (membres ajoutés)
        $groupEvents = $this->getMemberEvents($groupId, $limit, $offset);
        $events = array_merge($events, $groupEvents);

        // Trier par date décroissante
        usort($events, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        // Appliquer la pagination après le tri
        $totalEvents = count($events);
        $events = array_slice($events, 0, $limit);

        return [
            'events' => $events,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalEvents,
                'totalPages' => ceil($totalEvents / $limit)
            ]
        ];
    }

    /**
     * Récupère les événements d'investissement
     * 
     * @param int $groupId
     * @param int $limit
     * @param int $offset
     * @return list<array<string, mixed>>
     */
    private function getInvestmentEvents(int $groupId, int $limit, int $offset): array
    {
        $conn = $this->entityManager->getConnection();
        
        $sql = "
            SELECT 
                ci.id,
                ci.amount,
                ci.currency,
                ci.funding_type,
                ci.invested_at as timestamp,
                c.denomination as company_name,
                u.email as user_email,
                'investment_added' as event_type
            FROM company_investment ci
            JOIN company c ON ci.company_id = c.id
            JOIN \"user\" u ON ci.user_id = u.id
            WHERE ci.user_group_id = :groupId
            ORDER BY ci.invested_at DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $conn->prepare($sql);
        $results = $stmt->executeQuery([
            'groupId' => $groupId,
            'limit' => $limit * 3, // Plus large pour avoir assez d'événements de chaque type
            'offset' => 0
        ])->fetchAllAssociative();

        return array_map(function($row) {
            return [
                'id' => 'investment_' . $row['id'],
                'type' => $row['event_type'],
                'timestamp' => $row['timestamp'],
                'user' => $row['user_email'],
                'details' => [
                    'company_name' => $row['company_name'],
                    'amount' => $row['amount'],
                    'currency' => $row['currency'],
                    'funding_type' => $row['funding_type']
                ]
            ];
        }, $results);
    }

    /**
     * Récupère les événements de documents
     * 
     * @param int $groupId
     * @param int $limit
     * @param int $offset
     * @return list<array<string, mixed>>
     */
    private function getDocumentEvents(int $groupId, int $limit, int $offset): array
    {
        $conn = $this->entityManager->getConnection();
        
        $sql = "
            SELECT 
                d.id,
                d.filename,
                d.add_date as timestamp,
                d.year,
                d.periodicity,
                c.denomination as company_name,
                'document_added' as event_type
            FROM document d
            JOIN company c ON d.company_id = c.id
            WHERE d.user_group_id = :groupId
            ORDER BY d.add_date DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $conn->prepare($sql);
        $results = $stmt->executeQuery([
            'groupId' => $groupId,
            'limit' => $limit * 3,
            'offset' => 0
        ])->fetchAllAssociative();

        return array_map(function($row) {
            return [
                'id' => 'document_' . $row['id'],
                'type' => $row['event_type'],
                'timestamp' => $row['timestamp'],
                'user' => 'System', // Les documents n'ont pas d'utilisateur créateur dans votre modèle actuel
                'details' => [
                    'company_name' => $row['company_name'],
                    'filename' => $row['filename'],
                    'year' => $row['year'],
                    'periodicity' => $row['periodicity']
                ]
            ];
        }, $results);
    }

    /**
     * Récupère les événements de membres
     * 
     * @param int $groupId
     * @param int $limit
     * @param int $offset
     * @return list<array<string, mixed>>
     */
    private function getMemberEvents(int $groupId, int $limit, int $offset): array
    {
        $conn = $this->entityManager->getConnection();
        
        // Événements d'ajout de membres (via les rôles créés)
        // Utilise la date de création de l'utilisateur comme approximation
        $sql = "
            SELECT 
                gr.id,
                u.created_at as timestamp,
                u.email as user_email,
                gr.role,
                'member_added' as event_type
            FROM group_role gr
            JOIN \"user\" u ON gr.user_id = u.id
            WHERE gr.user_group_id = :groupId
            AND gr.role != 'ROLE_OWNER'
            ORDER BY u.created_at DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $conn->prepare($sql);
        $results = $stmt->executeQuery([
            'groupId' => $groupId,
            'limit' => $limit * 3,
            'offset' => 0
        ])->fetchAllAssociative();

        return array_map(function($row) {
            return [
                'id' => 'member_' . $row['id'],
                'type' => $row['event_type'],
                'timestamp' => $row['timestamp'],
                'user' => 'System',
                'details' => [
                    'user_email' => $row['user_email'],
                    'role' => $row['role']
                ]
            ];
        }, $results);
    }
} 