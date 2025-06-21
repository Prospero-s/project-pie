<?php

namespace App\Controller\Api;

use App\Repository\NotificationSettingsRepository;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/api/notification-settings')]
class NotificationSettingsController extends AbstractController
{
    private UserRepository $userRepository;
    private NotificationSettingsRepository $notificationSettingsRepository;

    public function __construct(
        UserRepository $userRepository,
        NotificationSettingsRepository $notificationSettingsRepository
    ) {
        $this->userRepository = $userRepository;
        $this->notificationSettingsRepository = $notificationSettingsRepository;
    }

    #[Route('/resets', methods: ['POST'])]
    public function resetNotificationSettings(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);

            if (!$cognitoId || !$user) {
                throw new \Exception('Utilisateur non authentifié');
            }

            $settings = $this->notificationSettingsRepository->findOneBy(['userId' => $user]);

            if ($settings) {
                return new JsonResponse([
                    'message' => "Les paramètres de notification sont déjà définis."
                ], 200);
            }

            $this->notificationSettingsRepository->resetNotificationSettings($settings, $user);

            return new JsonResponse([
                'message' => "Paramètres de notification réinitialisés"
            ], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/fetch', methods: ['GET'])]
    public function fetchNotificationSettings(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);

            if (!$cognitoId || !$user) {
                throw new \Exception('Utilisateur non authentifié');
            }

            $settings = $user->getNotificationSettings();

            return new JsonResponse([
                'settings' => [
                    'email_enabled' => $settings->isEmailEnabled(),
                    'sms_enabled' => $settings->isSmsEnabled(),
                    'push_enabled' => $settings->isPushEnabled()
                ]
            ], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/update', methods: ['PUT'])]
    public function changeNotificationSettings(Request $request): JsonResponse
    {
        try {
            // Récupération et validation de l'utilisateur
            $cognitoId = $request->headers->get('x-cognito-id');
            if (!$cognitoId) {
                return new JsonResponse(['error' => 'Cognito ID manquant'], 400);
            }

            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
            if (!$user) {
                return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
            }

            $data = json_decode($request->getContent(), true);
            if (!isset($data['updatedSettings']) || !is_array($data['updatedSettings'])) {
                return new JsonResponse(['error' => 'Paramètres de notification invalides'], 400);
            }

            $settingsEntity = $user->getNotificationSettings();

            foreach ($data['updatedSettings'] as $param => $value) {
                $this->notificationSettingsRepository->changeNotificationsSettings($settingsEntity, $param);
            }

            return new JsonResponse(['message' => 'Statut des notifications mis à jour'], 200);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }
}
