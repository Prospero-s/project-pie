<?php

namespace App\Repository;

use App\Entity\Notifications;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Notifications>
 */
class NotificationsRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $em;

    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, Notifications::class);
        $this->em = $em;
    }
    
    public function add(string $title, string $message, string $type): Notifications
    {
        $notification = new Notifications;
        $notification->setTitle($title);
        $notification->setMessage($message);
        $notification->setType($type);
        $notification->setCreatedAt(new \DateTimeImmutable());
        $this->em->persist($notification);
        $this->em->flush();
        return $notification;
    }
}
