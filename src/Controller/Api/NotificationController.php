<?php

namespace App\Controller\Api;

use App\Enum\NotificationType;
use App\Repository\NotificationsRepository;
use App\Repository\UserNotificationsRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/api/notifications')]
class NotificationController extends AbstractController
{
    private UserRepository $userRepository;
    private NotificationsRepository $notificationsRepository;
    private UserNotificationsRepository $userNotificationsRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        UserRepository $userRepository,
        NotificationsRepository $notificationsRepository,
        UserNotificationsRepository $userNotificationsRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->userRepository = $userRepository;
        $this->notificationsRepository = $notificationsRepository;
        $this->userNotificationsRepository = $userNotificationsRepository;
        $this->entityManager = $entityManager;
    }

    #[Route('/fetch', methods: ['GET'])]
    public function fetchNotifications(Request $request): JsonResponse
    {
        $cognitoId = $request->headers->get('x-cognito-id');
        $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);

        if (!$cognitoId || !$user) {
            throw new \Exception('Utilisateur non authentifié');
        }

        try {
            $notifications = [];

            foreach ($user->getUserNotifications() as $userNotification) {
                $notification = $userNotification->getNotification();
                if ($notification) {
                    $notifications[] = [
                        'id' => $notification->getId(),
                        'title' => $notification->getTitle(),
                        'message' => $notification->getMessage(),
                        'created_at' => $notification->getCreatedAt(),
                        'received_at' => $userNotification->getReceivedAt(),
                        'read_at' => $userNotification->getReadAt(),
                        'deleted_at' => $userNotification->getDeletedAt(),
                        'status' => $userNotification->getStatus(),
                        'type' => $notification->getType(),
                    ];
                }
            }

            return new JsonResponse([
                'notifications' => $notifications
            ], 200);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/getTypes', methods: ['GET'])]
    public function getNotificationTypes(Request $request): JsonResponse
    {
        try {
            return new JsonResponse([
                'types' => new JsonResponse(NotificationType::cases())
            ], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/send', methods: ['POST'])]
    public function sendNotification(Request $request): JsonResponse
    {
        $cognitoId = $request->headers->get('x-cognito-id');
        $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
        if (!$cognitoId || !$user) {
            throw new \Exception('Utilisateur non authentifié');
        }

        $data = json_decode($request->getContent(), true);

        $title = $data['title'];
        $message = $data['message'];
        $type = $data['type'];
        $to = $this->userRepository->findOneBy(['email' => $data['to']]);

        if (!$to) {
            throw new \Exception('Utilisateur non existant');
        }

        if (!in_array($type, array_column(NotificationType::cases(), 'value'))) {
            throw new \Exception('Type de notification non supporté');
        }

        $notification = $this->notificationsRepository->add($title, $message, $type);
        $this->userNotificationsRepository->send($to, $notification);

        try {
            return new JsonResponse([
                'message' => 'Notification envoyé'
            ], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/{id}/read', methods: ['PUT'])]
    public function markAsRead(int $id, Request $request): JsonResponse
    {
        $cognitoId = $request->headers->get('x-cognito-id');
        $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);

        if (!$cognitoId || !$user) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
        }

        try {
            // Trouver la UserNotification correspondante
            $userNotification = $this->userNotificationsRepository
                ->createQueryBuilder('un')
                ->join('un.notification', 'n')
                ->where('n.id = :notificationId')
                ->andWhere('un.userId = :user')
                ->setParameter('notificationId', $id)
                ->setParameter('user', $user)
                ->getQuery()
                ->getOneOrNullResult();

            if (!$userNotification) {
                return new JsonResponse(['error' => 'Notification non trouvée'], 404);
            }

            // Marquer comme lue si pas déjà lu
            if (!$userNotification->getReadAt()) {
                $userNotification->setReadAt(new \DateTime());
                $this->entityManager->flush();
            }

            return new JsonResponse(['message' => 'Notification marquée comme lue']);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/read-all', methods: ['PUT'])]
    public function markAllAsRead(Request $request): JsonResponse
    {
        $cognitoId = $request->headers->get('x-cognito-id');
        $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);

        if (!$cognitoId || !$user) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
        }

        try {
            // Récupérer toutes les notifications non lues de l'utilisateur
            $unreadNotifications = $this->userNotificationsRepository
                ->createQueryBuilder('un')
                ->where('un.userId = :user')
                ->andWhere('un.readAt IS NULL')
                ->setParameter('user', $user)
                ->getQuery()
                ->getResult();

            $count = 0;
            foreach ($unreadNotifications as $userNotification) {
                $userNotification->setReadAt(new \DateTime());
                $count++;
            }

            if ($count > 0) {
                $this->entityManager->flush();
            }

            return new JsonResponse([
                'message' => "Toutes les notifications marquées comme lues",
                'count' => $count
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}
