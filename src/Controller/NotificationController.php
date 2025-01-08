<?php

namespace App\Controller;

use App\Entity\Notification;
use App\Entity\Reminder;
use App\Entity\User;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class NotificationController extends AbstractController
{
    
    #[Route('/notif/{userId}', name: 'notif_list', methods: ['GET'])]
    public function list(User $userId, NotificationRepository $notifRepository): Response
    {
        $notifs = $notifRepository->findAll(['userId' => $userId]);

        if (!$notifs) {
            return $this->json(['error' => 'Notifications not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($notifs, Response::HTTP_OK, [], [
            'groups' => ['notif:read']
        ]);
    }

    #[Route('/notif/{id}', name: 'notif_show', methods: ['GET'])]
    public function show(int $id, NotificationRepository $notifRepository): Response
    {
        $notif = $notifRepository->find($id);

        if (!$notif) {
            return $this->json(['error' => 'Notification not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($notif, Response::HTTP_OK, [], [
            'groups' => ['notif:read']
        ]);
    }

    #[Route('/notif', name: 'notif_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): Response
    {
        $data = json_decode($request->getContent(), true);

        $notif = new Notification();
        $this->setNotificationData($notif, $data, $em);

        $em->persist($notif);
        $em->flush();

        return $this->json($notif, Response::HTTP_CREATED, [], [
            'groups' => ['notif:read']
        ]);
    }

    #[Route('/notif/{id}', name: 'notif_update', methods: ['PUT'])]
    public function update(int $id, Request $request, NotificationRepository $notifRepository, EntityManagerInterface $em): Response
    {
        $notif = $notifRepository->find($id);

        if (!$notif) {
            return $this->json(['error' => 'Notification not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $this->setNotificationData($notif, $data, $em);

        $em->flush();

        return $this->json($notif, Response::HTTP_OK, [], [
            'groups' => ['notif:read']
        ]);
    }

    #[Route('/notif/{id}', name: 'notif_delete', methods: ['DELETE'])]
    public function delete(int $id, NotificationRepository $notifRepository, EntityManagerInterface $em): Response
    {
        $notif = $notifRepository->find($id);

        if (!$notif) {
            return $this->json(['error' => 'Notification not found'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($notif);
        $em->flush();

        return $this->json(['message' => 'Notification deleted successfully'], Response::HTTP_OK);
    }

    private function setNotificationData(Notification $notif, array $data, EntityManagerInterface $em): void
    {
        if (isset($data['proc_date'])) {
            $notif->setProcDate(new \DateTime($data['proc_date']));
        }
        if (isset($data['is_read'])) {
            $notif->setRead($data['is_read']);
        }
        if (isset($data['type'])) {
            $notif->setType($data['type']);
        }
        if (isset($data['title'])) {
            $notif->setTitle($data['title']);
        }
        if (isset($data['description'])) {
            $notif->setDescription($data['description']);
        }
        if (isset($data['id_reminder'])) {
            $reminder = $em->getRepository(Reminder::class)->find($data['id_reminder']);
            $notif->setReminder($reminder);
        }
        if (isset($data['user_id'])) {
            $user = $em->getRepository(User::class)->find($data['user_id']);
            $notif->setUserId($user);
        }
    }
}
