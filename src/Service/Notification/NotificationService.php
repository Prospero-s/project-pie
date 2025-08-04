<?php

namespace App\Service\Notification;

use App\Entity\UserGroup;
use App\Entity\User;
use App\Repository\NotificationsRepository;
use App\Repository\UserNotificationsRepository;

class NotificationService
{
    public function __construct(
        private NotificationsRepository $notificationsRepository,
        private UserNotificationsRepository $userNotificationsRepository
    ) {
    }

    /**
     * Envoie une notification à tous les membres d'un groupe
     */
    public function sendNotificationToGroup(
        UserGroup $group,
        string $title,
        string $message,
        string $type,
        ?User $excludeUser = null
    ): void {
        // Créer la notification
        $notification = $this->notificationsRepository->add($title, $message, $type);

        // Envoyer à tous les membres du groupe sauf l'utilisateur exclu (optionnel)
        foreach ($group->getUsers() as $member) {
            if ($excludeUser && $member->getId() === $excludeUser->getId()) {
                continue;
            }
            
            $this->userNotificationsRepository->send($member, $notification);
        }
    }

    /**
     * Envoie une notification à un utilisateur spécifique
     */
    public function sendNotificationToUser(
        User $user,
        string $title,
        string $message,
        string $type
    ): void {
        $notification = $this->notificationsRepository->add($title, $message, $type);
        $this->userNotificationsRepository->send($user, $notification);
    }
} 