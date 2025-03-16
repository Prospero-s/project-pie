<?php

namespace App\Repository;

use App\Entity\NotificationSettings;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<NotificationSettings>
 */
class NotificationSettingsRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $em;

    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, NotificationSettings::class);
        $this->em = $em;
    }

    /**
     * Reset user's notifications settings
     * @param mixed $settings
     * @param User $user
     * @return void
     */
    public function resetNotificationSettings(?NotificationSettings $settings, User $user)
    {
        $settings = $settings ?? new NotificationSettings();
        $settings->setUserId($user);
        $settings->setEmailEnabled(true);
        $settings->setSmsEnabled(true);
        $settings->setPushEnabled(true);
        $settings->setUpdatedAt(new \DateTime());

        $this->em->persist($settings);
        $this->em->flush();
    }
}
