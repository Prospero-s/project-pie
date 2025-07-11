<?php

namespace App\Controller\Api;

use App\Repository\UserRepository;
use App\Repository\EventLogRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/event-log')]
class EventLogController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private EventLogRepository $eventLogRepository
    ) {
    }

    #[Route('/events', name: 'get_events', methods: ['GET'])]
    public function getEvents(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            if (!$cognitoId) {
                return $this->json(['error' => 'Utilisateur non authentifié'], 401);
            }

            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
            if (!$user || !$user->getUserGroup()) {
                return $this->json(['error' => 'Utilisateur ou groupe non trouvé'], 404);
            }

            $userGroup = $user->getUserGroup();

            // Paramètres de pagination
            $page = $request->query->getInt('page', 1);
            $limit = $request->query->getInt('limit', 20);

            // Récupérer les événements via le repository
            $result = $this->eventLogRepository->getGroupEvents($userGroup->getId(), $page, $limit);

            return $this->json($result);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la récupération des événements',
                'message' => $e->getMessage()
            ], 500);
        }
    }
} 