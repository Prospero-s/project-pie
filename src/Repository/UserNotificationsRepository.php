<?php

namespace App\Repository;

use App\Entity\Notifications;
use App\Entity\User;
use App\Entity\UserNotifications;
use App\Enum\NotificationStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserNotifications>
 */
class UserNotificationsRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $em;

    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, UserNotifications::class);
        $this->em = $em;
    }

    public function send(User $to, Notifications $notification): void
    {
        $userNotification = new UserNotifications();
        $userNotification->setUserId($to);
        $userNotification->setNotification($notification);
        $userNotification->setStatus(NotificationStatus::SENT->getValue());
        $userNotification->setDeletedAt(null);
        $userNotification->setReadAt(null);
        $userNotification->setReceivedAt(new \DateTimeImmutable());
        $this->em->persist($userNotification);
        $this->em->flush();
    }
}
